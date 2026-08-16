# Strapi content migration — master plan

**Status:** Content scope completed locally / Waiting for infrastructure and production cutover
**Updated:** `2026-08-16`
**Frontend branch:** `feature/strapi-journal-pilot`
**CMS tip branch (latest domain):** `feature/faq-migration`
**Rule:** default content sources always **`local`** until explicit production cutover.

Production Host-0, DNS, VPS, merge to `dev`/`main`, and deleting `*.data.ts` are **out of scope** until infrastructure + cutover approval.

Canonical status: [`docs/strapi-migration-status.md`](../../docs/strapi-migration-status.md)
Editor guide (RU): [`docs/strapi-editor-guide.md`](../../docs/strapi-editor-guide.md)

---

## Completed locally (waiting cutover)

| Domain | CMS CT | FE env | Counts | CMS branch tip (approx) | Notes |
| --- | --- | --- | --- | --- | --- |
| Articles | `Article` (+ category) | `CONTENT_SOURCE` | 8 | journal pilot | Snapshot + dual-run; no separate task md (pilot origin) |
| Projects | `Project` | `PROJECTS_CONTENT_SOURCE` | 7 | `feature/projects-migration` | Media + review |
| Services | `Service` | `SERVICES_CONTENT_SOURCE` | 2 | `feature/services-migration` | Marketing `price` strings ≠ Prices |
| Prices | `PriceCategory` | `PRICES_CONTENT_SOURCE` | 15 / 259 positions | `feature/prices-migration` | Preview only; not calculator/PDF |
| FAQ | `FaqGroup` | `FAQ_CONTENT_SOURCE` | 2 groups / 11 items | `feature/faq-migration` | home + prices-hub; category FAQ stays in Prices |

**Content pilot scope is closed.** No further content-domain migrations in this pilot without a new explicit decision.

---

## Skipped / keep in code

| Domain | Status | Reason |
| --- | --- | --- |
| **Partners** | Skipped / keep in code | Небольшой стабильный блок, не отдельный управляемый домен; миграция добавит сложность без пользы |
| **Home / About / static blocks** | Skipped / keep in code | Высокая UI-сцепка; narrative/process/copy остаются в frontend |
| **Navigation / Footer** | Keep in code | Структура сайта / chrome, не CMS-контент этого пилота |

**Partners / Home-About — do not:**

- create task / schema / seed / importer
- add dual-run env flags
- start CMS branches for these domains

---

## Deferred (until real need)

| Domain | Status | Notes |
| --- | --- | --- |
| **SiteSettings / contacts / socials** | Deferred | Отложить до реальной потребности; prefer singleton if/when started |
| **Route SEO / meta (global)** | Deferred | Hub/list SEO чаще hardcoded; не переносить глобально сейчас. Per-entity SEO already on Articles/Services/Prices where imported |

---

## Explicit non-goals

- Forms / brief / PHP endpoints
- Calculator formulas / rates
- PDF lead-magnet / HMAC
- Analytics wiring as CMS content
- Legal config / policies content model
- Navigation / Footer as CMS content
- Partners / Home / About blocks migration (this stage)
- Production cutover without separate approval
- Force push / rebase workflows
- Deleting local `*.data.ts` until cutover

---

## What comes next (not content migration)

1. Infrastructure for Strapi (hosting, Postgres, uploads/storage, secrets, backups, CMS subdomain)
2. Webhook / rebuild pipeline
3. Final parity + merge to `dev` (explicit approval)
4. Production env switch (explicit cutover) — keep all `*_CONTENT_SOURCE=local` until then

Do **not** start a new content domain by default. Re-open only with an explicit decision (e.g. SiteSettings when needed).
