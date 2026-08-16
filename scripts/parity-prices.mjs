/**
 * Compares local prices with snapshot (and optionally live Strapi).
 *
 *   pnpm parity:prices
 *   STRAPI_URL=http://127.0.0.1:1337 pnpm parity:prices:strapi
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const withStrapi = process.argv.includes('--strapi')
const require = createRequire(import.meta.url)
const EXPECTED_COUNT = 15
const EXPECTED_POSITIONS = 259

function extractLocalPrices() {
  const srcPath = resolve(root, 'src/entities/price/model/prices.data.ts')
  const code = readFileSync(srcPath, 'utf8')
  const start = code.indexOf('export const prices')
  if (start < 0) {
    throw new Error('export const prices not found')
  }
  let body = code.slice(start)
  body = body.replace(/\s+as const/g, '')
  body = body.replace('export const prices', 'const prices')
  body = body.replace(/const prices:\s*[^=]+=/, 'const prices =')
  body += '\nmodule.exports = prices\n'
  const tmpDir = resolve(root, '.tmp')
  mkdirSync(tmpDir, { recursive: true })
  const tmp = resolve(tmpDir, 'parity-prices.cjs')
  writeFileSync(tmp, body)
  return require(tmp)
}

function normalize(category) {
  const related = {}
  const srcRelated = category.related || {}
  if (srcRelated.serviceSlug || category.serviceSlug) {
    related.serviceSlug = srcRelated.serviceSlug || category.serviceSlug
  }
  const articleSlugs = srcRelated.articleSlugs || category.relatedArticleSlugs
  if (Array.isArray(articleSlugs) && articleSlugs.length > 0) {
    related.articleSlugs = [...articleSlugs]
  }
  const categorySlugs = srcRelated.categorySlugs || category.relatedCategorySlugs
  if (Array.isArray(categorySlugs) && categorySlugs.length > 0) {
    related.categorySlugs = [...categorySlugs]
  }

  const positions = [...(category.positions || [])]
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
    })

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
    positions,
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
}

function diff(a, b, path = '') {
  const issues = []
  if (a === b) return issues
  if (a === undefined && b === undefined) return issues
  if (typeof a !== typeof b) {
    issues.push(`${path}: type ${typeof a} vs ${typeof b}`)
    return issues
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      issues.push(`${path}: length ${a.length} vs ${b.length}`)
    }
    const len = Math.max(a.length, b.length)
    for (let i = 0; i < len; i += 1) {
      issues.push(...diff(a[i], b[i], `${path}[${i}]`))
    }
    return issues
  }
  if (a && b && typeof a === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const key of keys) {
      issues.push(...diff(a[key], b[key], path ? `${path}.${key}` : key))
    }
    return issues
  }
  issues.push(`${path}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`)
  return issues
}

async function fetchStrapiPrices() {
  const baseUrl = (process.env.STRAPI_URL || 'http://127.0.0.1:1337').replace(/\/$/, '')
  const populate =
    'populate[positions]=true' +
    '&populate[factors]=true' +
    '&populate[faq]=true' +
    '&populate[seo]=true'
  const response = await fetch(
    `${baseUrl}/api/price-categories?${populate}&pagination[pageSize]=100&sort[0]=sortOrder:asc`,
  )
  if (!response.ok) {
    throw new Error(`Strapi HTTP ${response.status}`)
  }
  const json = await response.json()
  return (json.data || []).map((dto) => normalize(dto))
}

const local = extractLocalPrices().map(normalize)
const snapshotPath = resolve(root, 'src/shared/content/prices/prices.snapshot.json')
const snapshot = existsSync(snapshotPath)
  ? JSON.parse(readFileSync(snapshotPath, 'utf8')).map(normalize)
  : []

const results = {
  localCount: local.length,
  localPositions: local.reduce((sum, item) => sum + item.positions.length, 0),
  snapshotCount: snapshot.length,
  snapshotParity: [],
  strapiParity: null,
}

for (const category of local) {
  const other = snapshot.find((item) => item.slug === category.slug)
  if (!other) {
    results.snapshotParity.push({ slug: category.slug, issues: ['missing in snapshot'] })
    continue
  }
  const issues = diff(category, other)
  if (issues.length) {
    results.snapshotParity.push({ slug: category.slug, issues })
  }
}

if (withStrapi) {
  const strapiPrices = await fetchStrapiPrices()
  results.strapiCount = strapiPrices.length
  results.strapiPositions = strapiPrices.reduce((sum, item) => sum + item.positions.length, 0)
  results.strapiParity = []
  for (const category of local) {
    const other = strapiPrices.find((item) => item.slug === category.slug)
    if (!other) {
      results.strapiParity.push({ slug: category.slug, issues: ['missing in strapi'] })
      continue
    }
    const issues = diff(category, other)
    if (issues.length) {
      results.strapiParity.push({ slug: category.slug, issues })
    }
  }
}

const snapshotOk =
  results.snapshotParity.length === 0 &&
  results.localCount === EXPECTED_COUNT &&
  results.localPositions === EXPECTED_POSITIONS &&
  results.snapshotCount === EXPECTED_COUNT
const strapiOk =
  !withStrapi ||
  (results.strapiParity?.length === 0 &&
    results.strapiCount === EXPECTED_COUNT &&
    results.strapiPositions === EXPECTED_POSITIONS)

console.log(JSON.stringify(results, null, 2))
if (!snapshotOk || !strapiOk) {
  process.exit(1)
}
console.log('parity: OK')
