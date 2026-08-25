# Internal floor estimate calculator — usage notes

## Route

`/internal/estimate`

- `robots: noindex, nofollow`
- Header link «Смета» is branch convenience only — decide before merge to `dev`

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

- Primary: PDF whitelist in `src/entities/estimate/model/floor-price.mapping.ts`
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

## Out of scope (MVP)

- materials
- finish coverings (laminate/quartz/parquet install)
- walls / ceilings / electro / plumbing sections
- auth / admin / persistence / PDF export
- Strapi / CMS / production deploy
