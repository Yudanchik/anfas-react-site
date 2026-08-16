/**
 * Writes prices.snapshot.json from CMS seed (frontend PriceCategory shape).
 *
 *   pnpm snapshot:prices
 *   ANFAS_CMS_ROOT=../anfas-cms pnpm snapshot:prices
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const outDir = resolve(root, 'src/shared/content/prices')
const outPath = resolve(outDir, 'prices.snapshot.json')
const EXPECTED_COUNT = 15
const EXPECTED_POSITIONS = 259

function resolveCmsSeed() {
  if (process.env.ANFAS_CMS_ROOT?.trim()) {
    return resolve(process.env.ANFAS_CMS_ROOT.trim(), 'scripts/seed/price-categories.json')
  }
  return resolve(root, '../anfas-cms/scripts/seed/price-categories.json')
}

function fromCmsSeed(seedPath) {
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
  return [...seed]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((category) => {
      const related = {}
      if (category.serviceSlug) {
        related.serviceSlug = category.serviceSlug
      }
      if (Array.isArray(category.relatedArticleSlugs) && category.relatedArticleSlugs.length > 0) {
        related.articleSlugs = [...category.relatedArticleSlugs]
      }
      if (Array.isArray(category.relatedCategorySlugs) && category.relatedCategorySlugs.length > 0) {
        related.categorySlugs = [...category.relatedCategorySlugs]
      }

      return {
        slug: category.slug,
        title: category.title,
        titleAccent: category.titleAccent,
        eyebrow: category.eyebrow,
        lead: category.lead,
        seo: {
          title: category.seo.title,
          description: category.seo.description,
          keywords: category.seo.keywords,
        },
        priceFrom: category.priceFrom,
        priceUnit: category.priceUnit,
        positions: [...(category.positions || [])]
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((position) => {
            const row = {
              name: position.name,
              unit: position.unit,
              priceFrom: position.priceFrom,
            }
            if (position.note) {
              row.note = position.note
            }
            return row
          }),
        disclaimer: category.disclaimer,
        factors: [...(category.factors || [])]
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((factor) => ({
            title: factor.title,
            text: factor.text,
          })),
        faq: [...(category.faq || [])]
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((item) => ({
            question: item.question,
            answer: item.answer,
          })),
        related,
      }
    })
}

const seedPath = resolveCmsSeed()
if (!existsSync(seedPath)) {
  console.error(
    JSON.stringify({
      error: `CMS seed missing: ${seedPath}`,
      hint: 'Set ANFAS_CMS_ROOT or keep ../anfas-cms next to this repo',
    }),
  )
  process.exit(1)
}

const snapshot = fromCmsSeed(seedPath)
const positionsTotal = snapshot.reduce((sum, item) => sum + item.positions.length, 0)

if (snapshot.length !== EXPECTED_COUNT) {
  console.error(JSON.stringify({ error: `expected ${EXPECTED_COUNT} categories, got ${snapshot.length}` }))
  process.exit(1)
}
if (positionsTotal !== EXPECTED_POSITIONS) {
  console.error(JSON.stringify({ error: `expected ${EXPECTED_POSITIONS} positions, got ${positionsTotal}` }))
  process.exit(1)
}

mkdirSync(outDir, { recursive: true })
writeFileSync(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
console.log(
  JSON.stringify(
    {
      outPath: 'src/shared/content/prices/prices.snapshot.json',
      count: snapshot.length,
      positionsTotal,
      slugs: snapshot.map((item) => item.slug),
      source: seedPath.includes('anfas-cms') ? 'cms-seed' : seedPath,
    },
    null,
    2,
  ),
)
