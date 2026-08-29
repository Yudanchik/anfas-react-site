# Estimate calculator architecture

## Domain layout

```
src/entities/estimate/model/
  shared/     # types, line/section/estimate totals, line helpers, selected-lines
  floors/     # FLOOR_PRICE_MAPPING, builders, presets, groups, conflicts, tests
  walls/      # WALL_PRICE_MAPPING, builders, scenarios, groups, conflicts, tests
  index.ts    # public barrel — import only from @/entities/estimate
```

Future sections (ceilings / plumbing / electrics): add `model/<section>/` parallel to floors/walls. Do not fold prices into another section mapping.

Future PDF/Excel export: keep under `model/export/` (or `features/estimate-export/`) — separate from floors/walls UI and mapping. Not implemented yet.

## UI layout

```
src/features/estimate-calculator/   # shell: tabs, shared table/summary, workspace
  floors/                           # FloorEstimatePanel (composes floor-estimate pieces)
  walls/                            # wall inputs / scenarios / helpers / panel / editor
src/features/floor-estimate/        # floor-specific inputs/presets/helpers/editor (kept)
src/routes/internal/estimate/       # route mounts EstimateCalculatorWorkspace
```

## How to add the next section

1. Domain: `model/<section>/` mapping + builders + groups + conflicts + scenarios + tests.
2. Export from `model/index.ts`.
3. UI: `estimate-calculator/<section>/` panel + editor; add tab in `EstimateTabs`.
4. Compose totals via `calculateEstimateTotal` + `getSelectedEstimateSections`.

## Combined summary

`getSelectedEstimateSections(sections)` builds display groups:

- order = registration order of sections (floors → walls → …)
- empty sections omitted
- `subtotalRub` = sum of `calculateLineTotal` for selected rows
- grand total via `calculateEstimateTotal` / `calculateSelectedSectionsGrandTotal`

`ESTIMATE_SECTION_LABELS` holds known titles (`floors`, `walls`, `ceilings`, …) for future tabs.

## Persistence (Stage 3)

Workspace state (tab, inputs, line patches, manual rows, scenario/preset drafts) is saved to
`localStorage` key `anfas:estimate-calculator:v1`. Open accordion groups are **not** persisted —
they stay collapsed after reload. «Сбросить смету» clears storage and resets both sections.

## Do not

- Put formulas in JSX (use domain `calculateLineTotal` / section totals).
- Hardcode prices in UI (mapping only).
- Mix materials into labour lines.
- Put wall keys into `FLOOR_PRICE_MAPPING` (or vice versa).
- Rewrite an existing section when adding a new one.
