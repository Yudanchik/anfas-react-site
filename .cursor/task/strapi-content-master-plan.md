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
| Prices | `PriceCategory` | `PRICES_CONTENT_SOURCE` | 15 / 259 positions | `feature/prices-migration` | Preview only; not calculator/PDF |
| **FAQ** | `FaqGroup` | `FAQ_CONTENT_SOURCE` | 2 groups / 11 items | `feature/faq-migration` | home + prices-hub; category FAQ stays in Prices |

---

## Next domains (order after FAQ)

### 1. Partners ← **next (not started)**

- Partner logos / ticker content currently local
- Media path strategy like Projects/Services
- Avoid over-modeling animation/UI constants

### 2. SiteSettings / contacts / socials

- Company contacts, phones, addresses, social links
- Prefer singleton SiteSettings over many CTs
- Forms validation / PHP endpoints stay out of CMS

### 3. Route SEO / meta

- Hub / list pages still often hardcoded (`/prices`, `/services`, …)
- Optional SEO singleton or route-level entries
- Only after domain content pilots are stable

### 4. Home / About content blocks

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
