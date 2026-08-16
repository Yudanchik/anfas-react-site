# Strapi content migration — master plan

**Status:** Living map (read-only planning)  
**Updated:** `2026-08-16`  
**Frontend branch:** `feature/strapi-journal-pilot`  
**Rule:** one content domain at a time; default content source always **`local`** until explicit cutover.

Production Host-0, DNS, VPS, merge to `dev`/`main`, and deleting `*.data.ts` are **out of scope** for domain pilots.

---

## Completed locally (waiting cutover)

| Domain | CMS CT | FE env | Counts | CMS branch tip (approx) | Notes |
| --- | --- | --- | --- | --- | --- |
| Articles | `Article` (+ category) | `CONTENT_SOURCE` | 8 | journal pilot | Snapshot + dual-run |
| Projects | `Project` | `PROJECTS_CONTENT_SOURCE` | 7 | `feature/projects-migration` | Media + review |
| Services | `Service` | `SERVICES_CONTENT_SOURCE` | 2 | `feature/services-migration` | Marketing `price` strings ≠ Prices |
| **Prices** | `PriceCategory` | `PRICES_CONTENT_SOURCE` | 15 / 259 positions | `feature/prices-migration` | Preview only; not calculator/PDF |

---

## Next domains (order after Prices)

Do **not** start the next domain until Prices is accepted and an explicit go-ahead is given.

### 1. FAQ

- Likely local FAQ blocks on home / services / prices hub
- Decide: global FAQ collection vs page-scoped components
- Do **not** invent FAQs; migrate existing only
- Keep Prices category FAQ nested (already migrated)

### 2. Partners

- Partner logos / ticker content currently local
- Media path strategy like Projects/Services
- Avoid over-modeling animation/UI constants

### 3. SiteSettings / contacts / socials

- Company contacts, phones, addresses, social links
- Prefer singleton SiteSettings over many CTs
- Forms validation / PHP endpoints stay out of CMS

### 4. Route SEO / meta

- Hub / list pages still often hardcoded (`/prices`, `/services`, …)
- Optional SEO singleton or route-level entries
- Only after domain content pilots are stable

### 5. Home / About content blocks

- Large narrative / story blocks, YouTube/Instagram, process copy
- Highest UI coupling — last among content domains
- Preserve design system; no redesign as part of CMS move

---

## Explicit non-goals (all domains)

- Calculator formulas / rates
- PDF lead-magnet / HMAC / PHP submit
- Analytics wiring as CMS content
- Production cutover without separate approval
- Force push / rebase workflows

---

## How to start the next domain

1. Confirm previous domain status = Completed locally / Waiting for production cutover  
2. Create task md under `.cursor/task/` (audit + staged plan)  
3. CMS branch from latest domain branch (or agreed base)  
4. Stage 0 → 5 with green gates only
