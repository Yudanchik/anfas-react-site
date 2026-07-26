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
];
