<?php
declare(strict_types=1);
require __DIR__ . '/estimate-session.inc.php';
estimate_require_admin(estimate_config());
session_write_close();
$file = $_GET['file'] ?? '';
if (!is_string($file) || !preg_match('/\A[a-zA-Z0-9_-]+\.(js|css)\z/D', $file)) estimate_reply(404, ['error' => 'Файл не найден.']);
$path = __DIR__ . '/../assets/estimate-private/' . $file;
if (!is_file($path)) estimate_reply(404, ['error' => 'Файл не найден.']);
header('Content-Type: ' . (str_ends_with($file, '.css') ? 'text/css' : 'application/javascript') . '; charset=utf-8');
header('Content-Length: ' . filesize($path));
readfile($path);
