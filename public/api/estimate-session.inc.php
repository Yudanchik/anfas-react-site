<?php
declare(strict_types=1);

function estimate_reply(int $status, array $body): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, private');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function estimate_config(): array {
    $path = getenv('ANFAS_ESTIMATE_CONFIG') ?: __DIR__ . '/estimate.config.local.php';
    if (!is_file($path)) estimate_reply(503, ['error' => 'Доступ администратора ещё не настроен.']);
    $config = require $path;
    if (!is_array($config)) {
        estimate_reply(503, ['error' => 'Доступ администратора ещё не настроен.']);
    }
    foreach (['username', 'password_hash', 'rate_limit_path', 'session_version'] as $key) {
        if (!isset($config[$key]) || !is_string($config[$key]) || trim($config[$key]) === '') {
            estimate_reply(503, ['error' => 'Доступ администратора ещё не настроен.']);
        }
    }
    if (strlen($config['session_version']) < 32 || !password_get_info($config['password_hash'])['algo']) {
        estimate_reply(503, ['error' => 'Доступ администратора ещё не настроен.']);
    }
    return $config;
}

function estimate_session(array $config): void {
    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    $local = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true);
    if (!$https && !($local && ($config['allow_local_http'] ?? false))) {
        estimate_reply(403, ['error' => 'Для входа требуется HTTPS.']);
    }
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_name('anfas_estimate');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Strict']);
    session_start();
    header('Cache-Control: no-store, private');
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    header('X-Content-Type-Options: nosniff');
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    if (isset($_SESSION['admin']) && (
        time() - ($_SESSION['last_seen'] ?? 0) > 1800
        || time() - ($_SESSION['issued'] ?? 0) > 28800
        || !hash_equals((string)$config['session_version'], (string)($_SESSION['version'] ?? ''))
    )) {
        unset($_SESSION['admin']);
    }
}

function estimate_require_admin(array $config): void {
    estimate_session($config);
    if (empty($_SESSION['admin'])) estimate_reply(401, ['error' => 'Войдите как администратор.']);
    $_SESSION['last_seen'] = time();
}

function estimate_csrf(): void {
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($token) || !hash_equals($_SESSION['csrf'], $token)) {
        estimate_reply(403, ['error' => 'Обновите страницу и повторите вход.']);
    }
    if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') estimate_reply(403, ['error' => 'Недопустимый запрос.']);
}

function estimate_rate_limit(array $config): void {
    $dir = realpath($config['rate_limit_path']);
    $web = realpath(__DIR__ . '/..');
    if (!$dir || !$web || str_starts_with(str_replace('\\', '/', $dir) . '/', str_replace('\\', '/', $web) . '/')) {
        estimate_reply(503, ['error' => 'Хранилище защиты входа не настроено.']);
    }
    // Two fixed windows: per source and overall, checked under file locks.
    foreach ([['ip:' . ($_SERVER['REMOTE_ADDR'] ?? ''), 10], ['all', 100]] as [$key, $limit]) {
        $file = $dir . '/' . hash_hmac('sha256', $key, $config['session_version']) . '.json';
        $handle = fopen($file, 'c+');
        if (!$handle || !flock($handle, LOCK_EX)) estimate_reply(503, ['error' => 'Вход временно недоступен.']);
        $state = json_decode(stream_get_contents($handle), true);
        if (!is_array($state) || ($state['until'] ?? 0) <= time()) $state = ['until' => time() + 900, 'count' => 0];
        if ($state['count'] >= $limit) {
            flock($handle, LOCK_UN); fclose($handle);
            header('Retry-After: ' . max(1, $state['until'] - time()));
            estimate_reply(429, ['error' => 'Слишком много попыток. Повторите через 15 минут.']);
        }
        $state['count']++;
        rewind($handle); ftruncate($handle, 0); fwrite($handle, json_encode($state));
        fflush($handle); flock($handle, LOCK_UN); fclose($handle);
    }
}
