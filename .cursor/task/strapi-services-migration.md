# Strapi: миграция услуг (Services)

**Status:** Completed locally / Waiting for production cutover
**Scope:** Collection `Service` — `individual` + `package`
**Frontend branch:** `feature/strapi-journal-pilot`
**CMS branch (approx):** `feature/services-migration`
**Counts:** 2 services

---

## Decisions (keep)

- Dual-run: `SERVICES_CONTENT_SOURCE`, default **`local`**
- Stable ids: `serviceId` / `slug` = `individual` \| `package` — **do not rename** without mapping
- Media: portable **`imagePath`** + optional `cover` media
- Marketing strings `price` / `duration` ≠ Prices domain / calculator
- Nested: hero / included / storyIndividual | storyPackage + SEO
- Field **`isFeatured`** exists in CMS schema but **frontend does not use it** (reserved / future) — do not remove without separate decision
- No FAQ / PriceCategory relations on Service

---

## Outcome

Stage 0–5 complete locally. Production cutover — out of scope.

See: [`docs/strapi-editor-guide.md`](../../docs/strapi-editor-guide.md)

---

## Progress log (short)

| Дата | Событие |
| --- | --- |
| 2026-08-15–16 | Stages 0–5 complete |
| 2026-08-16 | Status confirmed; task compressed |
