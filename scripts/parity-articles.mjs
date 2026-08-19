/**
 * Compares local articles with snapshot (and optionally live Strapi).
 * Usage:
 *   node scripts/parity-articles.mjs
 *   STRAPI_URL=http://127.0.0.1:1337 node scripts/parity-articles.mjs --strapi
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const withStrapi = process.argv.includes('--strapi')
const require = createRequire(import.meta.url)

function extractLocalArticles() {
  const srcPath = resolve(root, 'src/entities/article/model/articles.data.ts')
  let code = readFileSync(srcPath, 'utf8')
  code = code.replace(/import\s+type[\s\S]*?\n/, '')
  code = code.replace(/: Article\[\]/, '')
  code = code.replace(/\nexport function getArticleBySlug[\s\S]*/, '\n')
  code = code.replace('export const articles', 'const articles')
  code += '\nmodule.exports = articles\n'
  const tmpDir = resolve(root, '.tmp')
  mkdirSync(tmpDir, { recursive: true })
  const tmp = resolve(tmpDir, 'parity-articles.cjs')
  writeFileSync(tmp, code)
  return require(tmp)
}

function stripComponentMeta(value) {
  if (Array.isArray(value)) {
    return value.map(stripComponentMeta)
  }
  if (value && typeof value === 'object') {
    const next = {}
    for (const [key, entry] of Object.entries(value)) {
      if (key === 'id' || key === 'documentId') continue
      next[key] = stripComponentMeta(entry)
    }
    return next
  }
  return value
}

function normalize(article) {
  return stripComponentMeta({
    slug: article.slug,
    url: `/blog/${article.slug}`,
    title: article.title,
    category: article.category,
    categorySlug: article.categorySlug,
    lead: article.lead,
    cover: article.cover,
    coverAlt: article.coverAlt,
    publishedAt: article.publishedAt,
    readTime: article.readTime,
    seo: article.seo,
    sections: article.sections,
    checklist: article.checklist,
    mistakes: article.mistakes,
    cta: article.cta,
    relatedSlugs: article.relatedSlugs,
    relatedService: article.relatedService,
  })
}

function diff(a, b, path = '') {
  const issues = []
  if (a === b) return issues
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

async function fetchStrapiArticles() {
  const baseUrl = (process.env.STRAPI_URL || 'http://127.0.0.1:1337').replace(/\/$/, '')
  const populate =
    'populate[category]=true&populate[seo]=true&populate[sections]=true&populate[cta]=true&populate[relatedArticles][fields][0]=slug'
  const response = await fetch(`${baseUrl}/api/articles?${populate}&pagination[pageSize]=100`)
  if (!response.ok) {
    throw new Error(`Strapi HTTP ${response.status}`)
  }
  const json = await response.json()
  return (json.data || []).map((dto) =>
    normalize({
      slug: dto.slug,
      title: dto.title,
      category: dto.category?.name,
      categorySlug: dto.category?.slug,
      lead: dto.lead,
      cover: dto.coverPath,
      coverAlt: dto.coverAlt,
      publishedAt: dto.publishedAtDate,
      readTime: dto.readTime,
      seo: dto.seo,
      sections: (dto.sections || []).map((section) => ({
        id: section.sectionId,
        heading: section.heading,
        paragraphs: section.paragraphs,
        ...(section.list ? { list: section.list } : {}),
      })),
      checklist: dto.checklist,
      mistakes: dto.mistakes,
      cta: dto.cta,
      relatedSlugs: (dto.relatedArticles || []).map((item) => item.slug),
      relatedService: dto.relatedService,
    }),
  )
}

const local = extractLocalArticles().map(normalize)
const snapshotPath = resolve(root, 'src/shared/content/articles/articles.snapshot.json')
const snapshot = existsSync(snapshotPath)
  ? JSON.parse(readFileSync(snapshotPath, 'utf8')).map(normalize)
  : []

const results = {
  localCount: local.length,
  snapshotCount: snapshot.length,
  snapshotParity: [],
  strapiParity: null,
}

for (const article of local) {
  const other = snapshot.find((item) => item.slug === article.slug)
  if (!other) {
    results.snapshotParity.push({ slug: article.slug, issues: ['missing in snapshot'] })
    continue
  }
  const issues = diff(article, other)
  if (issues.length) {
    results.snapshotParity.push({ slug: article.slug, issues })
  }
}

if (withStrapi) {
  const strapiArticles = await fetchStrapiArticles()
  results.strapiCount = strapiArticles.length
  results.strapiParity = []
  for (const article of local) {
    const other = strapiArticles.find((item) => item.slug === article.slug)
    if (!other) {
      results.strapiParity.push({ slug: article.slug, issues: ['missing in strapi'] })
      continue
    }
    const issues = diff(article, other)
    if (issues.length) {
      results.strapiParity.push({ slug: article.slug, issues })
    }
  }
}

const snapshotOk =
  results.snapshotParity.length === 0 && results.localCount === results.snapshotCount
const strapiOk =
  !withStrapi ||
  (results.strapiParity?.length === 0 && results.strapiCount === results.localCount)

console.log(JSON.stringify(results, null, 2))
if (!snapshotOk || !strapiOk) {
  process.exit(1)
}
console.log('parity: OK')
