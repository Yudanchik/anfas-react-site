# Руководство редактора: контент Anfas и Strapi

Документ для человека, который наполняет сайт. Технический статус пилота: [`strapi-migration-status.md`](./strapi-migration-status.md).
Режимы dual-run для разработчика: [`strapi-content-sources.md`](./strapi-content-sources.md).

**Важно сейчас:** сайт в production по-прежнему берёт контент из **кода (local)**. Strapi уже готов локально, но **переключение production (cutover) не сделано**. Правки только в админке Strapi на боевом сайте пока не появятся.

---

## 1. Что уже подключено к Strapi

| Раздел | В CMS | Сколько сейчас | Где на сайте |
| --- | --- | --- | --- |
| Статьи (журнал) | Articles | 8 | `/blog`, `/blog/:slug` |
| Проекты | Projects | 7 | `/projects`, `/projects/:slug` |
| Услуги | Services | 2 (`individual`, `package`) | `/services/...` |
| Прайс (превью) | Price categories | 15 категорий / 259 позиций | `/prices`, `/prices/:slug` |
| FAQ | FAQ groups | 2 группы / 11 вопросов | главная + `/prices` |

---

## 2. Что пока остаётся в коде (не в Strapi)

- **Partners** (логотипы / бегущая строка) — специально не переносили
- **Home / About** — большие текстовые и визуальные блоки
- **Навигация и футер**
- **Формы заявок и PHP** на сервере
- **Калькулятор** (формулы и тарифы)
- **Глобальные SEO** хабов вроде `/prices`, `/services` (часто захардкожены на фронте)
- **Полный PDF прайса** и выдача файла по заявке

Их меняют разработчики в репозитории сайта, не через CMS.

---

## 3. Как работает безопасный режим

У каждого раздела свой переключатель источника:

| Переменная | Раздел |
| --- | --- |
| `CONTENT_SOURCE` | статьи |
| `PROJECTS_CONTENT_SOURCE` | проекты |
| `SERVICES_CONTENT_SOURCE` | услуги |
| `PRICES_CONTENT_SOURCE` | прайс |
| `FAQ_CONTENT_SOURCE` | FAQ |

Значения:

- **`local`** — контент из файлов сайта (по умолчанию, безопасно для production)
- **`strapi`** — читать из CMS; если CMS недоступна, сайт подстрахуется **snapshot**
- **`snapshot`** — зафиксированная копия контента в репозитории (запасной вариант для сборки)

**Почему default = local:** пока нет стабильного хостинга CMS, секретов, бэкапов и процедуры cutover, публичный сайт не должен зависеть от Strapi.

**«Production cutover не сделан»** значит: на Host-0 все источники = `local`. Контент в админке Strapi — для локальной/стейджинг-подготовки, не для живого сайта.

---

## 4. Как добавить статью

1. В админке Strapi создайте **Article** (или обновите seed + import — как принято у команды).
2. Заполните:
   - **title**, **titleAccent** (часть заголовка для акцента), **eyebrow**, **lead**
   - **slug** — латиница, часть URL `/blog/ваш-slug` (менять осторожно)
   - **category** — одна из тем журнала
   - **coverPath** / обложка + **coverAlt**
   - **publishedAtDate**, **readTime**
   - **seo** (title, description, keywords)
   - **sections** (блоки текста: heading, paragraphs, опционально list)
   - **checklist**, **mistakes**
   - **cta** (title, text, href)
   - **relatedArticles** (связи с другими статьями)
   - **relatedService** — `individual` или `package`
3. Опубликуйте (draftAndPublish).
4. После изменений на стороне разработки обычно:
   - обновить snapshot / local data по процессу команды
   - `pnpm parity:articles` (+ при необходимости `:strapi`)
   - `pnpm check` и `pnpm build` с нужным `CONTENT_SOURCE`

Пока production на `local`, новая статья на сайте появится только после обновления кода/`articles.data.ts` (или после будущего cutover).

---

## 5. Как добавить проект

1. Создайте **Project**.
2. Поля:
   - **title**, **slug**, **location**, **type**, **typeAccent**, **description**
   - **area**, **term**, **price** (текстовые маркетинговые значения)
   - **size** — раскладка карточки: `wide` | `tall` | `standard`
   - **imagePath** — публичный путь обложки, например `/images/projects/my-slug/01.webp`
   - **cover / image** (media) — файл в Strapi Media Library (для админки; сайт для dual-run предпочитает `imagePath`)
   - **gallery[]** — `imagePath`, опционально media, **sortOrder**, опционально alt
   - **sortOrder** группы/порядка — как принято в коллекции
   - **details** — список строк в данных (сейчас **фронт список details не показывает**; хранится для parity / будущего)
   - **review** — отзыв (quote, author, rating, details…) — **показывается** на странице проекта
   - **seo** — опционально; часто SEO генерирует фронт
3. Положите файлы картинок в `public/images/projects/...` на сайте (для local/snapshot).
4. Проверка: `pnpm parity:projects`, визуально `/projects` и карточка проекта.

Перед боевым cutover: отзывы должны быть проверенными (не «заглушки»).

---

## 6. Как менять услуги

Есть ровно две услуги: **`individual`** и **`package`**.

- **`serviceId` / `slug`** — не меняйте без согласования с разработкой (на них завязаны URL и связи).
- Редактируйте тексты: title, lead, tags, bullets, metrics, **price** / **duration** (маркетинговые строки, не калькулятор).
- Блоки **hero**, **included**, **storyIndividual** или **storyPackage**, **seo**.
- **imagePath** + опционально **cover**.
- Поле **`isFeatured`** в CMS есть, но **сайт его сейчас не использует** — задел на будущее. Не опирайтесь на него в контент-плане без доработки фронта.

Менять структуру вложенных блоков осторожно: сломанная схема сломает страницу услуги.

---

## 7. Как менять прайс

Коллекция **PriceCategory** — это **публичное превью** на сайте, не полный PDF.

Можно править:

- название, slug, lead, SEO категории
- **priceFrom** («от …») и **unit**
- **positions** (позиции превью), **factors** (что влияет на цену)
- **FAQ категории** (обычно 3 вопроса на категорию)
- **serviceSlug** — мягкая связь `individual` | `package`
- **sortOrder**

Не относится к этому разделу CMS:

- тарифы **калькулятора**
- выдача **PDF** / PHP / HMAC
- хаб-FAQ на `/prices` (это группа FAQ `prices-hub`)

Поле **related articleSlugs** может быть в данных, но **ссылки на статьи в UI категории сейчас не рисуются** — зарезервировано.

---

## 8. Как менять FAQ

Отдельные группы:

| key | Где видно | Сколько вопросов сейчас |
| --- | --- | --- |
| `home` | главная | 7 |
| `prices-hub` | страница `/prices` | 4 |

В группе: **items** с `question`, `answer`, **sortOrder**.

FAQ внутри категории прайса (`/prices/:slug`) — **не здесь**, а в PriceCategory.

Разметка **FAQPage** (schema.org) для `/prices` собирается **на фронте** из вопросов `prices-hub` — в CMS её отдельно не хранят.

---

## 9. Важные поля

### `imagePath`

Публичный путь к картинке на сайте.

- Пример: `/images/services/individual.webp`
- Нужен, чтобы сборка, snapshot и режим `local` работали одинаково без зависимости от URL загрузок Strapi
- **Нельзя:** путь Windows (`C:\...`), `http://localhost/...`
- Обычно начинается с `/images/...`
- Поле **media** в Strapi (cover/gallery) можно заполнять отдельно для удобства админки; фронт в dual-run предпочитает именно `imagePath`

### `isFeatured`

Сейчас есть в схеме **Service** в CMS.

**Сайт это поле не читает и нигде не показывает** — задел на будущее.
Удалять из схемы без отдельного решения не нужно; включать в контент-процесс тоже рано.

### `sortOrder`

Порядок вывода (категории, позиции, фото галереи, вопросы FAQ). Меньше число — обычно выше в списке.

### `slug`

Часть адреса страницы. Смена slug ломает старые ссылки и SEO — только осознанно, с редиректами при необходимости.

### `serviceId` / `serviceSlug`

Связь с форматами услуг: только **`individual`** или **`package`**.

---

## 10. Команды (для разработки)

### CMS (`anfas-cms`)

```bash
pnpm articles:import:dry   # проверка без записи
pnpm articles:import
pnpm projects:seed && pnpm projects:import:dry && pnpm projects:import && pnpm projects:parity
pnpm services:seed && pnpm services:import:dry && pnpm services:import && pnpm services:parity
pnpm prices:seed && pnpm prices:import:dry && pnpm prices:import && pnpm prices:parity
pnpm faq:seed && pnpm faq:import:dry && pnpm faq:import && pnpm faq:parity
pnpm check && pnpm build
```

### Frontend (`anfas-react-site`)

```bash
pnpm parity:articles
pnpm parity:projects && pnpm parity:projects:strapi   # нужен STRAPI_URL
pnpm parity:services && pnpm parity:services:strapi
pnpm parity:prices && pnpm parity:prices:strapi
pnpm parity:faq && pnpm parity:faq:strapi

pnpm snapshot:projects
pnpm snapshot:services
pnpm snapshot:prices
pnpm snapshot:faq

pnpm check
pnpm build   # все *_CONTENT_SOURCE по умолчанию local
```

---

## 11. Перед публикацией на production

1. Хостинг Strapi (VPS / cloud)
2. Managed Postgres + бэкапы
3. Хранилище uploads (S3 или аналог)
4. Секреты и env (не в Git)
5. HTTPS и поддомен CMS
6. Webhook → пересборка сайта
7. Финальный parity на staging
8. Merge в `dev` / релиз по согласованию
9. Явное переключение `*_CONTENT_SOURCE=strapi` (cutover) + план отката на `local`/`snapshot`

До этого шага **не считайте** правки в локальном Strapi опубликованными на anfas-remont.ru.
