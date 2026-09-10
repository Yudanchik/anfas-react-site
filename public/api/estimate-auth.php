<?php
declare(strict_types=1);
require __DIR__ . '/estimate-session.inc.php';
$config = estimate_config();
estimate_session($config);
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'GET') {
    if (!empty($_SESSION['admin'])) $_SESSION['last_seen'] = time();
    estimate_reply(200, ['authenticated' => !empty($_SESSION['admin']), 'csrf' => $_SESSION['csrf']]);
}
if ($method !== 'POST') { header('Allow: GET, POST'); estimate_reply(405, ['error' => 'Метод не поддерживается.']); }
estimate_csrf();
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 4096) estimate_reply(413, ['error' => 'Запрос слишком большой.']);
$raw = file_get_contents('php://input', false, null, 0, 4097);
if (strlen($raw) > 4096) estimate_reply(413, ['error' => 'Запрос слишком большой.']);
$data = json_decode($raw, true);
if (!is_array($data)) estimate_reply(400, ['error' => 'Некорректный запрос.']);
if (($data['action'] ?? '') === 'logout') {
    $_SESSION = [];
    $cookie = session_get_cookie_params();
    setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => '/', 'secure' => $cookie['secure'], 'httponly' => true, 'samesite' => 'Strict']);
    session_destroy();
    estimate_reply(200, ['authenticated' => false]);
}
if (($data['action'] ?? '') !== 'login') estimate_reply(400, ['error' => 'Некорректный запрос.']);
estimate_rate_limit($config);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';
if (!is_string($username) || !is_string($password) || strlen($password) > 512) estimate_reply(400, ['error' => 'Некорректные данные входа.']);
$passwordOk = password_verify($password, $config['password_hash']);
if (!hash_equals($config['username'], $username) || !$passwordOk) estimate_reply(401, ['error' => 'Неверный логин или пароль.']);
session_regenerate_id(true);
$_SESSION = ['admin' => true, 'issued' => time(), 'last_seen' => time(), 'version' => $config['session_version'], 'csrf' => bin2hex(random_bytes(32))];
estimate_reply(200, ['authenticated' => true, 'csrf' => $_SESSION['csrf']]);
