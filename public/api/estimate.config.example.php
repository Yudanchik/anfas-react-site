<?php
// Copy to estimate.config.local.php ON THE SERVER. No credentials in VITE_*.
return [
    'username' => 'admin',
    'password_hash' => '', // Generate with password_hash($password, PASSWORD_DEFAULT).
    'session_version' => '', // Random 32+ characters; change to revoke all sessions.
    'rate_limit_path' => '/home/USER/private/estimate-login', // Existing writable directory outside web root.
    'allow_local_http' => false, // true ONLY for loopback development with PHP.
];
