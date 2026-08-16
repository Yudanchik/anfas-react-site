# Strapi content sources (Articles + Projects + Services + Prices)

Production / default Host-0 builds stay on **local** hardcode until an explicit cutover.

## Env (no secrets in Git)

See `.env.example`.

| Variable | Scope | Default |
| --- | --- | --- |
| `CONTENT_SOURCE` | Articles only | `local` |
| `PROJECTS_CONTENT_SOURCE` | Projects only | `local` |
| `SERVICES_CONTENT_SOURCE` | Services only | `local` |
| `PRICES_CONTENT_SOURCE` | Price categories only | `local` |
| `STRAPI_URL` | When any source is `strapi` | — |
| `STRAPI_TOKEN` | Optional | — |
| `STRAPI_TIMEOUT_MS` | Optional | `8000` |

Values: `local` | `strapi` | `snapshot`.

`strapi` mode falls back to the committed snapshot if CMS is unreachable (build/prerender must not break).

## Prices workflows

```bash
# Enable sources (never set production to strapi without cutover approval)
PRICES_CONTENT_SOURCE=local pnpm dev
PRICES_CONTENT_SOURCE=strapi STRAPI_URL=http://127.0.0.1:1337 pnpm build
PRICES_CONTENT_SOURCE=snapshot pnpm build

# Parity
pnpm parity:prices
STRAPI_URL=http://127.0.0.1:1337 pnpm parity:prices:strapi

# Refresh FE snapshot from CMS seed (../anfas-cms/scripts/seed/price-categories.json)
pnpm snapshot:prices
```

CMS side (from `anfas-cms`):

```bash
pnpm prices:import:dry   # no DB
pnpm prices:import       # live upsert 15 categories
pnpm prices:parity       # REST smoke vs seed
```

Counts: **15** categories / **259** positions. Soft `serviceSlug` `individual|package`. Calculator rates, PDF/PHP lead-magnet, and Services/Home marketing strings stay outside this source.

## Services workflows

```bash
SERVICES_CONTENT_SOURCE=local pnpm dev
SERVICES_CONTENT_SOURCE=strapi STRAPI_URL=http://127.0.0.1:1337 pnpm build
SERVICES_CONTENT_SOURCE=snapshot pnpm build

pnpm parity:services
STRAPI_URL=http://127.0.0.1:1337 pnpm parity:services:strapi
pnpm snapshot:services
```

CMS: `pnpm services:import:dry` / `services:import` / `services:parity`. Stable slugs: `individual`, `package`.

## Projects / Articles (unchanged)

```bash
pnpm parity:articles
pnpm parity:projects
STRAPI_URL=http://127.0.0.1:1337 pnpm parity:projects:strapi
pnpm snapshot:projects
```

CMS import / seed docs: `anfas-cms/README.md`.

## Do not

- Commit `.env`, uploads, or set production to `strapi` without cutover approval
- Delete `projects.data.ts` / `articles.data.ts` / `services.data.ts` / `prices.data.ts` until cutover
- Mix domains into a single env (`CONTENT_SOURCE` is articles-only)
- Merge to `dev`/`main` or deploy as part of content-source wiring
