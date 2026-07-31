<?php
/**
 * Example config for lead form mailer.
 * Copy to config.local.php on the server and fill real values.
 * config.local.php must NEVER be committed to git.
 */
return [
  // Куда приходят заявки
  'to' => 'anfas-remont@mail.ru',

  // От кого письмо (тот же ящик Mail.ru, с которого шлём через SMTP)
  'from' => 'anfas-remont@mail.ru',
  'from_name' => 'Сайт Анфас',

  /**
   * SMTP Mail.ru:
   * 1) https://account.mail.ru → Безопасность
   * 2) Включить «Пароль для внешнего приложения» (или доступ по IMAP/SMTP)
   * 3) Создать пароль приложения и вставить ниже (НЕ обычный пароль входа)
   */
  'smtp' => [
    'enabled' => true,
    'host' => 'smtp.mail.ru',
    'port' => 465,
    'encryption' => 'ssl', // ssl | tls | none
    'username' => 'anfas-remont@mail.ru',
    'password' => 'REPLACE_WITH_APP_PASSWORD',
  ],

  // Антиспам: отклонить слишком быструю отправку (секунды)
  'min_submit_seconds' => 2,

  /**
   * Прайс-лист: выдача полного PDF по временной подписанной ссылке.
   * Файл лежит ВНЕ web root — абсолютный путь на файловой системе сервера,
   * недоступный по прямому публичному URL.
   */
  'price_pdf_path' => '/home/USER/private/anfas-price-2026.pdf',

  // Секрет для HMAC-подписи ссылки на скачивание. Случайная строка ТОЛЬКО на сервере,
  // например: bin2hex(random_bytes(32)) в PHP-консоли.
  'price_link_secret' => 'REPLACE_WITH_RANDOM_SECRET_AT_LEAST_32_CHARS',

  // Срок жизни ссылки на скачивание, в секундах (ориентир — 24 часа).
  'price_link_ttl' => 86400,

  // Публичный адрес сайта — нужен, чтобы собрать абсолютную ссылку в письме клиенту.
  'public_site_url' => 'https://anfas-remont.ru',

  // Антиспам для заявок на прайс: ограничение числа заявок с одного IP за период.
  'price_rate_limit' => [
    'max_requests' => 5,
    'window_seconds' => 3600,
    // Writable-директория для файловых счётчиков (хранит только HMAC-хэши IP, не сами адреса).
    // Тоже ВНЕ web root.
    'storage_path' => '/home/USER/private/price-rate-limit',
  ],
];
