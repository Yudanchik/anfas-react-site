# Strapi content sources (Projects + Articles)

Production / default Host-0 builds stay on **local** hardcode until an explicit cutover.

## Env (no secrets in Git)

See `.env.example`.

| Variable | Scope | Default |
| --- | --- | --- |
| `CONTENT_SOURCE` | Articles only | `local` |
| `PROJECTS_CONTENT_SOURCE` | Projects only | `local` |
| `STRAPI_URL` | When either source is `strapi` | — |
| `STRAPI_TOKEN` | Optional | — |
| `STRAPI_TIMEOUT_MS` | Optional | `8000` |

Values: `local` | `strapi` | `snapshot`.

`strapi` mode falls back to the committed snapshot if CMS is unreachable (build/prerender must not break).

## Local workflows

```bash
# Projects parity
pnpm parity:projects
STRAPI_URL=http://127.0.0.1:1337 pnpm parity:projects:strapi

# Refresh projects snapshot from CMS seed (../anfas-cms)
pnpm snapshot:projects

# Dev / build examples
PROJECTS_CONTENT_SOURCE=local pnpm dev
PROJECTS_CONTENT_SOURCE=strapi STRAPI_URL=http://127.0.0.1:1337 pnpm build
PROJECTS_CONTENT_SOURCE=snapshot pnpm build
```

CMS import / seed docs: `anfas-cms/README.md`.

## Do not

- Commit `.env`, uploads, or set production to `strapi` without cutover approval
- Delete `projects.data.ts` / `articles.data.ts` until cutover
- Mix Projects into `CONTENT_SOURCE`
