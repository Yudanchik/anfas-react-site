<?php
declare(strict_types=1);
require_once __DIR__ . '/../public/api/lead-attribution.php';

function check(bool $condition, string $message): void {
  if (!$condition) throw new RuntimeException($message);
}

$valid = anfasLeadAttributionLines([
  'sourceSelfReported' => 'chatgpt',
  'attribution' => [
    'firstTouch' => ['landingPath' => '/services/design?token=secret', 'referrerHost' => 'chatgpt.com', 'utmSource' => 'chatgpt.com'],
    'lastTouch' => ['landingPath' => '/services/design', 'referrerHost' => 'yandex.ru'],
  ],
]);
check(str_contains($valid, 'ответ клиента'), 'self-report must reach the office');
check(str_contains($valid, 'referrer'), 'technical source must reach the office');
check(str_contains($valid, 'utm_source'), 'UTM must reach the office');
check(str_contains($valid, 'Проверить запрос'), 'signals are not automatic qualification');
check(!str_contains($valid, 'secret'), 'query must not be included');

foreach (['chatgpt.com.evil.test', 'fakechatgpt.com', 'chat.openai.com.evil.test', 'chatgpt.com@evil.test', 'chatgpt.com/path'] as $host) {
  $body = anfasLeadAttributionLines(['attribution' => ['firstTouch' => ['referrerHost' => $host]]]);
  check(!str_contains($body, 'Признаки источника ChatGPT'), 'spoofed host: ' . $host);
}
check(anfasIsChatGptHost('chat.openai.com'), 'old host');
check(anfasIsChatGptHost('www.chatgpt.com'), 'bounded subdomain');
check(anfasLeadAttributionLines([]) === '', 'old clients must remain supported');
check(anfasLeadAttributionLines(['sourceSelfReported' => ['bad'], 'attribution' => 'bad']) === '', 'invalid types are ignored');
check(anfasAttributionText(['bad']) === '', 'non-string values must be ignored');
check(mb_strlen(anfasAttributionText(str_repeat('я', 200))) === 100, 'UTF-8 length limit');
check(anfasAttributionText("a\r\nb\0c") === 'abc', 'control characters are removed');
check(anfasLeadPage('https://anfas-remont.ru/services/?email=secret#private') === 'https://anfas-remont.ru/services/', 'page query and fragment removed');
check(anfasLeadPage('javascript:alert(1)') === '', 'non-HTTP URLs rejected');
check(anfasLeadPage('https://user:secret@anfas-remont.ru/services/') === 'https://anfas-remont.ru/services/', 'userinfo removed');
echo "Lead attribution PHP checks passed\n";
