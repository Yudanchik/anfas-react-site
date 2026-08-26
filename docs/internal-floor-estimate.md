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

## Extending with walls / ceilings / other sections

Do **not** rewrite the floors stack. Reuse shared calc and add a parallel section package:

| Layer | Floors (existing) | Next section (e.g. walls) |
|-------|-------------------|---------------------------|
| Mapping | `floor-price.mapping.ts` | `wall-price.mapping.ts` (new whitelist) |
| Builders / helpers | `build-floor-estimate*.ts`, `apply-floor-quantities.ts`, `get-floor-recommendation.ts` | `build-wall-estimate*.ts`, wall apply helpers |
| Feature UI | `src/features/floor-estimate/` | `src/features/wall-estimate/` (or section tabs later) |
| Shared calc | `calculateLineTotal`, `calculateSectionTotal`, `calculateEstimateTotal` | reuse as-is |
| Types | `EstimateSection` / `EstimateLine` already multi-section via `sectionId` | add wall kinds to mapping; keep floor kinds untouched |

Practical steps:

1. Add mapping + assert vs frontend for `source=both` (same PDF-primary rule).
2. Add pure builders/tests under `src/entities/estimate/model/`.
3. Compose sections with `calculateEstimateTotal([floors, walls, …])`.
4. Extend `/internal/estimate` UI with a second section block — do not fold wall prices into `FLOOR_PRICE_MAPPING`.

## Out of scope (MVP)

- materials
- finish coverings (laminate/quartz/parquet install)
- walls / ceilings / electro / plumbing sections
- auth / admin / persistence / PDF export
- Strapi / CMS / production deploy
