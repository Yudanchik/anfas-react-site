# Internal floor estimate calculator — usage notes

## Route

`/internal/estimate`

- `robots: noindex, nofollow`
- Header link «Смета» is **branch convenience only** (`SiteHeader` → `INTERNAL_NAV`)
- **Before merge to `dev`:** separately decide whether to keep, hide (e.g. DEV-only), or remove the header link

## What it does

Internal labour-only estimate for rough floors:

- demolition of floor coverings / screed / plinth
- base prep, primers
- semi-dry / wet screed chains
- self-leveling floor
- wet-zone waterproofing
- optional waste lines (manual enable)
- manual labour rows

## Price source

- Primary: PDF whitelist in `src/entities/estimate/model/floors/floor-price.mapping.ts`
- Frontend `prices.data.ts` used only for `source=both` conflict checks
- Public price data is not modified by the calculator

## Formulas

```
lineTotal = Math.round(quantity * unitPrice * coefficient)
total = sum(lineTotal for enabled lines)
```

- disabled / empty / negative quantity → 0
- invalid coefficient → 1
- materials are never included

## Recommendations

`getFloorRecommendation(avgDeltaMm)` suggests keys by height delta.
It never enables rows automatically.

## Checks

```bash
pnpm test:floor-estimate
pnpm check
pnpm build
```

## Extending with walls / ceilings / other sections

Актуальная раскладка и правила расширения: **`docs/estimate-calculator/`**
([README](./estimate-calculator/README.md), [architecture](./estimate-calculator/architecture.md)).

Do **not** rewrite the floors stack. Reuse shared calc and add a parallel section package under `model/<section>/` and `features/estimate-calculator/<section>/`.

## Out of scope (исторический MVP floors)

Ниже — ограничения раннего floors MVP. Стены уже на том же route; persistence есть.

- materials
- finish floor coverings (laminate/quartz/parquet install)
- ceilings / electro / plumbing (ещё нет)
- auth / admin / PDF export
- Strapi / CMS / production deploy
