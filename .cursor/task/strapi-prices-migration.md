# Strapi: миграция прайс-листа (Prices)

**Status:** Completed locally / Waiting for production cutover
**Scope:** Collection `PriceCategory` (public preview)
**Frontend branch:** `feature/strapi-journal-pilot`
**CMS branch (approx):** `feature/prices-migration`
**Counts:** 15 categories / 259 positions

---

## Decisions (keep)

- Dual-run: `PRICES_CONTENT_SOURCE`, default **`local`**
- Soft link `serviceSlug`: `individual` \| `package` (no Strapi relation)
- Nested: positions, factors, category FAQ (`price.faq-item`), SEO
- `priceFrom` = marketing «от», **not** calculator rates
- Hub FAQ (`prices-hub`) lives in **FAQ domain**, not here
- PDF / PHP lead-magnet stay outside Strapi
- `related.articleSlugs` stored for parity; **UI does not render article links yet** (reserved)
- No `isFeatured` on prices

---

## Outcome

Stage 0–5 complete locally. Production cutover — out of scope.

See: [`docs/strapi-editor-guide.md`](../../docs/strapi-editor-guide.md)

---

## Progress log (short)

| Дата | Событие |
| --- | --- |
| 2026-08-16 | Stages 0–5 complete; task compressed |
