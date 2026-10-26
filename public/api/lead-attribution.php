<?php
declare(strict_types=1);

/** Only allowlisted, bounded source fields reach the office email. */
function anfasAttributionText(mixed $value, int $limit = 100): string {
  return is_string($value)
    ? mb_substr(trim(preg_replace('/[\x00-\x1F\x7F]/u', '', $value) ?? ''), 0, $limit)
    : '';
}

function anfasAttributionHost(mixed $value): string {
  $host = strtolower(anfasAttributionText($value, 253));
  return $host !== '' && filter_var($host, FILTER_VALIDATE_DOMAIN, FILTER_FLAG_HOSTNAME) !== false
    ? $host : '';
}

function anfasAttributionPath(mixed $value): string {
  $path = preg_split('/[?#]/', anfasAttributionText($value, 240))[0] ?? '';
  return str_starts_with($path, '/') && !str_starts_with($path, '//') ? $path : '';
}

function anfasLeadPage(mixed $value): string {
  $url = anfasAttributionText($value, 2000);
  $parts = parse_url($url);
  if (!is_array($parts) || !in_array($parts['scheme'] ?? '', ['http', 'https'], true)) return '';
  $host = anfasAttributionHost($parts['host'] ?? '');
  if ($host === '') return '';
  return $parts['scheme'] . '://' . $host . anfasAttributionPath($parts['path'] ?? '/');
}

function anfasIsChatGptHost(string $host): bool {
  return $host === 'chatgpt.com' || str_ends_with($host, '.chatgpt.com') || $host === 'chat.openai.com';
}

/** @param array<string, mixed> $data */
function anfasLeadAttributionLines(array $data): string {
  $answers = [
    'chatgpt' => 'ChatGPT', 'search' => 'Поиск Яндекс / Google', 'maps' => 'Карты',
    'recommendation' => 'Рекомендация знакомых', 'social' => 'Соцсети', 'other' => 'Другое',
  ];
  $answer = anfasAttributionText($data['sourceSelfReported'] ?? '');
  $lines = [];
  $signals = [];
  if (isset($answers[$answer])) {
    $lines[] = 'Откуда узнали (ответ клиента): ' . $answers[$answer];
    if ($answer === 'chatgpt') $signals[] = 'ответ клиента';
  }
  $attribution = is_array($data['attribution'] ?? null) ? $data['attribution'] : [];
  foreach (['firstTouch' => 'Первый вход во вкладке', 'lastTouch' => 'Последний внешний вход во вкладке'] as $key => $label) {
    $touch = is_array($attribution[$key] ?? null) ? $attribution[$key] : [];
    $path = anfasAttributionPath($touch['landingPath'] ?? '');
    $host = anfasAttributionHost($touch['referrerHost'] ?? '');
    if ($path !== '') $lines[] = $label . ', страница: ' . $path;
    if ($host !== '') {
      $lines[] = $label . ', хост источника: ' . $host;
      if (anfasIsChatGptHost($host)) $signals[] = 'referrer';
    }
    foreach (['utmSource' => 'utm_source', 'utmMedium' => 'utm_medium', 'utmCampaign' => 'utm_campaign'] as $field => $utm) {
      $value = anfasAttributionText($touch[$field] ?? '');
      if ($value === '') continue;
      $lines[] = $label . ', ' . $utm . ': ' . $value;
      if ($field === 'utmSource' && in_array(strtolower($value), ['chatgpt', 'chatgpt.com', 'chat.openai.com'], true)) {
        $signals[] = 'utm_source';
      }
    }
  }
  if ($signals !== []) {
    $lines[] = 'Признаки источника ChatGPT: ' . implode(', ', array_unique($signals)) . '. Проверить запрос и источник при разговоре с клиентом.';
  }
  return implode("\n", $lines);
}
