# Strapi: миграция услуг (Services)

**Status:** Ready for Stage 1  
**Next stage:** Этап 1 — CMS Service schema/components only  
**Scope:** Collection `Service` + nested components (hero / included / story) + SEO + cover media  
**Дата плана:** `2026-08-15`  
**Frontend branch (current):** `feature/strapi-journal-pilot`  
**CMS repo:** `Yudanchik/anfas-cms`  
**CMS branch:** `feature/services-migration` (от `feature/projects-migration` @ `17d1adc`)  
**Паттерн:** как Articles (`CONTENT_SOURCE`) и Projects (`PROJECTS_CONTENT_SOURCE`)

---

## Scope / Out of scope

### In scope
- Strapi collection type **Service** (+ компоненты под nested-блоки)
- Импорт **2** существующих форматов: `individual`, `package`
- Frontend dual-run: `SERVICES_CONTENT_SOURCE=local|strapi|snapshot` (default **`local`**)
- Snapshot + безопасный prerender для `/services`, `/services/:slug`
- Parity local ↔ snapshot ↔ Strapi
- Переиспользование `shared.seo` (у Services SEO **уже есть** в data — импортировать как есть, не выдумывать)

### Out of scope (explicit non-goals)
- Production cutover, DNS, Host-0 deploy, VPS
- Merge в `dev` / `main` без отдельного подтверждения
- Удаление `services.data.ts`
- Миграция **Prices** / прайс-категорий / прайс-позиций
- Глобальная модель **FAQ** (на Service её нет)
- Переписывание UI `/services`, story widgets, calculator UI
- Перенос calculator rates (`package-calculator.data.ts`)
- Перенос Brief/forms validation, analytics, modal behavior
- Связи Service↔Project / Service↔Article как Strapi relations (на старте)
- HomePaths / HomeServices redesign (HomeServices сейчас не смонтирован)

---

## 1. Аудит текущей архитектуры

### 1.1 Кардинальность и URL

| # | id / slug | URL | title |
| --- | --- | --- | --- |
| 1 | `individual` | `/services/individual` | Индивидуальный ремонт |
| 2 | `package` | `/services/package` | Пакетный ремонт |

Список: `/services`.  
Prerender / sitemap: все 3 URL уже захардкожены.

### 1.2 Источник данных

| Слой | Путь |
| --- | --- |
| Data + types | `src/entities/service/model/services.data.ts` |
| Repository | `ServiceRepository { getAll, getBySlug }` |
| Local | `local-service.repository.ts` |
| Factory | `entities/service/api/index.ts` → **всегда local** (нет switch) |
| Routes | `routes/services/route.tsx`, `routes/service/route.tsx` |
| Widgets | `widgets/service/included/*`, `widgets/home/story-individual/*`, `widgets/home/story-package/*` |
| Orphan | `widgets/home/services/*` (**не смонтирован** на home) |

Типы: `Service = ServiceIndividual | ServicePackage` (discriminant `id`, разная форма `story`).

### 1.3 Поля локальной модели (факт кода)

**База (`ServiceBase`):**  
`slug`, `number`, `title`, `shortText`, `text`, `tags[]`, `image`, `imageWidth`, `imageHeight`, `lead`, `hero{…}`, `bullets[]`, `metrics[]`, `price` (строка), `duration` (строка), `ctaLabel`, `included{…}`, `seo{title,description,keywords}`.

**+ discriminant:** `id: 'individual' | 'package'`.

**`hero`:** eyebrow, titleLine, titleAccent, lead, stats[{label,value}], aside{eyebrow,title,text}.

**`included`:** label, titleMain, titleAccent, lead, groups[{number,title,text,items[]}] (по 6 групп), fit{label,title,text,points[]}, note.

**`story` individual:** eyebrow, title, lead, hero{overline,title,text,metrics[]}, highlights[], steps[].

**`story` package:** eyebrow, title, lead, summary{overline,title,text,bullets[]}, steps[{number,title,text,meta}].

**Мёртвые / почти мёртвые для текущего UI (но есть в data):**  
`lead` (top-level), `bullets`, `metrics` (top-level) — на detail сейчас доминируют `hero` + `story` + `included`. Мигрировать **полностью** для parity (как `details` у Projects).

### 1.4 Медиа

| Asset | Источник | Примечание |
| --- | --- | --- |
| Cover individual / package | `src/assets/images/formats/*.webp` (Vite import) | **не** `public/images/...` |
| List hero `/services` | `innerHeroImages.services` (shared hero) | не поле Service |

Для CMS (Stage 1–2): cover → `public/images/services/` + `imagePath`; Strapi media upload поддерживается, FE parity сохраняет `imagePath`.

### 1.5 SEO / CTA / формы

- Detail SEO: из `service.seo` + `createSeoMeta` (canonical `/services/:slug`, OG image = `service.image`).
- List SEO: **захардкожен** в `services/route.tsx` (не в data).
- CTA: `ModalTriggerButton` / `OpenLeadForm` с `intent` / `defaultService` = `individual|package|general`.
- Brief Zod enum уже совпадает со slug’ами Service.
- Calculator: режимы `package|individual`, rates **не** из Service entity.

### 1.6 Связи с другими доменами

| Домен | Связь |
| --- | --- |
| **Articles** | `relatedService: 'individual'\|'package'` (уже в Strapi Article) — **входящая** |
| **Prices** | `PriceCategory.related.serviceSlug?` — soft string, все 15 категорий; **отдельный** домен |
| **Projects** | нет slug-связи; review.service — свободный текст |
| **FAQ** | на Service **нет**; FAQ у home / prices |

### 1.7 Потребители (routes / chrome)

- `/services`, `/services/:slug`
- Home: HomePaths + calculator (hardcode), **не** HomeServices
- Header/Footer: ссылка «Услуги» + footer slice titles
- Article promo → service href
- Price category → `getServiceHref(serviceSlug)`
- `prerender-paths.ts` STATIC: `/services`, `/services/individual`, `/services/package`
- `public/sitemap.xml` — те же URL
- schema.org на Service pages: **нет**

### 1.8 Repository seam

Уже есть `ServiceRepository` — хороший контракт для dual-run (как Project).  
Прямой импорт `services` из data — в основном через local repository + footer/`services` export; при wiring нужно проверить все прямые импорты и свести к repository где возможно.

---

## 2. Предлагаемая Strapi schema (черновик)

### Collection `Service`

| Attribute | Type | Notes |
| --- | --- | --- |
| `title` | string, required | |
| `slug` | uid ← title, required | **стабильные** `individual` / `package` |
| `serviceId` | enumeration `individual\|package`, required, unique | = frontend `id` / form intent |
| `number` | string | `'01'` / `'02'` |
| `shortText` | text | |
| `text` | text | |
| `lead` | text | parity even if UI light |
| `tags` | json `string[]` **или** repeatable component | предпочтение: json на Stage 1, component позже |
| `imagePath` | string | portable path после нормализации |
| `image` | media (single, images) | cover upload |
| `imageWidth` / `imageHeight` | integer, optional | |
| `bullets` | json `string[]` | |
| `metrics` | component repeatable `shared.stat` или json | |
| `price` | string | marketing string, **не** Prices CT |
| `duration` | string | |
| `ctaLabel` | string | |
| `sortOrder` | integer | 0,1 |
| `hero` | component `service.hero` | |
| `included` | component `service.included` | |
| `storyIndividual` | component `service.story-individual`, optional | заполнять только для individual |
| `storyPackage` | component `service.story-package`, optional | только для package |
| `seo` | component `shared.seo`, required for import | уже есть в data |
| options | `draftAndPublish: true` | |

### Components (предложение)

- `service.hero` — eyebrow, titleLine, titleAccent, lead, stats (repeatable label/value), aside
- `service.included-group` — number, title, text, items (json)
- `service.included` — label, titles, lead, groups (repeatable), fit, note
- `service.story-individual` / `service.story-package` — по текущим типам
- Переиспользовать `shared.seo`

**Не вводить на Stage 1:** Relation на Article/Project; FAQ component; PriceItem; calculator rates.

### Permissions

Public: **find / findOne** only (как Article/Project). Write → 403.

---

## 3. Зависимости (зафиксировано)

| Тема | Решение |
| --- | --- |
| Services vs Prices | **Services отдельно.** Prices не переносим в этом плане. Soft `serviceSlug` остаётся string. |
| Цена на Service | **Строковые** `price` + `duration` (marketing). Не создавать Price/PriceItem. |
| FAQ | **Не** в Service. Глобальный FAQ — отдельная миграция. |
| Related articles/projects | **Future/roadmap только.** Не реализовывать на Stage 1–5. Articles `relatedService` enum **не менять**. |
| Env | **`SERVICES_CONTENT_SOURCE=local\|strapi\|snapshot`**, default **`local`**. Не трогать `CONTENT_SOURCE` / `PROJECTS_CONTENT_SOURCE`. |
| CMS branch | **`feature/services-migration`** от `feature/projects-migration`. |
| Admin UX | **Минимальный:** понятная schema/components; без лишних усложнений до import. |
| Media | Cover → **`public/images/services/`** для snapshot/public-path parity; Strapi media upload + FE parity по **`imagePath`**. |
| Slugs | Стабильные **`individual`** / **`package`**. Calculator / Brief / HomePaths **не переписывать**. |

**Риск коммерции:** низкий при замороженных slug. Ломают rename: Brief enum, Article.relatedService, Prices.serviceSlug, calculator modes, sitemap/prerender.

---

## 4. Accepted decisions (Stage 0 — 2026-08-15)

| # | Решение |
| --- | --- |
| 1 | Services переносим **отдельно** от Prices. |
| 2 | Prices **не** переносим на этом этапе. |
| 3 | `price` / `duration` — marketing **string** fields, не отдельный Price CT. |
| 4 | FAQ в Service **не** добавляем. |
| 5 | Related articles/projects — только future/roadmap; **не** реализовывать сейчас. |
| 6 | Отдельный **`SERVICES_CONTENT_SOURCE`**. |
| 7 | Default всегда **`local`**. |
| 8 | CMS ветка **`feature/services-migration`** от `feature/projects-migration`. |
| 9 | Admin UX polish **минимальный** (понятная schema, без усложнений до import). |
| 10 | Media → **`public/images/services/`** при необходимости для parity. |
| 11 | Strapi cover media OK; FE parity сохраняет **`imagePath`**. |
| 12 | Calculator / Brief / HomePaths **не** переписывать; slug `individual`/`package` сохранить. |
| 13 | Articles **`relatedService` enum не менять**. |
| 14 | Sync с `dev`: **merge**, не rebase. Force push запрещён. |

### Open questions

*Все вопросы 1–8 (+ media) закрыты решениями Stage 0.*

---

## 5. Staged plan

### Этап 0 — Sync + decisions
- [x] `git fetch`; merge `origin/dev` → `feature/strapi-journal-pilot` (**Already up to date**, base `8d3c436`)
- [x] Open questions подтверждены → Accepted decisions
- [x] CMS: `feature/services-migration` создана от `feature/projects-migration` @ `17d1adc`, pushed
- [x] CMS schema / import / FE runtime **не начинались**

**Готовность:** ✅ Stage 0 complete — Ready for Stage 1  
**⛔ Checkpoint:** подтверждение перед Этапом 1 (schema only)

---

### Этап 1 — CMS schema only ← **NEXT**
- [ ] Components: `service.hero`, `service.included*`, `service.story-*` (минимально понятные)
- [ ] Collection `Service` + `shared.seo` + `serviceId` enum + string `price`/`duration`
- [ ] Public find/findOne; write 403
- [ ] Smoke: GET `/api/services` → `[]`
- [ ] Article/Project API не затронуты; `relatedService` enum без изменений
- [ ] Не коммитить dirty `docker-compose.yml` / uploads / `.env`
- [ ] **Не** importer, **не** FE wiring, **не** media copy в Stage 1 (media copy → Stage 2)

**Готовность:** schema OK + `pnpm check/build` CMS  
**⛔ Checkpoint:** перед seed/dry-run
---

### Этап 2 — Seed + dry-run

- [ ] `scripts/seed/services.json` из `services.data.ts` (structured import, не regex-копипаст полей)
- [ ] Нормализация media → portable `/images/services/...` (или согласованный path)
- [ ] `pnpm services:import:dry` — без Strapi/DB/upload
- [ ] Валидация: count=2, unique slugs, schema shape, story discriminant, media exists, no Windows abs paths
- [ ] Parity field-by-field vs `services.data.ts`
- [ ] Inventory: unused fields (`lead`/`bullets`/`metrics`) явно в отчёте

**Готовность:** dry-run errors=0  
**⛔ Checkpoint:** перед live import

---

### Этап 3 — Live import + media

- [ ] Idempotent upsert по `slug` / `serviceId`
- [ ] Upload cover + dedupe; publish
- [ ] Повторный import: created=0, updated=2 (или skipped), no media dupes
- [ ] REST smoke: 2 services; Article=8; Project=7
- [ ] Schema не менять без блокера

**Готовность:** REST 2 published services  
**⛔ Checkpoint:** перед FE wiring

---

### Этап 4 — Frontend wiring (без cutover)

- [ ] `getServicesContentSource()` default `local`
- [ ] Zod DTO + `adaptStrapiService` → существующий `Service` union
- [ ] `strapi` / `snapshot` / `local` repositories + factory
- [ ] `services.snapshot.json` (+ `parity:services`, optional `snapshot:services`)
- [ ] Prerender: `/services/:slug` из source с fallback snapshot (список не пустеет)
- [ ] Builds: local / strapi / strapi-down→snapshot / snapshot
- [ ] Не менять production env; не удалять `services.data.ts`
- [ ] Прямые импорты data → по возможности только local repo

**Готовность:** parity 2/2; default local  
**⛔ Checkpoint:** перед Stage 5 / merge в `dev`

---

### Этап 5 — Visual + SEO + forms QA + docs

- [ ] Visual: `/services`, both details, desktop/tablet/mobile; local/strapi/snapshot
- [ ] SEO: title/description/canonical/OG на detail; list meta (hardcoded — зафиксировать follow-up если выносить в CMS)
- [ ] CTA/forms: Brief intents individual/package; OpenLeadForm; article→service link
- [ ] Calculator + Prices links всё ещё работают со стабильными slug
- [ ] Docs: CMS README + FE content-sources
- [ ] Decisions before next type (Prices vs FAQ vs Home)

**Готовность:** Ready for next content migration  
**Out:** production cutover

---

## 6. Risks & rollback

| Риск | Митигация | Rollback |
| --- | --- | --- |
| Смена slug ломает Article/Prices/forms/calculator | Запрет rename без mapping; seed фиксирует `individual`/`package` | local source |
| Discriminated `story` формы | Два component-поля + validation в import | json fallback только если schema blocker |
| Vite asset URL в snapshot | Нормализация в public path / media | local images |
| Сломать Projects/Articles env | Отдельный `SERVICES_CONTENT_SOURCE` | default local |
| Admin не читает deep nested | Components на Stage 1; polish после dry-run | — |
| HomePaths hardcode ≠ CMS | Document follow-up; optional Stage 5+ refactor | не блокер dual-run |
| Пустая БД при local CMS restart | Re-import scripts (как Projects Stage 5) | seed + import |

Frontend rollback: `SERVICES_CONTENT_SOURCE=local`, hardcode на месте.

---

## 7. Контрольные точки (ждать подтверждения)

1. После Этапа 0 (open questions)
2. После Этапа 1 (schema)
3. После Этапа 3 (import)
4. Перед merge frontend-ветки в `dev`
5. Любой production / DNS / удаление hardcode — **вне этого плана**

---

## Progress log

| Дата | Событие |
| --- | --- |
| 2026-08-15 | Read-only аудит Services выполнен. Task-файл создан, Status=**Planned**. |
| | 2 services (`individual`, `package`); repository seam есть; Strapi CT нет. |
| | Prices — отдельный домен (soft `serviceSlug`); FAQ на Service нет. |
| | Media: Vite-bundled format webp (не public/). |
| | Articles уже зависят от enum `relatedService` в Strapi. |
| | Реализация не начата. CMS не менялась. |
| 2026-08-15 | **Stage 0 complete.** Decisions 1–14 accepted (Services отдельно; `SERVICES_CONTENT_SOURCE`; media `public/images/services/`; slug freeze). |
| | FE: `feature/strapi-journal-pilot`; `merge origin/dev` → **Already up to date** (base `8d3c436`). No rebase/force. |
| | CMS: branch `feature/services-migration` created from `feature/projects-migration` @ `17d1adc`, pushed. No schema commit. |
| | Checks: FE check + build local; articles parity; projects parity; CMS check + build; `git diff --check`. |
| | Status → **Ready for Stage 1**. |


---

## Next action

**Ждать подтверждения Этапа 1** (CMS Service schema/components only; public find/findOne; без importer / FE wiring / media copy).
Не начинать Stage 2+ без явного запроса.
