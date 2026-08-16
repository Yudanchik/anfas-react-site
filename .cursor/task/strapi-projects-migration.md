# Strapi: миграция проектов и галерей

**Status:** Completed locally / Waiting for production cutover
**Next stage:** Infrastructure / production cutover (out of scope for this task). Content pilot scope closed — see master-plan.
**Scope:** только `Project` + cover/gallery (+ review, details, size)
**Repos:** `2026-08-15`
**Frontend branch (current):** `feature/strapi-journal-pilot`
**CMS repo:** `Yudanchik/anfas-cms` (`main`)

---

## Scope / Out of scope

### In scope
- Collection type `Project` в Strapi 5
- Импорт всех **7** существующих проектов и их медиа
- Frontend dual-run: `local` / `strapi` / `snapshot` **только для проектов**
- Snapshot + prerender URL для `/projects` и `/projects/:slug`
- Parity local ↔ snapshot ↔ Strapi
- Переиспользование `shared.seo` (опционально + fallback генерации как сейчас)

### Out of scope
- Production cutover, DNS, Host-0/CMS hosting
- Удаление `projects.data.ts`
- Services, Prices, FAQ, Home, About, Articles (уже в пилоте)
- Связи Project↔Service / Project↔Article (в модели их нет)
- Переписывание UI `/projects`, `/projects/:slug`, lightbox
- S3 в этом этапе (только подготовка в плане)

---

## Decisions (зафиксировано аудитом)

| Тема | Решение по факту кода |
| --- | --- |
| Количество | **7** проектов |
| Repository | `ProjectRepository { getAll, getBySlug }` — единственный контракт |
| Прямые импорты `projects.data` | Только `local-project.repository.ts` |
| SEO в данных | **Нет** поля `seo` у `Project`; meta собирается в `route.tsx` |
| Gallery item | Только `string` path; alt генерируется в UI |
| `details` | Есть в типе и data, **не рендерится** на detail-странице (мёртвое для UI, мигрируем для parity данных) |
| `size` | `'wide' \| 'tall' \| 'standard'`; используется в `HomeProjects` (виджет сейчас **не подключён** на `/`) |
| Related projects | Нет |
| `review` | Есть у всех 7; `rating` 1–5; `service` — свободная строка, не enum |
| Journal CONTENT_SOURCE | Глобальный `CONTENT_SOURCE` уже для статей — для проектов нужен **отдельный** флаг |
| Prerender | Сейчас slug проектов **захардкожены** в `STATIC_PATHS` в `prerender-paths.ts`; блог уже динамический |

---

## Accepted decisions (Stage 0 — 2026-08-15)

| # | Решение |
| --- | --- |
| 1 | Отдельный **`PROJECTS_CONTENT_SOURCE=local\|strapi\|snapshot`** (default `local`). Не меняет источник статей (`CONTENT_SOURCE`). |
| 2 | SEO: **вариант A** — `shared.seo` optional. Без SEO в CMS frontend использует текущую генерацию title/description/canonical/OG. При импорте **не** создавать выдуманные SEO-тексты. |
| 3 | **`details[]` переносим полностью** в Strapi + snapshot. UI detail **не** меняем, новые блоки не выводим. |
| 4 | Gallery `alt` в CMS **optional**. Frontend: обязательный детерминированный fallback «название проекта + порядковый номер». Пустой alt — только для действительно декоративных изображений. |
| 5 | Отзывы импортируем **published** ровно как сейчас на сайте; содержание не менять и не дописывать. **Обязательная проверка достоверности отзывов перед production cutover** (см. ниже). |
| 6 | Sync с `dev`: **merge**, не rebase. **Force push запрещён**. |

### Gate before production cutover (reviews)
- [ ] Владелец подтвердил, что все 7 отзывов достоверны / заменены на реальные
- [ ] Нет пометки «Temporary mock reviews» в production-источнике
- Без этого чекпоинта cutover Projects **не выполнять**

---

## Open questions

*Все вопросы 1–6 закрыты решениями Stage 0.*

---

## 1. Текущее состояние (аудит)

### 1.1 Проекты (7)

| # | slug | URL | size | gallery files on disk | review |
| --- | --- | --- | --- | --- | --- |
| 1 | `2-murinskiy-37` | `/projects/2-murinskiy-37` | tall | 39 | yes |
| 2 | `zhk-grafika` | `/projects/zhk-grafika` | wide | 39 | yes |
| 3 | `verkhnekamenskaya` | `/projects/verkhnekamenskaya` | standard | 13 | yes |
| 4 | `prospekt-slavy-4` | `/projects/prospekt-slavy-4` | standard | 29 | yes |
| 5 | `forest-akvilon` | `/projects/forest-akvilon` | wide | 14 | yes |
| 6 | `id-kudrovo` | `/projects/id-kudrovo` | standard | 15 | yes |
| 7 | `grand-house` | `/projects/grand-house` | tall | 15 | yes |

Cover (`image`) — отдельный webp из той же папки проекта (часто пересекается с gallery).

### 1.2 Медиа

- Корень: `public/images/projects/**`
- **164** файла, все **`.webp`**
- Порядок галереи = порядок массива `gallery[]` в data (01…N)
- Отдельных width/height в data нет; UI не задаёт intrinsic sizes для gallery img

### 1.3 Зависимости

| Потребитель | Как берёт данные |
| --- | --- |
| `/projects` | `projectRepository.getAll()` |
| `/projects/:slug` | `projectRepository.getBySlug` |
| `/prices/thanks` | `getAll()` → `slice(0, 3)` |
| `HomeProjects` | props; **на home сейчас не используется** |
| SEO/OG | `createSeoMeta` в routes; image = `/${project.image}` |

### 1.4 Прямые импорты и риски

- Прямой импорт `projects.data` — **только** `local-project.repository.ts` (хорошо для dual-run).
- Риск: `prerender-paths.ts` держит project slug в `STATIC_PATHS` — при росте CMS список может разъехаться со snapshot.
- Риск: глобальный `CONTENT_SOURCE=strapi` включит статьи и (если не разделить) проекты одновременно.
- Риск: mock reviews попадут в CMS как «боевые».
- Риск: `details[]` не в UI — можно ошибочно «упростить» схему и потерять контент.
- Риск: ветка `feature/strapi-journal-pilot` долгоживущая — нужна синхронизация с `dev` до кода.

### 1.5 Git (на момент плана)

- Frontend: `feature/strapi-journal-pilot` tracking `origin/feature/strapi-journal-pilot`
- CMS: `main` tracking `origin/main` (есть локальный dirty `docker-compose.yml` — **не трогать** в этом плане без отдельной задачи)

---

## 2. Field mapping

| Project field | TS type | Strapi field | Strapi type | Req? | Migration | Fallback | Parity rule |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `slug` | `string` | `slug` | `uid` (from title) | yes | copy as-is | — | exact |
| `title` | `string` | `title` | `string` | yes | copy | — | exact |
| `type` | `string` | `type` | `string` | yes | copy | — | exact |
| `typeAccent` | `string` | `typeAccent` | `string` | yes | copy | — | exact |
| `location` | `string` | `location` | `string` | yes | copy | — | exact |
| `description` | `string` | `description` | `text` | yes | copy | — | exact |
| `image` | `string` | `imagePath` + `image` | `string` + media single | path yes; media no | path copy; upload file; dedupe by hash/path | keep `imagePath` if upload fails on update | path exact; media optional |
| `area` | `string` | `area` | `string` | yes | copy | — | exact |
| `term` | `string` | `term` | `string` | yes | copy | — | exact |
| `price` | `string` | `price` | `string` | yes | copy (NBSP preserved) | — | exact unicode |
| `size` | `ProjectSize` | `size` | enum `wide\|tall\|standard` | yes | copy | — | exact |
| `gallery` | `readonly string[]` | `gallery` repeatable component | see §3 | yes | ordered upsert; upload each | skip missing file → error row | ordered path list exact |
| `details` | `readonly string[]` | `details` | `json` | yes | copy array | `[]` | exact |
| `review` | `ProjectReviewData?` | `review` component | see §3 | no | all 7 present | omit | deep equal if present |
| `review.quote` | `string` | `quote` | `text` | yes* | copy | — | exact |
| `review.details` | `string?` | `details` | `text` | no | copy | null | exact |
| `review.author` | `string` | `author` | `string` | yes* | copy | — | exact |
| `review.projectInfo` | `string?` | `projectInfo` | `string` | no | copy | null | exact |
| `review.location` | `string?` | `location` | `string` | no | copy | null | exact |
| `review.rating` | `1\|2\|3\|4\|5` | `rating` | integer 1–5 (or enum) | yes* | copy | — | exact |
| `review.service` | `string?` | `service` | `string` | no | copy free text | null | exact |
| *(UI SEO)* | generated | `seo` optional `shared.seo` | component | no | fill on import **or** leave empty | regenerate in adapter/meta | if seo empty → same formula as current meta |

\*required when `review` component present.

**Adapter cover rule (как у статей):** frontend `Project.image` / `gallery[]` = **path strings** (`imagePath` / `gallery[].imagePath`) для Host-0 dual-run; Strapi media — для админки/будущего CDN.

---

## 3. Strapi schema

### 3.1 Reuse
- **`shared.seo`** — уже есть; использовать optional на Project (не дублировать).

### 3.2 New components

**`project.review`**
- `quote` text required
- `details` text optional
- `author` string required
- `projectInfo` string optional
- `location` string optional
- `rating` integer required (min 1 max 5)
- `service` string optional

**`project.gallery-item`**
- `imagePath` string required
- `image` media single optional (images)
- `alt` string optional
- `sortOrder` integer required (0-based, сохраняет порядок)

### 3.3 Collection `api::project.project`

| Attribute | Type | Notes |
| --- | --- | --- |
| `title` | string req | |
| `slug` | uid req | targetField title; **values from existing slugs** |
| `type` | string req | |
| `typeAccent` | string req | |
| `location` | string req | |
| `description` | text req | |
| `imagePath` | string req | maps to `Project.image` |
| `image` | media single opt | cover upload |
| `area` | string req | |
| `term` | string req | |
| `price` | string req | |
| `size` | enum wide/tall/standard req | |
| `gallery` | component `project.gallery-item` repeatable req | order by sortOrder |
| `details` | json req | string[] |
| `review` | component `project.review` opt | |
| `seo` | component `shared.seo` opt | |
| draftAndPublish | **true** | publish on import |

Нет relations на Services/Articles — в фактической модели их нет.

---

## 4. Импорт

Скрипт CMS: `scripts/import-projects.cjs` (+ seed `scripts/seed/projects.json` из frontend data).

| Требование | Поведение |
| --- | --- |
| dry-run | `--dry-run`: валидация seed, slug uniq, файлы cover/gallery существуют; без записи |
| upsert | по `slug` |
| media dedupe | искать существующий upload по имени/hash/folder; не плодить копии при re-import |
| gallery order | `sortOrder` = index; update заменяет весь component set |
| missing image | ошибка по slug в `errors[]`; остальные проекты продолжают |
| report | `count/created/updated/skipped/errors` (+ mediaUploaded) |
| idempotent | 2-й прогон: updated=N, created=0, без новых media при тех же файлах |
| rollback | не удалять published автоматически; откат = re-import из seed / restore DB volume; frontend остаётся на `local` |

Команды (планируемые): `pnpm projects:import:dry`, `pnpm projects:import`.

---

## 5. Медиа

| Тема | План |
| --- | --- |
| Local pilot | Strapi local upload (`public/uploads`); Postgres volume Docker |
| Не в Git | `public/uploads/*`, `.env`, DB volumes, `node_modules`, `dist` |
| Formats | сохранить webp; alt из optional или UI fallback |
| Public URL Host-0 | dual-run: сайт продолжает отдавать `/images/projects/...` через `imagePath` |
| После VPS | `@strapi/provider-upload-aws-s3` (или S3-compatible); отдельный этап + remap URL только после cutover |
| Checks | каждый cover + каждый gallery path существует; порядок; visual lightbox |

---

## 6. Frontend

Зеркало journal-паттерна, **изолированно от статей**:

1. `PROJECTS_CONTENT_SOURCE` (или согласованный аналог) — default `local`
2. `strapi` DTO + Zod (`shared/content/strapi/project.dto.ts`)
3. `adaptStrapiProject` → существующий `Project`
4. `strapiProjectRepository` + snapshot fallback
5. `snapshot-project.repository` + `projects.snapshot.json`
6. `entities/project/api/index.ts` — factory по env проектов
7. UI/routes **без изменений** API компонента
8. SEO: если `seo` пуст — та же формула, что в `project/route.tsx`

Расширить `prerender-paths.ts`:
- убрать project slug из вечного `STATIC_PATHS` **или** оставить как safety net
- добавить `resolveProjectPrerenderPaths()` из snapshot / Strapi / local
- при недоступной CMS — snapshot; **не** обнулять список

---

## 7. SEO и prerender

| URL | Источник meta сейчас | После миграции |
| --- | --- | --- |
| `/projects` | статичный `createSeoMeta` в route | без изменений |
| `/projects/:slug` | title/type/description/area/term/price + OG image | slug неизменны; OG path = `/${image}` |

Prerender: все 7 slug + `/projects` всегда в build при наличии snapshot.

---

## 8. Проверки (Definition of Done этапа)

- [ ] local ↔ snapshot parity 7/7 (все поля mapping)
- [ ] local ↔ Strapi parity 7/7
- [ ] повторный import idempotent
- [ ] CMS `check` + `build`
- [ ] FE `check`
- [ ] FE build `PROJECTS_CONTENT_SOURCE=local`
- [ ] FE build `=strapi` (CMS up)
- [ ] FE build `=strapi` при CMS down → snapshot, 7 страниц на месте
- [ ] Visual: list, detail, gallery/lightbox
- [ ] `CONTENT_SOURCE` статей не сломан
- [ ] production / DNS / Host-0 не трогали; hardcode не удалён

---

## Этапы реализации (checkbox tracker)

> В следующих задачах: «выполни только этап N», затем «обнови task-файл».

### Этап 0 — Синхронизация ветки и подтверждение решений
- [x] **0.1** `git fetch` + сравнение с `origin/dev`
- [x] **0.2** Merge `origin/dev` в `feature/strapi-journal-pilot` (Already up to date; conflicts none)
- [x] **0.3** Зафиксированы ответы на Open questions 1–6 (см. Accepted decisions)

**Файлы:** `.cursor/task/strapi-projects-migration.md`
**Проверки:** `pnpm check`, build local, articles parity 8/8, `git diff --check`
**Готовность:** ✅ Stage 0 complete — Ready for Stage 1
**⛔ Checkpoint:** подтверждение перед Этапом 1 (schema)

---

### Этап 1 — CMS schema Project
- [x] **1.1** Components `project.review`, `project.gallery-item`
- [x] **1.2** Collection type `project` (+ optional `shared.seo`; без автогенерации SEO)
- [x] **1.3** Public permissions find/findOne via bootstrap (как Article)
- [x] **1.4** CMS `check` / `build` + API smoke (GET 200, write/PUT/DELETE 403)

**Фактически создано (CMS `feature/projects-migration` @ `5c33624`):**
- `project.review`: quote, details?, author, projectInfo?, location?, rating (1–5), service?
- `project.gallery-item`: imagePath, image?, alt?, sortOrder
- `Project`: title, slug, type, typeAccent, location, description, imagePath, image?, area, term, price, size(enum wide|tall|standard), gallery[], details(json), review?, seo?(shared.seo); draftAndPublish=true
- Public actions only: `api::project.project.find`, `api::project.project.findOne`
- Article schema/import **не изменены**; GET `/api/articles` по-прежнему 8

**Файлы (CMS):** `src/components/project/*`, `src/api/project/**`, `src/index.ts`, `types/generated/*`
**Готовность:** ✅ Stage 1 complete — Ready for Stage 2
**⛔ Checkpoint:** подтверждение перед Этапом 2 (seed/dry-run)
**Не делать до этапа 2+:** importer write, media upload, frontend wiring

---

### Этап 2 — Seed + import dry-run
- [x] **2.1** Экспорт `scripts/seed/projects.json` из `projects.data.ts` (tsx import; data.ts не менялся)
- [x] **2.2** `pnpm projects:import:dry` (без Strapi/DB/media)
- [x] **2.3** Отчёт: 7 проектов, media found; повторный dry-run идентичен

**Dry-run media counts (2026-08-15):**
| Metric | Value |
| --- | --- |
| projects total | **7** |
| unique slugs | 7 |
| covers referenced / found / missing | **7 / 7 / 0** |
| gallery items referenced / found / missing | **164 / 164 / 0** |
| unique media files | **164** |
| duplicate media refs (cover∩gallery) | **7** paths, count=2 each (expected) |
| missing alt | **164** (warning only; source has no alt) |
| orphan files under `public/images/projects` | **0** |
| errors | **[]** |
| warnings | **171** (164 missing alt + 7 cover-in-gallery) |
| exit code | **0** |

**details[] analysis (schema not changed in stage 2):**
- Фактически: `string[]`, 3–8 элементов на проект, всего **42** строки.
- Смешанный контент в одном массиве: вводные абзацы, заголовки («Основные работы:»), пункты работ, заключения — **без** стабильной пары title/body.
- Сейчас в schema: `details: json` (stage 1).
- **Решение для этапа 3:** **оставить JSON**. Repeatable component (`text` lines) имеет смысл позже для Admin UX, не до live import; смена схемы сейчас даст лишнюю миграцию без выигрыша для parity.

**Готовность:** ✅ Stage 2 complete — Ready for Stage 3
**⛔ Checkpoint:** подтверждение перед Этапом 3 (live import + media upload)

---

### Этап 3 — Import + media
- [x] **3.1** Live importer `pnpm projects:import`: created=7, published; Article не тронут
- [x] **3.2** Upload cover + gallery; dedupe по `caption`=public path + stable name; `sortOrder` сохранён
- [x] **3.3** Повторный import: created=0, updated=7; mediaUploaded=0, mediaReused=164; uploadFileCount стабилен (180)
- [x] **3.4** REST smoke `pnpm projects:parity`: projects=7, gallery=164+media, articles=8, issues=[]
- [x] **3.5** Schema не менялась (`details` JSON); FE DTO/UI/snapshot не трогались

**Фактические результаты импорта (2026-08-15):**

| Run | created | updated | skipped | errors | mediaUploaded | mediaReused | mediaCacheHits | uploadFileCount | parity |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1st live | **7** | 0 | 0 | 0 | **164** | 0 | 7 | 180 | ok |
| 2nd live | **0** | **7** | 0 | 0 | **0** | **164** | 7 | **180** (no dupes) | ok |

**REST smoke:**
- GET `/api/projects` → **7** published; slugs = seed
- coversWithMedia **7**; galleryItems **164**; galleryWithMedia **164**; unique media captions **164**
- GET `/api/articles` → **8** (unchanged)
- `details` JSON + `review` text parity ok; SEO not generated

**Готовность:** ✅ Stage 3 complete — Ready for Stage 4
**⛔ Checkpoint:** подтверждение перед Этапом 4 (frontend wiring)

---

### Этап 4 — Frontend wiring
- [x] **4.1** Zod DTO + `adaptStrapiProject` + `local` / `strapi` / `snapshot` factory
- [x] **4.2** `projects.snapshot.json` + `parity:projects` / `parity:projects:strapi` + `snapshot:projects`
- [x] **4.3** `PROJECTS_CONTENT_SOURCE` (default **local**); `CONTENT_SOURCE` статей не затронут
- [x] **4.4** Prerender: `/projects` + `/projects/:slug` из snapshot/CMS; Strapi-down → snapshot
- [x] **4.5** Builds: local / strapi-up / strapi-down→snapshot / snapshot — все OK

**Проверки Stage 4 (2026-08-15):**

| Check | Result |
| --- | --- |
| `pnpm check` | OK |
| `git diff --check` | OK |
| `parity:projects` local↔snapshot | **7/7** |
| `parity:projects:strapi` local↔Strapi | **7/7** |
| `parity:articles` | **8/8** (не сломан) |
| build `PROJECTS_CONTENT_SOURCE=local` | OK |
| build `=strapi` (Strapi up) | OK, 7 project pages |
| build `=strapi` (Strapi down) | OK, snapshot fallback |
| build `=snapshot` | OK |
| default без env | local (как production) |
| CMS changes | **нет** |

**Поведение:** imagePath → FE `image` без leading `/`; gallery по `sortOrder`; media URL Strapi не используется для parity; alt по-прежнему UI fallback; details в данных, UI не показывает; SEO route-generated.

**Готовность:** ✅ Stage 4 complete — Ready for Stage 5
**⛔ Checkpoint:** перед Stage 5 / перед merge в `dev`

---

### Этап 5 — Visual QA + Admin UX + decisions
- [x] **5.1** Visual QA `/projects` + все `/projects/:slug` в `local` / `strapi` / `snapshot` (desktop ~1440, tablet ~768, mobile ~390)
- [x] **5.2** Admin UX review Project (schema + live API shape)
- [x] **5.3** Decisions: details / gallery alt / review authenticity gate
- [x] **5.4** Docs: CMS README + FE `docs/strapi-content-sources.md`
- [x] **5.5** No production cutover; `projects.data.ts` retained

#### Visual QA summary (2026-08-15)

| Check | Result |
| --- | --- |
| Modes local / strapi / snapshot | Cover + gallery[0] + review quote **identical** |
| All 7 detail URLs HTTP 200 | OK in all 3 modes |
| List order (first 6 + «Показать ещё» → 7th) | Same across modes |
| Broken / localhost media | **0** |
| Desktop hero/detail | OK — no text overlap |
| Mobile ~390 | OK — stacked metrics, hamburger, no overlap |
| Tablet ~768 | OK — readable hero/metrics |
| Mapping/adapter bugs | **None found** — no code fix required |

**Follow-ups (pre-existing UI, not Stage 5 regressions):**
- List page paginates with «Показать ещё» (7th card `grand-house` behind button) — intentional UX, not data loss
- Long project titles may ellipsize on card grid (e.g. «ЖК Форест Аквилон…») — cosmetic

#### Admin UX

| Area | Assessment |
| --- | --- |
| title / slug / location / type / typeAccent | Clear string fields — OK for editors |
| cover | `image` media + portable `imagePath` — OK |
| gallery | `sortOrder` + `imagePath` + media — order is editable; `alt` nullable |
| review | quote / details / author / projectInfo / location / rating / service — clear |
| details JSON | Acceptable while UI does not render; not great for day-to-day editing |
| seo | null on all imports — OK (FE route SEO) |

#### Decisions (Stage 5)

1. **`details[]`:** **оставить JSON** до production cutover. Контент неоднородный (`string[]` абзацы/заголовки/пункты); UI не показывает. Repeatable component — только после отдельного подтверждения, не в Stage 5.
2. **`gallery.alt`:** **не генерировать массово**. Правило на будущее: заполнять вручную в CMS только осмысленные alt; пустое = декоративное / UI fallback «{title}: фото N». Frontend fallback остаётся техническим.
3. **Review authenticity gate (перед production cutover):**
   - [ ] Владелец подтвердил источник каждого из 7 отзывов
   - [ ] Есть разрешение на публикацию имени/локации (или анонимизация)
   - [ ] Отзыв соответствует реальному объекту (slug / адрес / метраж)
   - [ ] Rating не завышен искусственно; нет пометки mock во фронте как «боевой»
   - [ ] Снят комментарий `Temporary mock reviews` из `projects.data.ts` **или** reviews заменены на verified
   - Без этого чекпоинта Projects cutover **не выполнять**

**Готовность:** ✅ Stage 5 complete — **Ready for next content migration**
**Out:** production switch, merge в `dev`/`main` без отдельного подтверждения

---

### Рекомендация: следующий тип контента

После Projects + Articles пилотов логичный следующий блок:

1. **Services** (`/services`, individual/package) — меньше медиа, ясный DTO, переиспользует dual-run паттерн; **или**
2. **Prices** — если приоритет коммерции / прайс-категории.

Не начинать без отдельного task/плана и ветки.
---

## Контрольные точки (всегда ждать подтверждения)

1. После Этапа 0 (sync + open questions)
2. После Этапа 1 (schema)
3. После Этапа 3 (import)
4. Перед merge frontend-ветки в `dev`
5. Любой production / DNS / удаление hardcode — **вне этого плана**

---

## Risks & rollback

| Риск | Митигация | Rollback |
| --- | --- | --- |
| Потеря порядка галереи | `sortOrder` + parity | re-import |
| Дубли media | dedupe по path/hash | ручная чистка uploads |
| Сломать статьи env | отдельный `PROJECTS_CONTENT_SOURCE` | default local |
| Конфликт с `dev` | Этап 0 sync | revert merge commit |
| Schema неверна | checkpoint после этапа 1 | удалить CT до данных / migrate down |
| Mock / недостоверные отзывы | gate перед production cutover | не включать cutover без подтверждения владельца |

Frontend rollback: `PROJECTS_CONTENT_SOURCE=local`, hardcode на месте.

---

## Progress log

| Дата | Событие |
| --- | --- |
| 2026-08-15 | Read-only аудит выполнен. Task-файл создан, Status=Planned. Реализация не начата. |
| | Frontend: 7 projects, 164 webp, repository-only consumers (+ unused HomeProjects). |
| | CMS: reuse `shared.seo`; journal pilot already on `anfas-cms`. |
| | Git FE branch `feature/strapi-journal-pilot`; CMS `main`. |
| 2026-08-15 | **Stage 0 complete.** Decisions 1–6 accepted (см. Accepted decisions). |
| | Commit plan: `Add Strapi projects migration plan`. |
| | `git fetch`; `merge origin/dev` → **Already up to date** (base `8d3c436`). No conflicts. No force push. |
| | FE checks: `pnpm check`, build `CONTENT_SOURCE=local`, articles parity 8/8, `git diff --check`. |
| | Status → **Ready for Stage 1**. CMS schema / import / FE Project wiring **not started**. |
| 2026-08-15 | **Stage 1 complete.** CMS branch `feature/projects-migration`, commit `5c33624`. |
| | Schema: Project + project.review + project.gallery-item + optional shared.seo. |
| | Permissions: public find/findOne only; write 403. Articles API intact (8). |
| | Checks: schema JSON OK, `pnpm check`, `pnpm build`, smoke GET projects []. |
| | `docker-compose.yml` local dirty (CRLF) **not** committed. |
| | Status → **Ready for Stage 2**. |
| 2026-08-15 | **Stage 2 complete.** Seed + dry-run only (no live import). |
| | CMS: `scripts/seed/projects.json` (7), `build-projects-seed.mts`, `import-projects-dry.cjs`, `tsx` devDep; `tsconfig` excludes `scripts/`. |
| | Seed parity vs `projects.data.ts`: ok; no SEO invented; no alt invented; paths `/images/...` only. |
| | Dry-run ×2 identical: covers 7/7/0, gallery 164/164/0, unique 164, orphans 0, errors [], warnings 171. |
| | Duplicate refs = 7 covers also in gallery (expected). Articles seed still 8; Article API untouched. |
| | `details[]`: keep JSON through stage 3 (heterogeneous string[]; no schema change). |
| | Checks: `pnpm check`, `pnpm build`, `git diff --check`, JSON parse OK. |
| | `docker-compose.yml` dirty **not** committed. Status → **Ready for Stage 3**. |
| 2026-08-15 | **Stage 3 complete.** Live import + media (local Strapi/Postgres only). |
| | CMS: `import-projects.cjs`, `projects-parity-smoke.cjs`; scripts `projects:import`, `projects:parity`. |
| | Import #1: created=7, mediaUploaded=164, mediaCacheHits=7 (cover∩gallery). |
| | Import #2: created=0, updated=7, mediaUploaded=0, mediaReused=164; uploadFileCount 180→180. |
| | REST parity: projects 7, gallery 164+media, articles 8, issues []. Schema unchanged. |
| | Checks: `pnpm check`, `pnpm build`, `git diff --check`. uploads/.env/docker-compose **not** committed. |
| | Status → **Ready for Stage 4**. |
| 2026-08-15 | **Stage 4 complete.** FE dual-run for Projects (no production cutover). |
| | `PROJECTS_CONTENT_SOURCE` default local; DTO/adapter; strapi/snapshot/local repos; snapshot JSON. |
| | Prerender project slugs dynamic; Strapi-down → snapshot. Articles `CONTENT_SOURCE` unchanged. |
| | Parity local↔snapshot 7/7; local↔Strapi 7/7; articles 8/8. |
| | Builds: local / strapi-up / strapi-down→snapshot / snapshot — all OK. CMS untouched. |
| | Status → **Ready for Stage 5**. |
| 2026-08-15 | **Stage 5 complete.** Visual QA + Admin UX + decisions + docs. |
| | Visual: local/strapi/snapshot parity visual+HTML; 7/7 details 200; no broken images; mobile/tablet/desktop OK. |
| | No adapter/schema fixes required. Pre-existing: list «Показать ещё», title ellipsis. |
| | Decisions: details=JSON; alt=manual later + UI fallback; review authenticity gate before cutover. |
| | Docs: CMS README projects workflow; FE `docs/strapi-content-sources.md`. |
| | Status → **Ready for next content migration**. |
| 2026-08-16 | Content pilot scope closed. Status → **Completed locally / Waiting for production cutover**. |


---

## Next action

Projects migration plan **complete through Stage 5**.
Status: **Completed locally / Waiting for production cutover**.
Ждать infrastructure + cutover approval (не новый content domain по умолчанию).
Не удалять hardcode и не менять production env без явного запроса.
