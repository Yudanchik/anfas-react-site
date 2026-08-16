# Strapi content migration — status

**Status:** Content scope completed locally / Waiting for infrastructure and production cutover  
**Updated:** `2026-08-16`  
**Frontend branch:** `feature/strapi-journal-pilot`  
**CMS branch (latest domain tip):** `feature/faq-migration`  

Production Host-0 is **not** switched to Strapi. All FE content-source defaults remain **`local`**.

---

## Migrated (local dual-run ready)

| Domain | CMS | FE env | Counts | Notes |
| --- | --- | --- | --- | --- |
| Articles | `Article` (+ category) | `CONTENT_SOURCE` | 8 | Journal pilot origin |
| Projects | `Project` | `PROJECTS_CONTENT_SOURCE` | 7 | Cover + gallery + review |
| Services | `Service` | `SERVICES_CONTENT_SOURCE` | 2 | `individual`, `package` |
| Prices | `PriceCategory` | `PRICES_CONTENT_SOURCE` | 15 cats / 259 positions | Public preview only |
| FAQ | `FaqGroup` | `FAQ_CONTENT_SOURCE` | 2 groups / 11 items | `home` (7) + `prices-hub` (4) |

Each domain supports `local` | `strapi` | `snapshot`. `strapi` falls back to committed snapshot if CMS is unreachable.

Task files (where present):

| Domain | Task | Status |
| --- | --- | --- |
| Articles | _(no separate task md — journal pilot)_ | Completed locally / waiting cutover |
| Projects | `.cursor/task/strapi-projects-migration.md` | Completed locally / Waiting for production cutover |
| Services | `.cursor/task/strapi-services-migration.md` | Completed locally / Waiting for production cutover |
| Prices | `.cursor/task/strapi-prices-migration.md` | Completed locally / Waiting for production cutover |
| FAQ | `.cursor/task/strapi-faq-migration.md` | Completed locally / Waiting for production cutover |

Living map: `.cursor/task/strapi-content-master-plan.md`  
Dual-run how-to: [`strapi-content-sources.md`](./strapi-content-sources.md)

---

## Branches

| Repo | Branch | Role |
| --- | --- | --- |
| `anfas-react-site` | `feature/strapi-journal-pilot` | All FE dual-run wiring + snapshots + docs |
| `anfas-cms` | `feature/faq-migration` (from prices → services → projects lineage) | Latest CMS tip with Articles…FAQ |

Do **not** merge to `dev` / `main` or deploy without separate approval.

---

## Env source flags (defaults)

| Variable | Scope | Default |
| --- | --- | --- |
| `CONTENT_SOURCE` | Articles | **`local`** |
| `PROJECTS_CONTENT_SOURCE` | Projects | **`local`** |
| `SERVICES_CONTENT_SOURCE` | Services | **`local`** |
| `PRICES_CONTENT_SOURCE` | Price categories | **`local`** |
| `FAQ_CONTENT_SOURCE` | FAQ groups | **`local`** |
| `STRAPI_URL` | When any source is `strapi` | unset in production |
| `STRAPI_TOKEN` | Optional | — |
| `STRAPI_TIMEOUT_MS` | Optional | `8000` |

**Production is not switched.** Host-0 builds must keep every source on `local` until an explicit cutover decision.

---

## Kept in code / skipped / deferred

### Skipped / keep in code

- **Partners** — small stable ticker/logos block; not a managed domain; migration adds complexity without benefit
- **Home / About / static narrative blocks** — high UI coupling; stay in frontend
- **Navigation / Footer** — site chrome, not CMS content for this pilot

### Deferred (until real need)

- **SiteSettings / contacts / socials** — postpone until there is a concrete ops need
- **Global route SEO / meta** — hub/list SEO often hardcoded; entity SEO already imported where needed; no global CMS SEO model now

### Non-goals (do not migrate)

- Forms / brief / PHP endpoints
- Calculator formulas and rates
- PDF lead-magnet / HMAC
- Analytics as CMS content
- Legal / cookie policy config as CMS content
- Deleting local `*.data.ts` before cutover
- Inventing content to fill CMS

---

## Remaining for VPS / production cutover

Content pilots are done. Cutover needs infrastructure and process, not more domain migrations:

1. **Hosting Strapi** (VPS or managed app host)
2. **Managed Postgres** (backups, migrations, credentials)
3. **Uploads / object storage** (S3-compatible or equivalent; not Host-0 disk alone)
4. **Env / secrets** (Strapi keys, DB URL, tokens — never in Git)
5. **Webhook / rebuild** (CMS publish → frontend rebuild/prerender)
6. **Backups** (DB + media)
7. **DNS / CMS subdomain** (e.g. `cms.…`) separate from public Host-0 site
8. **Final parity** local ↔ Strapi ↔ snapshot on staging
9. **Merge to `dev`** (explicit PR approval)
10. **Production env switch** — flip selected `*_CONTENT_SOURCE` to `strapi` only after parity + rollback plan

Rollback: set sources back to `local` (or `snapshot`) and redeploy Host-0.

---

## Next real step

**Infrastructure**, not content: choose Strapi host + Postgres + media storage, then staging dual-run against that CMS. Do not start Partners / SiteSettings / Home-About migrations by default.
