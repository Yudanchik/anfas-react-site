# Strapi content migration — status

**Status:** Content scope completed locally / Waiting for infrastructure and production cutover
**Updated:** `2026-08-16`
**Frontend branch:** `feature/strapi-journal-pilot`
**CMS branch (latest tip):** `feature/faq-migration`

Editor guide (RU): [`strapi-editor-guide.md`](./strapi-editor-guide.md)
Dual-run how-to: [`strapi-content-sources.md`](./strapi-content-sources.md)
Master plan: `.cursor/task/strapi-content-master-plan.md`

Production Host-0 is **not** switched to Strapi. All FE content-source defaults remain **`local`**.

---

## Completed domains

| Domain | CMS | FE env | Counts | Notes |
| --- | --- | --- | --- | --- |
| Articles | `Article` (+ category) | `CONTENT_SOURCE` | 8 | Journal pilot origin |
| Projects | `Project` | `PROJECTS_CONTENT_SOURCE` | 7 | Cover + gallery + review |
| Services | `Service` | `SERVICES_CONTENT_SOURCE` | 2 | `individual`, `package` |
| Prices | `PriceCategory` | `PRICES_CONTENT_SOURCE` | 15 / 259 | Public preview only |
| FAQ | `FaqGroup` | `FAQ_CONTENT_SOURCE` | 2 / 11 | `home` + `prices-hub` |

Each domain: `local` \| `strapi` \| `snapshot`. `strapi` falls back to committed snapshot if CMS is down.

### Task files

| Domain | Task | Status |
| --- | --- | --- |
| Articles | _(no separate task md)_ | Completed locally / waiting cutover |
| Projects | `.cursor/task/strapi-projects-migration.md` | Completed locally / Waiting for production cutover |
| Services | `.cursor/task/strapi-services-migration.md` | Completed locally / Waiting for production cutover |
| Prices | `.cursor/task/strapi-prices-migration.md` | Completed locally / Waiting for production cutover |
| FAQ | `.cursor/task/strapi-faq-migration.md` | Completed locally / Waiting for production cutover |

---

## Branches

| Repo | Branch |
| --- | --- |
| `anfas-react-site` | `feature/strapi-journal-pilot` |
| `anfas-cms` | `feature/faq-migration` (tip; lineage via prices → services → projects) |

Do **not** merge to `dev` / `main` or deploy without approval.

---

## Env flags (defaults)

| Variable | Default |
| --- | --- |
| `CONTENT_SOURCE` | **`local`** |
| `PROJECTS_CONTENT_SOURCE` | **`local`** |
| `SERVICES_CONTENT_SOURCE` | **`local`** |
| `PRICES_CONTENT_SOURCE` | **`local`** |
| `FAQ_CONTENT_SOURCE` | **`local`** |

---

## Skipped / deferred / non-goals

- **Skipped / code:** Partners, Home/About blocks, Navigation/Footer
- **Deferred:** SiteSettings/contacts/socials; global route SEO/meta
- **Non-goals:** forms/PHP, calculator, PDF lead-magnet, analytics, legal as CMS

---

## Cutover checklist

1. Host Strapi
2. Managed Postgres
3. Uploads / object storage
4. Env / secrets
5. Backups
6. Webhook → frontend rebuild
7. DNS / CMS subdomain
8. Final parity on staging
9. Merge to `dev` (explicit)
10. Production source switch (+ rollback to `local`/`snapshot`)

**Next real step:** infrastructure, not new content domains.
