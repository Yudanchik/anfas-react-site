<?php
// Local production-build QA only: php -S 127.0.0.1:4173 scripts/estimate-dev-router.php
$root = dirname(__DIR__) . '/build/client';
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if (preg_match('/(\.local\.php|\.inc\.php|\.example\.php)$/', $path)) { http_response_code(403); exit; }
if (str_starts_with($path, '/assets/estimate-private/')) {
    $_GET['file'] = substr($path, strlen('/assets/estimate-private/'));
    require $root . '/api/estimate-asset.php';
    exit;
}
$file = realpath($root . $path);
if ($file && str_starts_with($file, realpath($root) . DIRECTORY_SEPARATOR) && is_file($file)) {
    if (str_ends_with($file, '.php')) { require $file; exit; }
    $types = ['js' => 'application/javascript', 'css' => 'text/css', 'svg' => 'image/svg+xml', 'png' => 'image/png', 'webp' => 'image/webp', 'woff2' => 'font/woff2', 'ttf' => 'font/ttf', 'json' => 'application/json', 'html' => 'text/html'];
    header('Content-Type: ' . ($types[pathinfo($file, PATHINFO_EXTENSION)] ?? 'application/octet-stream'));
    readfile($file); exit;
}
header('Content-Type: text/html; charset=utf-8');
readfile($root . '/__spa-fallback.html');
