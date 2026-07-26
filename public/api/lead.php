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
$source = trim((string) ($data['source'] ?? 'site'));
$startedAt = (int) ($data['startedAt'] ?? 0);

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

$serviceLabel = $allowedServices[$service];
$when = (new DateTimeImmutable('now', new DateTimeZone('Europe/Moscow')))->format('d.m.Y H:i');
$page = trim((string) ($data['page'] ?? ''));

$subject = 'Заявка с сайта Анфас — ' . $serviceLabel;
$bodyText = implode("\n", array_filter([
  'Новая заявка с сайта anfas',
  '',
  'Имя: ' . $name,
  'Телефон: ' . $phone,
  'Услуга: ' . $serviceLabel,
  $wishes !== '' ? 'Пожелания: ' . $wishes : null,
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

echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
exit;

/**
 * @param array<string, mixed> $smtp
 */
function sendViaSmtp(
  array $smtp,
  string $to,
  string $from,
  string $fromName,
  string $subject,
  string $body,
  string $replyName,
  string $replyPhone
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

  $headers = [
    'Date: ' . date('r'),
    'From: ' . $encodedFromName . ' <' . $from . '>',
    'To: <' . $to . '>',
    'Reply-To: ' . $encodedFromName . ' <' . $from . '>',
    'Subject: ' . $encodedSubject,
    'Message-ID: ' . $messageId,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    'X-Lead-Name: ' . preg_replace('/[\r\n]+/', ' ', $replyName),
    'X-Lead-Phone: ' . preg_replace('/[\r\n]+/', ' ', $replyPhone),
  ];

  $data = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($body)) . "\r\n.";
  fwrite($fp, $data . "\r\n");
  smtpExpect($fp, 250);
  smtpCommand($fp, 'QUIT', 221);
  fclose($fp);
}

function sendViaMail(string $to, string $from, string $fromName, string $subject, string $body): void {
  $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';
  $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
  $headers = [
    'From: ' . $encodedFromName . ' <' . $from . '>',
    'Reply-To: ' . $encodedFromName . ' <' . $from . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  ];

  $ok = mail($to, $encodedSubject, chunk_split(base64_encode($body)), implode("\r\n", $headers));
  if (!$ok) {
    throw new RuntimeException('mail() failed');
  }
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
