# Strapi content sources (Articles + Projects + Services)

Production / default Host-0 builds stay on **local** hardcode until an explicit cutover.

## Env (no secrets in Git)

See `.env.example`.

| Variable | Scope | Default |
| --- | --- | --- |
| `CONTENT_SOURCE` | Articles only | `local` |
| `PROJECTS_CONTENT_SOURCE` | Projects only | `local` |
| `SERVICES_CONTENT_SOURCE` | Services only | `local` |
| `STRAPI_URL` | When any source is `strapi` | — |
| `STRAPI_TOKEN` | Optional | — |
| `STRAPI_TIMEOUT_MS` | Optional | `8000` |

Values: `local` | `strapi` | `snapshot`.

`strapi` mode falls back to the committed snapshot if CMS is unreachable (build/prerender must not break).

## Services workflows

```bash
# Enable sources (never set production to strapi without cutover approval)
SERVICES_CONTENT_SOURCE=local pnpm dev
SERVICES_CONTENT_SOURCE=strapi STRAPI_URL=http://127.0.0.1:1337 pnpm build
SERVICES_CONTENT_SOURCE=snapshot pnpm build

# Parity
pnpm parity:services
STRAPI_URL=http://127.0.0.1:1337 pnpm parity:services:strapi

# Refresh FE snapshot from CMS seed (../anfas-cms/scripts/seed/services.json)
pnpm snapshot:services
```

CMS side (from `anfas-cms`):

```bash
pnpm services:import:dry   # no DB
pnpm services:import       # live upsert 2 services + cover dedupe
pnpm services:parity       # REST smoke vs seed
```

Stable slugs: `individual`, `package`. Frontend uses portable public paths (`images/services/...`), not localhost Strapi media URLs.

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
- Delete `projects.data.ts` / `articles.data.ts` / `services.data.ts` until cutover
- Mix Projects/Services into `CONTENT_SOURCE`
- Merge to `dev`/`main` or deploy as part of content-source wiring
