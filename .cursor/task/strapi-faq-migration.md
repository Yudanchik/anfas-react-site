# Strapi: миграция FAQ

**Status:** Completed locally / Waiting for production cutover
**Scope:** `FaqGroup` — `home` (7) + `prices-hub` (4) = **11** items
**Frontend branch:** `feature/strapi-journal-pilot`
**CMS branch:** `feature/faq-migration`

---

## Decisions (keep)

- Dual-run: `FAQ_CONTENT_SOURCE`, default **`local`**
- Binding by `key` only (`home` \| `prices-hub`)
- Price-category FAQ stays in Prices domain (45 items) — **not** duplicated here
- Partners / Services / About FAQ — not migrated / not invented
- FAQPage JSON-LD on `/prices` remains **route-generated** from hub FAQ content

---

## Outcome

Stage 0–5 complete locally. Content pilot scope closed after FAQ. Partners skipped / keep in code.

See: [`docs/strapi-editor-guide.md`](../../docs/strapi-editor-guide.md), master-plan

---

## Progress log (short)

| Дата | Событие |
| --- | --- |
| 2026-08-16 | Audit → Stage 0–5 complete; Partners skipped later; task compressed |
