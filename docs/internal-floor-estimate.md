# Internal floor estimate calculator — usage notes

> **Актуальная документация** (на русском): папка [`docs/estimate-calculator/`](./estimate-calculator/README.md)
> ([README](./estimate-calculator/README.md), [architecture](./estimate-calculator/architecture.md), [zones](./estimate-calculator/zones.md), [floors](./estimate-calculator/scenarios-floors.md), [walls](./estimate-calculator/scenarios-walls.md)).
>
> Этот файл — исторические заметки раннего floors MVP. Ниже оставлены ключевые ссылки; детали сценариев и зон смотрите в `docs/estimate-calculator/`.

## Route

`/internal/estimate`

- `robots: noindex, nofollow`
- Header link «Смета» is **branch convenience only** (`SiteHeader` → `INTERNAL_NAV`)
- **Before merge to `dev`:** separately decide whether to keep, hide (e.g. DEV-only), or remove the header link

## What it does now

Internal labour-only estimate on the same route for:

- **Floors** — rough works, presets, zones
- **Walls** — scenarios, zones
- Object zones, summary tree, local persistence v2
- Materials are never included

## Price source

- Floors: `src/entities/estimate/model/floors/floor-price.mapping.ts`
- Walls: `src/entities/estimate/model/walls/wall-price.mapping.ts`
- Frontend `prices.data.ts` — conflict checks for `source=both` only
- Public price / Strapi data is not modified by the calculator

## Formulas

```
lineTotal = Math.round(quantity * unitPrice * coefficient)
total = sum(lineTotal for enabled lines)
```

## Checks

```bash
pnpm test:floor-estimate
pnpm test:wall-estimate
pnpm test:estimate
pnpm check
pnpm build
```

## Extending

See [architecture.md](./estimate-calculator/architecture.md). Candidates: ceilings / plumbing / electrics. PDF/export — future separate package.

## Out of scope (still)

- materials in totals
- auth / admin
- PDF export (not implemented)
- Strapi / CMS / production deploy «заодно»
