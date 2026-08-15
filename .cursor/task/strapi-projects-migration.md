# Strapi: миграция проектов и галерей

**Status:** Ready for Stage 2
**Next stage:** Этап 2 — Seed + import dry-run
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

### Этап 2 — Seed + import dry-run ← **NEXT**
- [ ] **2.1** Экспорт `projects.json` из `projects.data.ts` (не меняя data.ts)
- [ ] **2.2** `import-projects.cjs` dry-run
- [ ] **2.3** Отчёт: 7 проектов, все media paths найдены

**Готовность:** dry-run errors=0
**⛔ Checkpoint:** можно писать в БД

---

### Этап 3 — Import + media
- [ ] **3.1** Первый import (created=7)
- [ ] **3.2** Повторный import (updated=7, created=0, media без дублей)
- [ ] **3.3** Проверка порядка gallery / cover

**Готовность:** REST отдаёт 7 published projects
**⛔ Checkpoint:** перед frontend wiring

---

### Этап 4 — Frontend repositories (без cutover)
- [ ] **4.1** DTO Zod + adapter + strapi/snapshot/local factory
- [ ] **4.2** `projects.snapshot.json` + parity script
- [ ] **4.3** `PROJECTS_CONTENT_SOURCE` (default local)
- [ ] **4.4** Prerender paths для projects
- [ ] **4.5** Builds: local / strapi / strapi-down

**Файлы (FE):** `entities/project/api/*`, `shared/content/**`, `prerender-paths.ts`, `.env.example`, scripts
**Не трогать:** UI widgets/routes кроме необходимости env
**Готовность:** parity 7/7; default local
**⛔ Checkpoint:** PR/review перед merge в dev

---

### Этап 5 — Visual QA + docs
- [ ] **5.1** List / detail / lightbox / thanks (3 projects)
- [ ] **5.2** Обновить README CMS (import projects)
- [ ] **5.3** Обновить этот task → Progress + статусы `[x]`

**Готовность:** чеклист §8
**Out:** production switch (отдельная задача)

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


---

## Next action

**Ждать подтверждения Этапа 2** (seed `projects.json` + `import-projects` dry-run only; без записи в БД / media).
Не начинать полный import / frontend Project integration без явного запроса.
