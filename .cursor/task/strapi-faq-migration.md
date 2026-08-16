# Strapi: миграция FAQ

**Status:** Completed locally / Waiting for production cutover
**Next stage:** Infrastructure / production cutover (out of scope). Partners skipped / keep in code; content pilot scope closed.
**Scope:** Page-scoped FAQ вне Prices nested: **Home** + **Prices hub** (+ dual-run `FAQ_CONTENT_SOURCE`)
**Дата плана:** `2026-08-16`
**Frontend branch (current):** `feature/strapi-journal-pilot`
**CMS repo:** `Yudanchik/anfas-cms`
**CMS branch:** `feature/faq-migration` ← от `feature/prices-migration` @ `f2211f2`
**Паттерн:** как Articles / Projects / Services / Prices (отдельный env, default **local**)

---

## Scope / Out of scope

### In scope
- Home FAQ: `src/features/faq/model/faq.data.ts` → **7** items
- Prices hub FAQ: `src/entities/faq/model/prices-hub-faq.data.ts` → **4** items
- Frontend dual-run: `FAQ_CONTENT_SOURCE=local|strapi|snapshot` (default **`local`**)
- Snapshot + safe fallback; parity local ↔ snapshot ↔ Strapi
- Route-level `FAQPage` JSON-LD on `/prices` — **route-generated** from hub FAQ via repository

### Out of scope
- Production cutover / merge `dev`/`main` / deploy
- PriceCategory nested FAQ (45) — Prices domain
- Services / About FAQ (нет в коде)
- Accordion UI / forms / CTA
- Deleting local FAQ data until cutover
- Partners domain

---

## Accepted decisions (Stage 0)

1. FAQ — отдельный домен
2. `FaqGroup` + nested `faq.item`
3. Groups: `home`, `prices-hub`
4. Price category FAQ не переносим
5. Services/About FAQ не добавлять
6. Отдельный `FAQ_CONTENT_SOURCE`
7. Default всегда `local`
8. Связи через `key` only
9. FAQPage schema.org — route-generated
10. CMS branch `feature/faq-migration` from `feature/prices-migration`
11. Controlled e2e Stage 0→5 with green gates
12. После FAQ остановиться; Partners не начинать

---

## Progress

| Stage | Status |
| --- | --- |
| 0 Sync + decisions | ✅ |
| 1 CMS schema | ✅ |
| 2 Seed + dry-run | ✅ 2/11, parityIssues=[] |
| 3 Live import | ✅ created 2 → updated 2; REST 2/11 |
| 4 FE wiring | ✅ |
| 5 QA + docs | ✅ Completed locally / Waiting for production cutover |

### Gates (green)

- seed: 2 groups / 11 items (home 7, prices-hub 4)
- dry-run errors = 0; parityIssues = 0
- live import idempotent; REST count = 2/11
- FE parity local/snapshot/Strapi OK
- builds/checks OK; default source `local`

---

## Progress log

| Дата | Событие |
| --- | --- |
| 2026-08-16 | Audit + Planned |
| 2026-08-16 | Decisions confirmed; Stage 0–5 completed locally |

---

## Next action

**Stop.** Do not start Partners. Wait for production cutover / merge decision.
