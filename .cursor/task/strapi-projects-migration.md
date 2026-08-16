# Strapi: миграция проектов и галерей

**Status:** Completed locally / Waiting for production cutover
**Scope:** `Project` + cover/gallery (+ review, details, size)
**Frontend branch:** `feature/strapi-journal-pilot`
**CMS branch (approx):** `feature/projects-migration`
**Counts:** 7 projects

---

## Decisions (keep)

- Dual-run: `PROJECTS_CONTENT_SOURCE=local|strapi|snapshot`, default **`local`**
- Cover/gallery: portable **`imagePath`** (`/images/projects/...`) + optional Strapi media for admin
- `details` (JSON string[]): stored for parity; **UI list narrative not rendered yet**
- `review`: shown on project page; authenticity gate before production cutover
- SEO: optional in CMS; frontend keeps route-generated SEO when empty
- Do not delete `projects.data.ts` until cutover

---

## Outcome

Stage 0–5 complete locally. Parity local ↔ snapshot ↔ Strapi OK. Production cutover / merge `dev` — out of scope.

See: [`docs/strapi-editor-guide.md`](../../docs/strapi-editor-guide.md), [`docs/strapi-migration-status.md`](../../docs/strapi-migration-status.md)

---

## Progress log (short)

| Дата | Событие |
| --- | --- |
| 2026-08-15 | Stages 0–5 complete; Ready for next content migration |
| 2026-08-16 | Status → **Completed locally / Waiting for production cutover**; task compressed |
