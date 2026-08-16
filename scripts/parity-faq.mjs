/**
 * Compares local FAQ groups with snapshot (and optionally Strapi).
 *   pnpm parity:faq
 *   STRAPI_URL=http://127.0.0.1:1337 pnpm parity:faq:strapi
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const withStrapi = process.argv.includes('--strapi')
const require = createRequire(import.meta.url)

function extractHomeFaq() {
  const srcPath = resolve(root, 'src/features/faq/model/faq.data.ts')
  const code = readFileSync(srcPath, 'utf8')
  let body = code.replace(/\s+as const/g, '')
  body = body.replace('export const faqItems', 'const faqItems')
  body += '\nmodule.exports = faqItems\n'
  mkdirSync(resolve(root, '.tmp'), { recursive: true })
  const tmp = resolve(root, '.tmp/parity-home-faq.cjs')
  writeFileSync(tmp, body)
  return require(tmp)
}

function extractHubFaq() {
  const srcPath = resolve(root, 'src/entities/faq/model/prices-hub-faq.data.ts')
  const code = readFileSync(srcPath, 'utf8')
  let body = code.replace(/import[\s\S]*?from\s+['"][^'"]+['"]\s*/g, '')
  body = body.replace(/: readonly FaqItem\[\]/, '')
  body = body.replace(/\s+as const/g, '')
  body = body.replace('export const pricesHubFaqItems', 'const pricesHubFaqItems')
  body += '\nmodule.exports = pricesHubFaqItems\n'
  const tmp = resolve(root, '.tmp/parity-hub-faq.cjs')
  writeFileSync(tmp, body)
  return require(tmp)
}

function normalizeGroups(home, hub) {
  return [
    {
      key: 'home',
      items: home.map((item) => ({ question: item.question, answer: item.answer })),
    },
    {
      key: 'prices-hub',
      items: hub.map((item) => ({ question: item.question, answer: item.answer })),
    },
  ]
}

function diff(a, b, path = '') {
  const issues = []
  if (a === b) return issues
  if (typeof a !== typeof b) {
    issues.push(`${path}: type ${typeof a} vs ${typeof b}`)
    return issues
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) issues.push(`${path}: length ${a.length} vs ${b.length}`)
    const len = Math.max(a.length, b.length)
    for (let i = 0; i < len; i += 1) issues.push(...diff(a[i], b[i], `${path}[${i}]`))
    return issues
  }
  if (a && b && typeof a === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const key of keys) issues.push(...diff(a[key], b[key], path ? `${path}.${key}` : key))
    return issues
  }
  issues.push(`${path}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`)
  return issues
}

async function fetchStrapi() {
  const baseUrl = (process.env.STRAPI_URL || 'http://127.0.0.1:1337').replace(/\/$/, '')
  const res = await fetch(
    `${baseUrl}/api/faq-groups?populate[items]=true&pagination[pageSize]=20&sort[0]=sortOrder:asc`,
  )
  if (!res.ok) throw new Error(`Strapi HTTP ${res.status}`)
  const json = await res.json()
  return (json.data || []).map((dto) => ({
    key: dto.key,
    items: [...(dto.items || [])]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((item) => ({ question: item.question, answer: item.answer })),
  }))
}

const local = normalizeGroups(extractHomeFaq(), extractHubFaq())
const snapshotPath = resolve(root, 'src/shared/content/faq/faq.snapshot.json')
const snapshot = existsSync(snapshotPath) ? JSON.parse(readFileSync(snapshotPath, 'utf8')) : []

const results = {
  localGroups: local.length,
  localItems: local.reduce((s, g) => s + g.items.length, 0),
  snapshotGroups: snapshot.length,
  snapshotParity: [],
  strapiParity: null,
}

for (const group of local) {
  const other = snapshot.find((item) => item.key === group.key)
  if (!other) {
    results.snapshotParity.push({ key: group.key, issues: ['missing in snapshot'] })
    continue
  }
  const issues = diff(group, other)
  if (issues.length) results.snapshotParity.push({ key: group.key, issues })
}

if (withStrapi) {
  const strapiGroups = await fetchStrapi()
  results.strapiGroups = strapiGroups.length
  results.strapiItems = strapiGroups.reduce((s, g) => s + g.items.length, 0)
  results.strapiParity = []
  for (const group of local) {
    const other = strapiGroups.find((item) => item.key === group.key)
    if (!other) {
      results.strapiParity.push({ key: group.key, issues: ['missing in strapi'] })
      continue
    }
    const issues = diff(group, other)
    if (issues.length) results.strapiParity.push({ key: group.key, issues })
  }
}

const snapshotOk =
  results.snapshotParity.length === 0 &&
  results.localGroups === 2 &&
  results.localItems === 11 &&
  results.snapshotGroups === 2
const strapiOk =
  !withStrapi ||
  (results.strapiParity?.length === 0 && results.strapiGroups === 2 && results.strapiItems === 11)

console.log(JSON.stringify(results, null, 2))
if (!snapshotOk || !strapiOk) process.exit(1)
console.log('parity: OK')
