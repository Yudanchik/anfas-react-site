# Источники контента Strapi (статьи, проекты, услуги, прайс, FAQ)

Руководство редактора: [`strapi-editor-guide.md`](./strapi-editor-guide.md) · Статус: [`strapi-migration-status.md`](./strapi-migration-status.md)

Сборки Host-0 / production по умолчанию остаются на **local**-хардкоде, пока не будет явного cutover.

## Переменные окружения (секреты в Git не кладём)

См. `.env.example`.

| Переменная | Область | По умолчанию |
| --- | --- | --- |
| `CONTENT_SOURCE` | только статьи | `local` |
| `PROJECTS_CONTENT_SOURCE` | только проекты | `local` |
| `SERVICES_CONTENT_SOURCE` | только услуги | `local` |
| `PRICES_CONTENT_SOURCE` | только категории прайса | `local` |
| `FAQ_CONTENT_SOURCE` | группы FAQ (home + prices-hub) | `local` |
| `STRAPI_URL` | когда любой source = `strapi` | — |
| `STRAPI_TOKEN` | опционально | — |
| `STRAPI_TIMEOUT_MS` | опционально | `8000` |

Значения: `local` | `strapi` | `snapshot`.

- **`local`** — данные из кода сайта (`*.data.ts` и т.п.)
- **`strapi`** — читать из CMS; если CMS недоступна, используется committed **snapshot** (сборка/prerender не должны падать)
- **`snapshot`** — зафиксированная JSON-копия в репозитории

## Что такое snapshot и как обновить

Snapshot — снимок seed CMS, положенный во frontend (`src/shared/content/.../*.snapshot.json`). Нужен для режима `snapshot` и как fallback при `strapi`.

Обновление (из корня `anfas-react-site`, рядом должен быть `../anfas-cms` с актуальным seed):

```bash
pnpm snapshot:projects
pnpm snapshot:services
pnpm snapshot:prices
pnpm snapshot:faq
```

Для статей отдельного `snapshot:articles` в scripts может не быть — смотрите процесс журнального пилота / parity articles.

После обновления snapshot: `pnpm parity:*` и при необходимости commit JSON.

## FAQ

```bash
FAQ_CONTENT_SOURCE=local pnpm dev
FAQ_CONTENT_SOURCE=strapi STRAPI_URL=http://127.0.0.1:1337 pnpm build
FAQ_CONTENT_SOURCE=snapshot pnpm build

pnpm parity:faq
STRAPI_URL=http://127.0.0.1:1337 pnpm parity:faq:strapi
pnpm snapshot:faq
```

Сторона CMS (`anfas-cms`):

```bash
pnpm faq:seed          # пересобрать scripts/seed/faq-groups.json
pnpm faq:import:dry    # без записи в БД
pnpm faq:import        # live upsert 2 группы / 11 вопросов
pnpm faq:parity        # REST smoke vs seed
```

Счётчики: **2** группы (`home` 7 + `prices-hub` 4 = **11**). FAQ категорий прайса остаётся в Prices (`price.faq-item`). FAQPage JSON-LD на `/prices` генерируется на фронте из hub FAQ.

## Прайс

```bash
# Никогда не ставьте production в strapi без согласования cutover
PRICES_CONTENT_SOURCE=local pnpm dev
PRICES_CONTENT_SOURCE=strapi STRAPI_URL=http://127.0.0.1:1337 pnpm build
PRICES_CONTENT_SOURCE=snapshot pnpm build

pnpm parity:prices
STRAPI_URL=http://127.0.0.1:1337 pnpm parity:prices:strapi

# Обновить FE snapshot из CMS seed (../anfas-cms/scripts/seed/price-categories.json)
pnpm snapshot:prices
```

CMS:

```bash
pnpm prices:import:dry   # без БД
pnpm prices:import       # upsert 15 категорий
pnpm prices:parity       # REST smoke vs seed
```

Счётчики: **15** категорий / **259** позиций. Мягкий `serviceSlug` `individual|package`. Тарифы калькулятора, PDF/PHP lead-magnet и маркетинговые строки услуг — вне этого source.

## Услуги

```bash
SERVICES_CONTENT_SOURCE=local pnpm dev
SERVICES_CONTENT_SOURCE=strapi STRAPI_URL=http://127.0.0.1:1337 pnpm build
SERVICES_CONTENT_SOURCE=snapshot pnpm build

pnpm parity:services
STRAPI_URL=http://127.0.0.1:1337 pnpm parity:services:strapi
pnpm snapshot:services
```

CMS: `pnpm services:import:dry` / `services:import` / `services:parity`. Стабильные slug: `individual`, `package`.

## Проекты / статьи

```bash
pnpm parity:articles
pnpm parity:projects
STRAPI_URL=http://127.0.0.1:1337 pnpm parity:projects:strapi
pnpm snapshot:projects
```

Документация import/seed CMS: `anfas-cms/README.md`.

## Проверки frontend

```bash
pnpm check
pnpm build
pnpm parity:articles
pnpm parity:projects
pnpm parity:services
pnpm parity:prices
pnpm parity:faq
```

## Нельзя

- Коммитить `.env`, uploads или включать на production `strapi` без согласования cutover
- Удалять `projects.data.ts` / `articles.data.ts` / `services.data.ts` / `prices.data.ts` / home `faq.data.ts` до cutover
- Смешивать домены в одну env (`CONTENT_SOURCE` — только статьи)
- Переносить FAQ категорий прайса в домен FAQ (он уже в Prices)
- Делать merge в `dev`/`main` или deploy как часть wiring dual-run
