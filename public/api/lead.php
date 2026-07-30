<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type');
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
  exit;
}

$configPath = __DIR__ . '/config.local.php';
if (!is_file($configPath)) {
  http_response_code(503);
  echo json_encode([
    'ok' => false,
    'error' => 'Mail config is missing. Copy config.example.php to config.local.php on the server.',
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

/** @var array<string, mixed> $config */
$config = require $configPath;

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Invalid JSON'], JSON_UNESCAPED_UNICODE);
  exit;
}

// Honeypot: real users leave this empty
if (!empty($data['company'])) {
  echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
  exit;
}

$name = trim((string) ($data['name'] ?? ''));
$phone = trim((string) ($data['phone'] ?? ''));
$service = trim((string) ($data['service'] ?? ''));
$wishes = trim((string) ($data['wishes'] ?? ''));
$email = trim((string) ($data['email'] ?? ''));
$intent = trim((string) ($data['intent'] ?? ''));
$source = trim((string) ($data['source'] ?? 'site'));
$startedAt = (int) ($data['startedAt'] ?? 0);
$isPriceList = $intent === 'price-list';

$minSeconds = (int) ($config['min_submit_seconds'] ?? 2);
if ($startedAt > 0 && (time() - $startedAt) < $minSeconds) {
  http_response_code(429);
  echo json_encode(['ok' => false, 'error' => 'Too fast'], JSON_UNESCAPED_UNICODE);
  exit;
}

if (mb_strlen($name) < 2 || mb_strlen($name) > 48) {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'Invalid name'], JSON_UNESCAPED_UNICODE);
  exit;
}

$phoneDigits = preg_replace('/\D+/', '', $phone) ?? '';
if (strlen($phoneDigits) !== 11) {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'Invalid phone'], JSON_UNESCAPED_UNICODE);
  exit;
}

$allowedServices = [
  'general' => 'Консультация',
  'individual' => 'Индивидуальный ремонт',
  'package' => 'Пакетный ремонт',
];

if (!isset($allowedServices[$service])) {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'Invalid service'], JSON_UNESCAPED_UNICODE);
  exit;
}

if (mb_strlen($wishes) > 600) {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'Wishes too long'], JSON_UNESCAPED_UNICODE);
  exit;
}

// Email обязателен и валидируется только для заявок на прайс-лист:
// ссылка на скачивание отправляется именно на этот адрес.
if ($isPriceList) {
  if ($email === '' || mb_strlen($email) > 120 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Invalid email'], JSON_UNESCAPED_UNICODE);
    exit;
  }

  if (!priceListRateLimitAllowed($config)) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => 'Too many requests, try later'], JSON_UNESCAPED_UNICODE);
    exit;
  }
}

$serviceLabel = $allowedServices[$service];
$when = (new DateTimeImmutable('now', new DateTimeZone('Europe/Moscow')))->format('d.m.Y H:i');
$page = trim((string) ($data['page'] ?? ''));
$calculatorLines = formatCalculatorLines($data['calculator'] ?? null);

$subject = $isPriceList
  ? 'Заявка на прайс-лист с сайта Анфас'
  : 'Заявка с сайта Анфас — ' . $serviceLabel;
$bodyText = implode("\n", array_filter([
  'Новая заявка с сайта anfas',
  '',
  $isPriceList ? 'Тип заявки: запрос полного прайс-листа' : null,
  'Имя: ' . $name,
  'Телефон: ' . $phone,
  $isPriceList ? 'Email: ' . $email : null,
  'Услуга: ' . $serviceLabel,
  $wishes !== '' ? 'Пожелания: ' . $wishes : null,
  $calculatorLines !== '' ? $calculatorLines : null,
  $source !== '' ? 'Источник формы: ' . $source : null,
  $page !== '' ? 'Страница: ' . $page : null,
  'Время (МСК): ' . $when,
]));

$to = (string) ($config['to'] ?? '');
$from = (string) ($config['from'] ?? $to);
$fromName = (string) ($config['from_name'] ?? 'Сайт Анфас');

if ($to === '' || $from === '') {
  http_response_code(503);
  echo json_encode(['ok' => false, 'error' => 'Mail addresses are not configured'], JSON_UNESCAPED_UNICODE);
  exit;
}

// Для заявки на прайс ссылку на скачивание собираем до отправки писем,
// чтобы не уведомлять офис о заявке, которую не сможем довести до конца.
$priceDownload = null;
if ($isPriceList) {
  $priceDownload = buildPriceDownloadLink($config);
  if ($priceDownload === null) {
    http_response_code(503);
    echo json_encode(['ok' => false, 'error' => 'Price list delivery is not configured'], JSON_UNESCAPED_UNICODE);
    exit;
  }
}

$smtp = is_array($config['smtp'] ?? null) ? $config['smtp'] : [];
$smtpEnabled = !empty($smtp['enabled']);

try {
  if ($smtpEnabled) {
    sendViaSmtp($smtp, $to, $from, $fromName, $subject, $bodyText, $name, $phone);
  } else {
    sendViaMail($to, $from, $fromName, $subject, $bodyText);
  }
} catch (Throwable $e) {
  http_response_code(502);
  echo json_encode(['ok' => false, 'error' => 'Failed to send email'], JSON_UNESCAPED_UNICODE);
  exit;
}

// Офис уже уведомлён о лиде. Дальше — отдельное письмо клиенту со ссылкой;
// его сбой не должен «отменять» уже доставленное уведомление офису.
if ($isPriceList && $priceDownload !== null) {
  $clientSubject = 'Ваш прайс-лист компании Анфас';
  $clientText = buildPriceListClientEmailText($name, $priceDownload['url'], $priceDownload['exp']);
  $clientHtml = buildPriceListClientEmailHtml($name, $priceDownload['url'], $priceDownload['exp']);

  try {
    if ($smtpEnabled) {
      sendViaSmtp($smtp, $email, $from, $fromName, $clientSubject, $clientText, '', '', $clientHtml);
    } else {
      sendViaMail($email, $from, $fromName, $clientSubject, $clientText, $clientHtml);
    }
  } catch (Throwable $e) {
    http_response_code(502);
    echo json_encode([
      'ok' => false,
      'error' => 'Заявку получили, но не удалось отправить письмо со ссылкой. Мы свяжемся с вами.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
  }
}

echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
exit;

/**
 * @param mixed $calculator
 */
function formatCalculatorLines($calculator): string {
  if (!is_array($calculator)) {
    return '';
  }

  $lines = ['Параметры калькулятора:'];

  $append = static function (string $label, mixed $value) use (&$lines): void {
    if (!is_string($value)) {
      return;
    }

    $value = trim($value);
    if ($value === '') {
      return;
    }

    $lines[] = $label . ': ' . $value;
  };

  $append('Формат', $calculator['modeLabel'] ?? null);
  $append('Площадь', isset($calculator['area']) ? ((string) $calculator['area']) . ' м²' : null);
  $append('Тип объекта', $calculator['propertyLabel'] ?? null);
  $append('Комплектация', $calculator['packageLabel'] ?? null);
  $append('Уровень отделки', $calculator['finishLabel'] ?? null);
  $append('Сложность проекта', $calculator['complexityLabel'] ?? null);

  if (!empty($calculator['extraWorks']) && is_array($calculator['extraWorks'])) {
    $extraWorks = array_values(array_filter(array_map(
      static fn ($item) => is_string($item) ? trim($item) : '',
      $calculator['extraWorks']
    )));

    if ($extraWorks !== []) {
      $lines[] = 'Дополнительные работы: ' . implode(', ', $extraWorks);
    }
  }

  $priceLabel = trim((string) ($calculator['priceLabel'] ?? ''));
  $priceValue = trim((string) ($calculator['priceValue'] ?? ''));
  if ($priceLabel !== '' && $priceValue !== '') {
    $lines[] = $priceLabel . ': ' . $priceValue;
  } elseif ($priceValue !== '') {
    $lines[] = 'Ориентир стоимости: ' . $priceValue;
  }

  $append('Срок', $calculator['duration'] ?? null);
  $append('Ставка', $calculator['rateText'] ?? null);

  if (count($lines) <= 1) {
    return '';
  }

  return implode("\n", $lines);
}

/**
 * Собирает MIME-заголовки и тело письма: обычный текст,
 * либо multipart/alternative (текст + HTML), если передан $htmlBody.
 *
 * @return array{headers: string[], body: string}
 */
function buildMailParts(string $textBody, ?string $htmlBody): array {
  if ($htmlBody === null) {
    return [
      'headers' => [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
      ],
      'body' => chunk_split(base64_encode($textBody)),
    ];
  }

  $boundary = 'b_' . bin2hex(random_bytes(16));
  $body = "--{$boundary}\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\n"
    . "Content-Transfer-Encoding: base64\r\n\r\n"
    . chunk_split(base64_encode($textBody)) . "\r\n"
    . "--{$boundary}\r\n"
    . "Content-Type: text/html; charset=UTF-8\r\n"
    . "Content-Transfer-Encoding: base64\r\n\r\n"
    . chunk_split(base64_encode($htmlBody)) . "\r\n"
    . "--{$boundary}--";

  return [
    'headers' => [
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
    ],
    'body' => $body,
  ];
}

/**
 * @param array<string, mixed> $smtp
 */
function sendViaSmtp(
  array $smtp,
  string $to,
  string $from,
  string $fromName,
  string $subject,
  string $textBody,
  string $replyName = '',
  string $replyPhone = '',
  ?string $htmlBody = null
): void {
  $host = (string) ($smtp['host'] ?? '');
  $port = (int) ($smtp['port'] ?? 465);
  $encryption = strtolower((string) ($smtp['encryption'] ?? 'ssl'));
  $username = (string) ($smtp['username'] ?? '');
  $password = (string) ($smtp['password'] ?? '');

  if ($host === '' || $username === '' || $password === '') {
    throw new RuntimeException('SMTP is not configured');
  }

  $remote = ($encryption === 'ssl' ? 'ssl://' : '') . $host . ':' . $port;
  $fp = @stream_socket_client($remote, $errno, $errstr, 20, STREAM_CLIENT_CONNECT);
  if (!$fp) {
    throw new RuntimeException("SMTP connect failed: $errstr ($errno)");
  }

  try {
    stream_set_timeout($fp, 20);
    smtpExpect($fp, 220);
    smtpCommand($fp, 'EHLO anfas-site', 250);

    if ($encryption === 'tls') {
      smtpCommand($fp, 'STARTTLS', 220);
      if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        throw new RuntimeException('STARTTLS failed');
      }
      smtpCommand($fp, 'EHLO anfas-site', 250);
    }

    smtpCommand($fp, 'AUTH LOGIN', 334);
    smtpCommand($fp, base64_encode($username), 334);
    smtpCommand($fp, base64_encode($password), 235);
    smtpCommand($fp, 'MAIL FROM:<' . $from . '>', 250);
    smtpCommand($fp, 'RCPT TO:<' . $to . '>', 250);
    smtpCommand($fp, 'DATA', 354);

    $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $messageId = sprintf('<%s@%s>', bin2hex(random_bytes(12)), parse_url('http://' . $host, PHP_URL_HOST) ?: 'localhost');
    $mime = buildMailParts($textBody, $htmlBody);

    $headers = [
      'Date: ' . date('r'),
      'From: ' . $encodedFromName . ' <' . $from . '>',
      'To: <' . $to . '>',
      'Reply-To: ' . $encodedFromName . ' <' . $from . '>',
      'Subject: ' . $encodedSubject,
      'Message-ID: ' . $messageId,
      ...$mime['headers'],
    ];

    if ($replyName !== '') {
      $headers[] = 'X-Lead-Name: ' . preg_replace('/[\r\n]+/', ' ', $replyName);
    }
    if ($replyPhone !== '') {
      $headers[] = 'X-Lead-Phone: ' . preg_replace('/[\r\n]+/', ' ', $replyPhone);
    }

    $data = implode("\r\n", $headers) . "\r\n\r\n" . $mime['body'] . "\r\n.";
    fwrite($fp, $data . "\r\n");
    smtpExpect($fp, 250);
    smtpCommand($fp, 'QUIT', 221);
  } finally {
    fclose($fp);
  }
}

function sendViaMail(
  string $to,
  string $from,
  string $fromName,
  string $subject,
  string $textBody,
  ?string $htmlBody = null
): void {
  $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';
  $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
  $mime = buildMailParts($textBody, $htmlBody);
  $headers = [
    'From: ' . $encodedFromName . ' <' . $from . '>',
    'Reply-To: ' . $encodedFromName . ' <' . $from . '>',
    ...$mime['headers'],
  ];

  $ok = mail($to, $encodedSubject, $mime['body'], implode("\r\n", $headers));
  if (!$ok) {
    throw new RuntimeException('mail() failed');
  }
}

/**
 * Готовит HMAC-подписанную временную ссылку на скачивание прайса.
 * Ссылка не содержит контактов пользователя — только случайный id, срок и подпись.
 *
 * @param array<string, mixed> $config
 * @return array{url: string, exp: int}|null
 */
function buildPriceDownloadLink(array $config): ?array {
  $secret = (string) ($config['price_link_secret'] ?? '');
  $ttl = (int) ($config['price_link_ttl'] ?? 0);
  $siteUrl = rtrim((string) ($config['public_site_url'] ?? ''), '/');

  if ($secret === '' || $ttl <= 0 || $siteUrl === '') {
    return null;
  }

  $id = bin2hex(random_bytes(16));
  $exp = time() + $ttl;
  $sig = hash_hmac('sha256', $id . '|' . $exp, $secret);

  $url = $siteUrl . '/api/price-download.php?' . http_build_query([
    'id' => $id,
    'exp' => $exp,
    'sig' => $sig,
  ]);

  return ['url' => $url, 'exp' => $exp];
}

/**
 * Файловый rate limit заявок на прайс-лист по HMAC-хэшу IP (не по сырому адресу).
 * При отсутствующей/неработающей конфигурации не блокирует легитимные заявки.
 *
 * @param array<string, mixed> $config
 */
function priceListRateLimitAllowed(array $config): bool {
  $rateLimit = is_array($config['price_rate_limit'] ?? null) ? $config['price_rate_limit'] : [];
  $maxRequests = (int) ($rateLimit['max_requests'] ?? 0);
  $windowSeconds = (int) ($rateLimit['window_seconds'] ?? 0);
  $storagePath = (string) ($rateLimit['storage_path'] ?? '');

  if ($maxRequests <= 0 || $windowSeconds <= 0 || $storagePath === '') {
    return true;
  }

  if (!is_dir($storagePath) && !@mkdir($storagePath, 0700, true) && !is_dir($storagePath)) {
    return true;
  }

  $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
  if ($ip === '') {
    return true;
  }

  $secret = (string) ($config['price_link_secret'] ?? 'anfas-price-rate-limit');
  $ipHash = hash_hmac('sha256', $ip, $secret);
  $file = rtrim($storagePath, '/\\') . DIRECTORY_SEPARATOR . $ipHash . '.json';

  $handle = @fopen($file, 'c+');
  if (!$handle) {
    return true;
  }

  $allowed = true;

  if (flock($handle, LOCK_EX)) {
    $raw = stream_get_contents($handle);
    $state = is_string($raw) && $raw !== '' ? json_decode($raw, true) : null;
    $now = time();
    $windowStart = is_array($state) ? (int) ($state['windowStart'] ?? 0) : 0;
    $count = is_array($state) ? (int) ($state['count'] ?? 0) : 0;

    if ($windowStart <= 0 || ($now - $windowStart) > $windowSeconds) {
      $windowStart = $now;
      $count = 0;
    }

    $count++;
    $allowed = $count <= $maxRequests;

    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode(['windowStart' => $windowStart, 'count' => $count], JSON_UNESCAPED_UNICODE));
    fflush($handle);
    flock($handle, LOCK_UN);
  }

  fclose($handle);

  return $allowed;
}

function buildPriceListClientEmailText(string $name, string $url, int $exp): string {
  $expiresAt = (new DateTimeImmutable('@' . $exp))
    ->setTimezone(new DateTimeZone('Europe/Moscow'))
    ->format('d.m.Y H:i');
  $greeting = $name !== '' ? 'Здравствуйте, ' . $name . '!' : 'Здравствуйте!';

  return implode("\n", [
    $greeting,
    '',
    'Вы запросили полный прайс-лист компании Анфас на сайте anfas-remont.ru.',
    'Скачать файл можно по ссылке ниже. Ссылка действует до ' . $expiresAt . ' (МСК):',
    $url,
    '',
    'Если срок действия ссылки истёк — запросите прайс на сайте ещё раз.',
    'Есть вопросы по ценам или проекту? Звоните: +7 (812) 200-80-71.',
    '',
    'С уважением, компания Анфас',
  ]);
}

function buildPriceListClientEmailHtml(string $name, string $url, int $exp): string {
  $expiresAt = (new DateTimeImmutable('@' . $exp))
    ->setTimezone(new DateTimeZone('Europe/Moscow'))
    ->format('d.m.Y H:i');
  $greeting = $name !== '' ? 'Здравствуйте, ' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . '!' : 'Здравствуйте!';
  $safeUrl = htmlspecialchars($url, ENT_QUOTES, 'UTF-8');

  return <<<HTML
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f6f3ee;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f3ee;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background-color:#1a1a1a;padding:24px 32px;">
              <span style="color:#b6935f;font-size:14px;letter-spacing:2px;text-transform:uppercase;">Анфас</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#1a1a1a;font-size:15px;line-height:1.6;">
              <p style="margin:0 0 16px;">{$greeting}</p>
              <p style="margin:0 0 24px;">Вы запросили полный прайс-лист компании Анфас на сайте. Скачать файл можно по кнопке ниже.</p>
              <p style="margin:0 0 24px;text-align:center;">
                <a href="{$safeUrl}" style="display:inline-block;background-color:#b6935f;color:#1a1a1a;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px;">Скачать прайс-лист</a>
              </p>
              <p style="margin:0 0 16px;color:#5c5b57;font-size:13px;">Ссылка действует до {$expiresAt} (МСК). Если срок истёк — запросите прайс на сайте ещё раз.</p>
              <p style="margin:0;color:#5c5b57;font-size:13px;">Есть вопросы по ценам или проекту? Звоните: +7 (812) 200-80-71.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
}

/**
 * @param resource $fp
 */
function smtpCommand($fp, string $command, int $expect): void {
  fwrite($fp, $command . "\r\n");
  smtpExpect($fp, $expect);
}

/**
 * @param resource $fp
 */
function smtpExpect($fp, int $expect): void {
  $response = '';
  while (($line = fgets($fp, 512)) !== false) {
    $response .= $line;
    if (isset($line[3]) && $line[3] === ' ') {
      break;
    }
  }

  $code = (int) substr($response, 0, 3);
  if ($code !== $expect) {
    throw new RuntimeException("Unexpected SMTP response: $response");
  }
}
