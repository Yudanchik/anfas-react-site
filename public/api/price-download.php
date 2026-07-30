<?php
declare(strict_types=1);

/**
 * Выдача полного прайс-листа по временной HMAC-подписанной ссылке.
 *
 * Ссылка не привязана к какой-либо записи в БД (её тут нет): она самодостаточна —
 * id/exp/sig проверяются пересчётом подписи по секрету из config.local.php.
 * Сам PDF лежит вне web root, путь известен только серверу.
 */

function respondError(int $status, string $message): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  header('X-Content-Type-Options: nosniff');
  header('X-Robots-Tag: noindex, nofollow, noarchive');
  header('Cache-Control: private, no-store');
  echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
  exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
  respondError(405, 'Method not allowed');
}

$configPath = __DIR__ . '/config.local.php';
if (!is_file($configPath)) {
  respondError(503, 'Downloads are not configured');
}

/** @var array<string, mixed> $config */
$config = require $configPath;

$secret = (string) ($config['price_link_secret'] ?? '');
$pdfPath = (string) ($config['price_pdf_path'] ?? '');

if ($secret === '' || $pdfPath === '') {
  respondError(503, 'Downloads are not configured');
}

$id = isset($_GET['id']) ? (string) $_GET['id'] : '';
$expRaw = isset($_GET['exp']) ? (string) $_GET['exp'] : '';
$sig = isset($_GET['sig']) ? (string) $_GET['sig'] : '';

// id — hex(random_bytes(16)), sig — hex(hash_hmac('sha256', ...)); строгий формат отсекает мусор до сравнения подписи.
if (!preg_match('/^[a-f0-9]{32}$/', $id) || !preg_match('/^\d{1,20}$/', $expRaw) || !preg_match('/^[a-f0-9]{64}$/', $sig)) {
  respondError(400, 'Invalid link');
}

$exp = (int) $expRaw;
$expectedSig = hash_hmac('sha256', $id . '|' . $exp, $secret);

// timing-safe сравнение подписи — подмена id/exp/sig не должна давать доступ.
if (!hash_equals($expectedSig, $sig)) {
  respondError(403, 'Invalid link');
}

if ($exp < time()) {
  respondError(410, 'Link expired');
}

if (!is_file($pdfPath) || !is_readable($pdfPath)) {
  // Не раскрываем серверный путь — только факт недоступности файла.
  respondError(404, 'File is not available');
}

// @ подавляет предупреждение PHP, которое иначе могло бы попасть в ответ и раскрыть путь к файлу.
$fileSize = @filesize($pdfPath);

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="anfas-price-list.pdf"');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('Cache-Control: private, no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
if ($fileSize !== false) {
  header('Content-Length: ' . (string) $fileSize);
}

while (ob_get_level() > 0) {
  ob_end_clean();
}

// @ подавляет предупреждение PHP при сбое чтения — оно попало бы прямо в тело ответа
// (заголовки уже отправлены) и могло раскрыть абсолютный путь к файлу.
@readfile($pdfPath);
exit;
