# Strapi: миграция услуг (Services)

**Status:** Ready for Stage 5  
**Next stage:** Этап 5 — Visual + SEO/CTA/forms QA + docs  
**Scope:** Collection `Service` + nested components (hero / included / story) + SEO + cover media  
**Дата плана:** `2026-08-15`  
**Frontend branch (current):** `feature/strapi-journal-pilot`  
**CMS repo:** `Yudanchik/anfas-cms`  
**CMS branch:** `feature/services-migration`  
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

### Этап 1 — CMS schema only
- [x] Components: `service.stat`, `hero`/`hero-aside`, `included`/`included-group`/`included-fit`, `story-card`, `story-individual`(+hero), `story-package`(+summary/step)
- [x] Collection `api::service.service` + `shared.seo` + `serviceId` enum + string `price`/`duration`
- [x] Public find/findOne; write 403
- [x] Smoke: GET `/api/services` → `[]`; articles=8; projects=7
- [x] Article/Project schemas **не** изменены; `relatedService` enum без изменений
- [x] `docker-compose.yml` dirty **не** committed; uploads/`.env` не трогались
- [x] Importer / FE wiring / media copy **не** делались

**Фактическая schema Service (Stage 1):**
- Scalar: `title`, `slug` (uid), `serviceId` (`individual|package`), `number`, `shortText`, `text`, `lead`, `tags` (json), `imagePath`, `cover` (media), `imageWidth`/`imageHeight`, `bullets` (json), `metrics` (repeatable `service.stat`), `price`, `duration`, `ctaLabel`, `sortOrder`, `isFeatured`
- Components: `hero`, `included`, `storyIndividual?`, `storyPackage?`, `seo` (required)
- draftAndPublish: true
- Naming: marketing strings = `price`/`duration` (FE); media = `cover` + portable `imagePath`

**Готовность:** ✅ Stage 1 complete — Ready for Stage 2  
**⛔ Checkpoint:** подтверждение перед seed/dry-run

---

### Этап 2 — Seed + dry-run ← **DONE**

- [x] `scripts/seed/services.json` из `services.data.ts` (structured TS import; Vite `@/assets` stubs → portable paths)
- [x] Нормализация media → `/images/services/{slug}.webp`
- [x] Copy covers → FE `public/images/services/` (Vite `formats/*` **не** удалены; UI imports **не** менялись)
- [x] `pnpm services:import:dry` — без Strapi/DB/upload
- [x] Валидация: count=2, unique slugs/serviceIds, enum, schema shape, story discriminant, media source+target, no Windows abs paths
- [x] Parity field-by-field vs `services.data.ts`
- [x] Inventory: unused fields (`lead`/`bullets`/`metrics`) в dry-run warnings

**Seed summary:** 2 services — `individual` (sortOrder 0), `package` (sortOrder 1); SEO from source (not invented); hero/included/storyIndividual|storyPackage; no Prices/FAQ/relations/isFeatured.  
**Media decision:** **copied** `src/assets/images/formats/{individual,package}-format.webp` → `public/images/services/{individual,package}.webp`.  
**Dry-run report:** `dryRun=true`; servicesTotal=2; uniqueSlugs/Ids=`individual|package`; missingRequiredFields=[]; media referenced/found/missing=2/2/[]; sourceFound=2; parityIssues=[]; errors=[]; exit 0 (identical ×2).  
**Готовность:** dry-run errors=0  
**⛔ Checkpoint:** перед live import — **пройден**

---

### Этап 3 — Live import + media ← **DONE**

- [x] Idempotent upsert по `slug` / `serviceId` (live import **2** services)
- [x] Cover upload + dedupe (caption/name = public path); publish
- [x] Повторный import: created=0, updated=2; mediaUploaded=0, mediaReused=2
- [x] REST smoke: 2 services; Article=8; Project=7; covers=2
- [x] Schema не менялась

**Import report:**  
- 1st: `created=2`, `updated=0`, `mediaUploaded=2`, `mediaReused=0`  
- 2nd: `created=0`, `updated=2`, `mediaUploaded=0`, `mediaReused=2`  
- `imagePath` остаётся `/images/services/...` (не localhost media URL)

**Media dedupe:** stable key = public path as upload `caption` + `name` (`images__services__*.webp`); repeat import reuses existing files.

**REST / parity:** services=2 (`individual`,`package`); serviceIds match; published; coversWithMedia=2; sortOrder 0/1; SEO/hero/included/story match seed; articles=8; projects=7; issues=[].

**Готовность:** REST 2 published services  
**⛔ Checkpoint:** перед FE wiring — **пройден**

---

### Этап 4 — Frontend wiring (без cutover) ← **DONE**

- [x] `getServicesContentSource()` default `local`
- [x] Zod DTO (`service.dto.ts`) + `adaptStrapiService` → `Service` union
- [x] `strapi` / `snapshot` / `local` repositories + factory
- [x] `services.snapshot.json` + `parity:services` + `snapshot:services`
- [x] Prerender: `/services/:slug` from source with snapshot/hardcoded fallback
- [x] Builds: local / strapi / strapi-down→snapshot / snapshot
- [x] Production env не менялся; `services.data.ts` сохранён (portable `images/services/*`)
- [x] Routes `/services` + `/services/:slug` через `serviceRepository` + `assetUrl`

**Wiring:**  
- Env: `SERVICES_CONTENT_SOURCE` (independent of articles/projects)  
- Adapter prefers portable `imagePath` → FE `image` (no localhost media URLs)  
- Snapshot: `src/shared/content/services/services.snapshot.json` (2 services)

**Parity / builds:** local↔snapshot OK; local↔Strapi OK (2/2); articles 8/8; projects 7/7; all 4 builds OK.

**Готовность:** parity 2/2; default local  
**⛔ Checkpoint:** перед Stage 5 / merge в `dev` — **пройден**

---

### Этап 5 — Visual + SEO + forms QA + docs ← **NEXT**

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
| 2026-08-16 | **Stage 1 complete.** CMS Service schema + components on `feature/services-migration`. |
| | Collection `api::service.service`; components under `src/components/service/*`; bootstrap public find/findOne. |
| | Smoke: services `[]` 200; articles 8; projects 7; POST/PUT/DELETE 403. |
| | Article/Project schemas untouched. `pnpm check`, `pnpm build`, `git diff --check` OK. |
| | `docker-compose.yml` dirty not committed. Status → **Ready for Stage 2**. |
| 2026-08-16 | **Stage 2 complete.** Seed + dry-run + media copy. No live import / FE runtime wiring. |
| | CMS: `scripts/seed/services.json` (2), `build-services-seed.mts`, `import-services-dry.cjs`, `pnpm services:import:dry`. |
| | FE: `public/images/services/{individual,package}.webp` copied from formats; task md; runtime code untouched. |
| | Dry-run ×2 identical, exit 0; parity 0 issues; articles 8/8; projects 7/7. |
| | Article/Project import/API unchanged. Status → **Ready for Stage 3**. |
| 2026-08-16 | **Stage 3 complete.** Live import + media dedupe + REST parity. No FE wiring. |
| | CMS: `import-services.cjs`, `services-parity-smoke.cjs`, `pnpm services:import` / `services:parity`. |
| | 1st import created=2 mediaUploaded=2; 2nd updated=2 mediaReused=2 mediaUploaded=0. |
| | REST: services=2 published, covers=2; articles=8; projects=7; seed↔Strapi parity OK. |
| | Article/Project schemas/scripts untouched. Status → **Ready for Stage 4**. |
| 2026-08-16 | **Stage 4 complete.** FE dual-run wiring. Default `SERVICES_CONTENT_SOURCE=local`. |
| | DTO/adapter/repos/snapshot/parity/prerender; portable public images; routes via repository. |
| | Parity local↔snapshot + local↔Strapi 2/2; builds local/strapi/strapi-down/snapshot OK. |
| | CMS: minor seed-builder update (direct TS import after portable paths). Status → **Ready for Stage 5**. |


---

## Next action

**Ждать подтверждения Этапа 5** (visual QA + SEO/CTA/forms + docs + local completion).
Не merge в `dev` / production cutover без явного запроса.
