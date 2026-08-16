# Статус миграции контента в Strapi

**Статус:** Контентный scope завершён локально / Ждём инфраструктуру и production cutover
**Обновлено:** `2026-08-16`
**Ветка frontend:** `feature/strapi-journal-pilot`
**Ветка CMS (актуальный tip):** `feature/faq-migration`

Руководство редактора: [`strapi-editor-guide.md`](./strapi-editor-guide.md)
Dual-run для разработчика: [`strapi-content-sources.md`](./strapi-content-sources.md)
Master-plan: `.cursor/task/strapi-content-master-plan.md`

Production Host-0 **не** переключён на Strapi. Все источники контента на фронте по умолчанию остаются **`local`**.

---

## Что уже перенесено (локально, dual-run готов)

| Раздел | CMS | Переменная FE | Количество | Примечание |
| --- | --- | --- | --- | --- |
| Статьи | `Article` (+ category) | `CONTENT_SOURCE` | 8 | Журнальный пилот |
| Проекты | `Project` | `PROJECTS_CONTENT_SOURCE` | 7 | Обложка + галерея + отзыв |
| Услуги | `Service` | `SERVICES_CONTENT_SOURCE` | 2 | `individual`, `package` |
| Прайс | `PriceCategory` | `PRICES_CONTENT_SOURCE` | 15 / 259 | Публичное превью |
| FAQ | `FaqGroup` | `FAQ_CONTENT_SOURCE` | 2 / 11 | `home` + `prices-hub` |

Каждый раздел: `local` \| `strapi` \| `snapshot`. В режиме `strapi` при недоступности CMS сайт падает на snapshot.

### Task-файлы

| Раздел | Файл | Статус |
| --- | --- | --- |
| Статьи | _(отдельного task нет)_ | Completed locally / waiting cutover |
| Проекты | `.cursor/task/strapi-projects-migration.md` | Completed locally / Waiting for production cutover |
| Услуги | `.cursor/task/strapi-services-migration.md` | Completed locally / Waiting for production cutover |
| Прайс | `.cursor/task/strapi-prices-migration.md` | Completed locally / Waiting for production cutover |
| FAQ | `.cursor/task/strapi-faq-migration.md` | Completed locally / Waiting for production cutover |

---

## Ветки

| Репозиторий | Ветка |
| --- | --- |
| `anfas-react-site` | `feature/strapi-journal-pilot` |
| `anfas-cms` | `feature/faq-migration` (tip; линия prices → services → projects) |

Не делать merge в `dev` / `main` и не деплоить без отдельного согласования.

---

## Переменные источника (defaults)

| Переменная | Значение по умолчанию |
| --- | --- |
| `CONTENT_SOURCE` | **`local`** |
| `PROJECTS_CONTENT_SOURCE` | **`local`** |
| `SERVICES_CONTENT_SOURCE` | **`local`** |
| `PRICES_CONTENT_SOURCE` | **`local`** |
| `FAQ_CONTENT_SOURCE` | **`local`** |

---

## Пропущено / отложено / non-goals

- **Оставлено в коде:** Partners, блоки Home/About, Navigation/Footer
- **Отложено:** SiteSettings / контакты / соцсети; глобальный route SEO/meta
- **Не переносим:** формы/PHP, калькулятор, PDF lead-magnet, analytics, legal как CMS

---

## Чеклист production cutover

1. Хостинг Strapi
2. Managed Postgres
3. Uploads / object storage
4. Env / secrets
5. Бэкапы
6. Webhook → пересборка frontend
7. DNS / поддомен CMS
8. Финальный parity на staging
9. Merge в `dev` (явно)
10. Переключение source на production (+ откат на `local`/`snapshot`)

**Следующий реальный шаг:** инфраструктура, а не новые контентные домены.
