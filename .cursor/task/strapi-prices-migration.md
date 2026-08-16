# Strapi: миграция прайс-листа (Prices)

**Status:** Completed locally / Waiting for production cutover
**Next stage:** Production cutover (отдельное подтверждение) — **не начат**
**Scope:** Курируемое публичное превью прайс-категорий (`PriceCategory` + nested positions/FAQ/factors) + dual-run `PRICES_CONTENT_SOURCE`
**Дата плана:** `2026-08-16`
**Frontend branch (current):** `feature/strapi-journal-pilot`
**CMS repo:** `Yudanchik/anfas-cms`
**CMS branch:** `feature/prices-migration`
**Паттерн:** как Articles / Projects / Services (отдельный env, default **local**)

---

## Scope / Out of scope

### In scope (кандидат на миграцию)
- Курируемое SEO-превью: **15** категорий + **259** позиций из `prices.data.ts`
- Nested: positions, factors, faq, disclaimer, related soft-links
- Per-category SEO (уже есть в data)
- Frontend dual-run: `PRICES_CONTENT_SOURCE=local|strapi|snapshot` (default **`local`**)
- Snapshot + безопасный prerender/sitemap для `/prices` + `/prices/:slug`
- Parity local ↔ snapshot ↔ Strapi
- Soft link `serviceSlug: individual|package` (как сейчас)

### Out of scope (explicit non-goals)
- Production cutover, DNS, Host-0 deploy, VPS
- Merge в `dev` / `main` без отдельного подтверждения
- Удаление `prices.data.ts`
- Полный PDF прайс / `price-download.php` / HMAC / rate-limit / Mail
- Calculator formulas + rates (`package-calculator.data.ts`)
- Services/home marketing strings («от 55 000 / 49 000 ₽») — это Service / HomePaths
- Brief/forms validation, analytics goals, modal behavior
- UI redesign `/prices*` widgets/styles
- Публикация полного прайс-листа в открытый REST (убивает lead magnet)
- Глобальная модель FAQ как отдельный CT (FAQ остаётся nested на категории)
- Strapi relations Service↔PriceCategory на старте (достаточно soft enum)

---

## 1. Аудит текущей архитектуры

### 1.1 Кардинальность и URL

| # | slug | URL | serviceSlug |
| --- | --- | --- | --- |
| 1 | `vyvoz-musora` | `/prices/vyvoz-musora` | package |
| 2 | `gipsokarton` | `/prices/gipsokarton` | individual |
| 3 | `demontazh` | `/prices/demontazh` | package |
| 4 | `kladka` | `/prices/kladka` | individual |
| 5 | `shtukaturka` | `/prices/shtukaturka` | individual |
| 6 | `malyarnye` | `/prices/malyarnye` | package |
| 7 | `plitka` | `/prices/plitka` | individual |
| 8 | `napolnye-pokrytiya` | `/prices/napolnye-pokrytiya` | package |
| 9 | `elektroremontazh` | `/prices/elektroremontazh` | individual |
| 10 | `santehmontazh` | `/prices/santehmontazh` | individual |
| 11 | `kondicionirovanie` | `/prices/kondicionirovanie` | package |
| 12 | `zvukoizolyaciya` | `/prices/zvukoizolyaciya` | individual |
| 13 | `potolki` | `/prices/potolki` | package |
| 14 | `dveri` | `/prices/dveri` | package |
| 15 | `obshhestroitelnye` | `/prices/obshhestroitelnye` | individual |

Hub: `/prices`.
Thanks (noindex): `/prices/thanks`.
Sitemap: hub + 15 categories (**без** thanks).
Prerender: hub + 15 + thanks (static list в `prerender-paths.ts`).

**Counts:** 15 categories · **259** positions · **45** FAQ (3×15) · factors по 3/категорию · `note` на позициях: **0** в data.

### 1.2 Источник данных

| Слой | Путь |
| --- | --- |
| Types | `src/entities/price/model/price.types.ts` |
| Data | `src/entities/price/model/prices.data.ts` (~1.5k LOC) |
| Repository | `PriceRepository { getAll, getBySlug }` |
| Local | `local-price.repository.ts` |
| Factory | `entities/price/api/index.ts` → **всегда local** (нет switch) |
| Helpers | `lib/price-helpers.ts` (`formatPriceFrom` → «от … ₽», hrefs) |
| Routes | `routes/prices`, `routes/price-category`, `routes/price-thanks` |
| Widgets | `widgets/prices/**` (Hero, Grid, Card, PreviewTable, Faq, Factors, Cta, SeoNote, Breadcrumbs) |
| Docs | `docs/architecture/price-list.md`, `docs/PRICE_LIST.md`, `docs/PRICE_LIST_DEPLOY.md` |
| Source PDF (authors) | `resources/source-documents/anfas-price-2026.pdf` (не public) |

**CMS:** типа Price / PriceCategory **нет**. Только строки `price` у Service / Project (другой домен).

### 1.3 Поля локальной модели (факт кода)

```ts
PriceCategory {
  slug, title, titleAccent, eyebrow, lead,
  seo: { title, description, keywords },
  priceFrom: number,       // card «от»
  priceUnit: string,       // м² | м. пог. | компл. | шт. | …
  positions: PricePosition[],  // name, unit, priceFrom, note?
  disclaimer: string,
  factors: { title, text }[],
  faq: { question, answer }[],
  related: {
    serviceSlug?: 'individual' | 'package',
    articleSlugs?: string[],   // в data есть, UI сейчас НЕ рендерит
    categorySlugs?: PriceCategorySlug[],
  }
}
```

UI таблицы всегда показывает **`от {n} ₽`** через helper — префикс «от» не хранится в числе.

### 1.4 Три разных «цены» (критично не смешивать)

| Система | Где | Форма | Назначение |
| --- | --- | --- | --- |
| **A. Preview Prices** | `prices.data.ts` | numeric `priceFrom` + unit | SEO-страницы `/prices/*` |
| **B. Full PDF** | server path + PHP gate | документ | Lead magnet после формы `intent=price-list` |
| **C. Calculator rates** | `package-calculator.data.ts` | rates/coefficients | Математика сметы на home |
| **D. Service marketing** | `services.data.ts` / HomePaths | строки «от 55 000 ₽ / м²» | Витрина услуг |

Миграция Prices = **только A**. B/C/D — out of scope.

### 1.5 PHP / lead / PDF

| File | Role |
| --- | --- |
| `public/api/lead.php` | `intent === 'price-list'` → rate limit, HMAC download link, mail |
| `public/api/price-download.php` | signed PDF download; `noindex` |
| `public/api/config.example.php` | `price_pdf_path`, secrets, TTL, rate limit |

Не переносить в Strapi content model.

### 1.6 Calculator / forms / home

- Calculator: **не импортирует** `entities/price`.
- Forms: `PricesCta` → `ModalTriggerButton intent="price-list"`; brief schema требует email; redirect `/prices/thanks`.
- HomePaths: hardcoded 55k/49k — не из price repository.
- Soft link на категории: `related.serviceSlug` → `getServiceHref`.

### 1.7 SEO / prerender / sitemap

- Category SEO: из data.
- Hub SEO: **hardcoded** в `prices/route.tsx` (+ keyword bank в `seo.ts`).
- JSON-LD ItemList / BreadcrumbList на hub + category.
- Prerender/sitemap: **статические** списки slug’ов (не из repository) — при dual-run нужно генерировать из source + snapshot fallback (как Projects/Services).

### 1.8 Repository seam

Есть interface + local. **Нет** `getPricesContentSource`, strapi/snapshot repos, DTO, snapshot JSON, parity scripts.

---

## 2. Сравнение вариантов Strapi-модели

| | A. Collection + nested | B. Singleton PricePage | C. Prices inside Service |
| --- | --- | --- | --- |
| Соответствие data | ✅ 15 категорий как CT | ❌ натягивает дерево на 1 документ | ❌ 15 work categories ≠ 2 formats |
| Admin UX | ✅ привычный list/edit | ⚠ огромный singleton | ❌ смешивает домены |
| Частота правок | ✅ править одну категорию | ⚠ риск конфликтов/больших payload | ❌ неверно семантически |
| SEO per URL | ✅ slug на CT | ⚠ кастомная маршрутизация | ❌ URL `/prices/:slug` не про Service |
| Calculator | не затрагивает | не затрагивает | риск смешать marketing |

### Рекомендация (предварительная)

**Не C.** Отдельный домен.

**Не B как основной.** Singleton не подходит под 15 SEO-URL.

**Да — уточнённый вариант A:**

```
Collection Type: PriceCategory (draftAndPublish)
  slug (uid)
  title, titleAccent, eyebrow, lead
  priceFrom (integer/decimal), priceUnit (string)
  disclaimer (text)
  sortOrder (integer)
  serviceSlug (enum individual|package, optional)
  positions[]  → component price.position  { name, unit, priceFrom, note?, sortOrder }
  factors[]    → component price.factor    { title, text }
  faq[]        → component price.faq-item  { question, answer }
  relatedArticleSlugs (json string[])   // soft, optional
  relatedCategorySlugs (json string[])  // soft, optional
  seo → shared.seo
```

Hub page SEO / intro: **оставить hardcoded** на Stage 1–4 (как list SEO у Services), либо optional later `PriceHub` singleton — **не блокер**.

**Не** делать 259 top-level `PriceItem` collections без родителя — хуже для SEO-страниц и Admin.

Поля из запроса пользователя → маппинг:

| Запрос | В модели |
| --- | --- |
| slug/key | `slug` |
| title | `title` (+ `titleAccent`) |
| serviceId optional | `serviceSlug` enum (имя как в FE; не relation) |
| category/section | сам `PriceCategory` = секция |
| description | `lead` + `disclaimer` |
| price/fromPrice | `priceFrom` (category card) + `positions[].priceFrom` |
| unit | `priceUnit` / `positions[].unit` |
| sortOrder | `sortOrder` + position sortOrder |
| isFeatured | **не нужен сейчас** (нет в data) — не выдумывать |
| visibility | draftAndPublish |
| note | `disclaimer` + optional `positions[].note` |
| SEO | `shared.seo` per category |
| CTA | **не в CMS** — UI `PricesCta` / brief intent |

---

## 3. Accepted decisions (Stage 0 — 2026-08-16)

| # | Решение |
| --- | --- |
| 1 | Prices переносим **отдельным доменом**, не внутрь Service. |
| 2 | Основная модель Strapi: collection **`PriceCategory`**. |
| 3 | Singleton **`PricePage` сейчас не делаем**. |
| 4 | Calculator rates **не переносим** сейчас (`package-calculator.data.ts` остаётся local). |
| 5 | Marketing prices на Services/Home **не смешиваем** с Prices preview. |
| 6 | Отдельный **`PRICES_CONTENT_SOURCE=local\|strapi\|snapshot`**. |
| 7 | Default всегда **`local`**. |
| 8 | CMS ветка **`feature/prices-migration`** от `feature/services-migration`. |
| 9 | `related.serviceSlug` — soft enum/string **`individual\|package`** (не Strapi relation). |
| 10 | Category SEO **переносим** (уже есть в category data). |
| 11 | Hub `/prices` SEO **оставить hardcoded**. |
| 12 | PDF lead-magnet / PHP / forms / CTA UI **не трогать**. |
| 13 | Articles / Projects / Services **не менять**. |
| 14 | Sync с `dev`: **merge**, не rebase. Force push запрещён. |

### Open questions

*Все решения 1–13 (+ sync) закрыты Stage 0.*

---

## 4. Staged plan

### Этап 0 — Sync + decisions

- [x] FE: `merge origin/dev` → `feature/strapi-journal-pilot` (**Already up to date**, `dev` ancestor `8d3c436`)
- [x] CMS: `feature/prices-migration` создана от `feature/services-migration` @ `71d9658`, pushed
- [x] Open questions подтверждены → Accepted decisions
- [x] Schema / importer / FE wiring **не** начинались
- [x] `docker-compose.yml` dirty в CMS **не** закоммичен

**Готовность:** ✅ Stage 0 complete — Ready for Stage 1
**⛔ Checkpoint:** подтверждение перед Этапом 1 (schema only)

---

### Этап 1 — CMS schema only

- [x] Collection `api::price-category.price-category` + draftAndPublish
- [x] Components: `price.position`, `price.factor`, `price.faq-item`
- [x] Soft `serviceSlug` enum `individual|package` (top-level; flattened from `related.serviceSlug`)
- [x] Soft related: `relatedArticleSlugs` / `relatedCategorySlugs` (json)
- [x] Category SEO via `shared.seo` (required)
- [x] Bootstrap public `find` / `findOne`; writes 403
- [x] Smoke: GET `/api/price-categories` → `[]` 200; articles=8; projects=7; services=2; POST/PUT/DELETE → 403
- [x] Article/Project/Service schemas **не** трогались
- [x] No importer / no FE runtime / no seed
- [x] `docker-compose.yml` dirty **не** committed

**Фактическая schema PriceCategory (Stage 1):**
- Scalar: `title`, `slug` (uid), `titleAccent`, `eyebrow`, `lead`, `priceFrom` (integer), `priceUnit`, `disclaimer`, `serviceSlug?` (`individual|package`), `relatedArticleSlugs?` (json), `relatedCategorySlugs?` (json), `sortOrder`
- Nested: `positions[]` → `price.position` `{ name, unit, priceFrom, note?, sortOrder }`
- Nested: `factors[]` → `price.factor` `{ title, text, sortOrder }`
- Nested: `faq[]` → `price.faq-item` `{ question, answer, sortOrder }`
- SEO: `seo` → `shared.seo` `{ title, description, keywords }`

**Отличия от запроса / source naming:**
- Нет `shortTitle` / `navTitle` в source → не добавлены; есть `titleAccent` + `eyebrow`
- `description` → поле `lead` (как в FE)
- `related` object flatten: `serviceSlug` + json slug arrays (не отдельный component)
- Нет `group`/`section` на position → не добавлены
- Добавлены `sortOrder` на CT и nested (в FE data отсутствуют; нужны для Admin/import order)
- Hub `/prices` SEO **не** в schema (hardcoded)

**Готовность:** ✅ Stage 1 complete — Ready for Stage 2
**⛔ Checkpoint:** подтверждение перед seed / dry-run

---

### Этап 2 — Seed + dry-run

- [x] `scripts/seed/price-categories.json` из `prices.data.ts` (`build-prices-seed.mts`)
- [x] `pnpm prices:import:dry` — без Strapi/DB
- [x] Validate: count=15, unique slugs, positions=259, no Windows abs paths
- [x] Parity field-by-field vs local (`parityIssues=[]`)
- [x] Inventory: `categoriesWithArticleSlugs=6` (UI may not render); `positionsWithNote=0`
- [x] Frontend wiring / live DB writes **не** на Stage 2

**Готовность:** ✅ Stage 2 complete — Ready for Stage 3

---

### Этап 3 — Live import

- [x] Idempotent upsert по `slug` (`import-prices.cjs`)
- [x] Publish 15 categories (import1: created=15; import2: created=0 updated=15)
- [x] Seed ↔ Strapi parity OK (null/undefined optional json normalized)
- [x] REST smoke `pnpm prices:parity`: 15 cats / 259 positions; articles=8; projects=7; services=2
- [x] Schema не менялась

**Готовность:** ✅ Stage 3 complete — Ready for Stage 4

---

### Этап 4 — Frontend wiring (без cutover)

- [x] `getPricesContentSource()` default `local`
- [x] Zod DTO + `adaptStrapiPriceCategory` → `PriceCategory`
- [x] `strapi` / `snapshot` / `local` repositories + factory
- [x] `prices.snapshot.json` (+ `parity:prices`, `snapshot:prices`)
- [x] Prerender: category paths from snapshot/strapi + FALLBACK_PRICE_PATHS; hub+thanks static
- [x] Builds: local / strapi / snapshot / strapi-down→snapshot OK
- [x] FE parity local/snapshot/Strapi 15/15 · 259/259
- [x] `prices.data.ts` сохранён; calculator / PHP / Services strings **не** трогались

**Готовность:** ✅ Stage 4 complete — Ready for Stage 5

---

### Этап 5 — Visual + SEO + CTA/docs QA

- [x] Visual: `/prices` (15 cards), `/prices/shtukaturka` (+ samples via HTTP), `/prices/thanks` (noindex)
- [x] SEO: category titles from data; hub meta hardcoded; thanks `noindex`
- [x] CTA: «Получить полный прайс» present on hub/category; soft link to `/services/individual`
- [x] Docs: CMS README + FE `docs/strapi-content-sources.md` + master plan
- [x] Master plan next domains documented (FAQ → …); FAQ **не** начат

**Готовность:** ✅ Completed locally / Waiting for production cutover
**Out:** production cutover

---

## 5. Risks & rollback

| Риск | Митигация | Rollback |
| --- | --- | --- |
| Смешать preview с calculator rates | Explicit non-goal; отдельные файлы/домены | local source |
| Опубликовать полный PDF в API | Импортировать только curated preview | PDF gate без изменений |
| Slug drift ломает sitemap/prerender | Seed фиксирует 15 slug; generate paths from source | static fallback list |
| Admin не читает deep nested positions | Components + validation в import | — |
| `articleSlugs` в data, UI игнор | Мигрировать для parity; UI wiring = follow-up | — |
| Route `prices/:categorySlug` vs `thanks` | Keep static thanks; never use slug `thanks` | — |
| Service marketing ≠ category `priceFrom` | Не sync автоматически | — |

Frontend rollback: `PRICES_CONTENT_SOURCE=local`.

---

## 6. Вопросы (закрыты Stage 0)

См. §3 Accepted decisions. Исходные рекомендации аудита совпали с подтверждением.

---

## 7. Контрольные точки (ждать подтверждения)

1. ~~После Этапа 0 (open questions)~~ ✅
2. ~~После Этапа 1 (schema)~~ ✅
3. ~~После Этапа 3 (import)~~ ✅
4. Перед merge frontend-ветки в `dev`
5. Любой production / DNS / удаление hardcode / публикация полного прайса — **вне этого плана**

---

## Progress log

| Дата | Событие |
| --- | --- |
| 2026-08-16 | Read-only аудит Prices. Status=**Planned**. |
| 2026-08-16 | **Stage 0 complete.** Decisions accepted. Status → Ready for Stage 1. |
| 2026-08-16 | **Stage 1 complete.** Schema `PriceCategory` + components @ CMS `9438682`. Status → Ready for Stage 2. |
| 2026-08-16 | **Stage 2 complete.** Seed 15/259; dry-run errors=0; parityIssues=[]. |
| 2026-08-16 | **Stage 3 complete.** Live import idempotent; REST 15/259; articles/projects/services intact. |
| 2026-08-16 | **Stage 4 complete.** `PRICES_CONTENT_SOURCE` dual-run; snapshot; prerender fallback; builds OK. |
| 2026-08-16 | **Stage 5 complete.** Visual/SEO/CTA QA + docs + master plan. |
| | Status → **Completed locally / Waiting for production cutover**. |


---

## Next action

**Ждать подтверждения production cutover** (отдельно) и/или **go-ahead на следующий домен FAQ**.
FAQ schema/branch **не** начинать без явного запроса.
Не merge в `dev`/`main`, не deploy.
