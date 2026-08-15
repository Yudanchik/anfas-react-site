/**
 * Compares local projects with snapshot (and optionally live Strapi).
 *
 *   pnpm parity:projects
 *   STRAPI_URL=http://127.0.0.1:1337 pnpm parity:projects:strapi
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const withStrapi = process.argv.includes('--strapi')
const require = createRequire(import.meta.url)

function extractLocalProjects() {
  const srcPath = resolve(root, 'src/entities/project/model/projects.data.ts')
  let code = readFileSync(srcPath, 'utf8')
  code = code.replace(/import\s+type[\s\S]*?\n/, '')
  code = code.replace(/\/\/ Temporary mock reviews[\s\S]*?\n/, '')
  code = code.replace(/: readonly Project\[\]/, '')
  code = code.replace(/\s+as const/g, '')
  code = code.replace('export const projects', 'const projects')
  code += '\nmodule.exports = projects\n'
  const tmpDir = resolve(root, '.tmp')
  mkdirSync(tmpDir, { recursive: true })
  const tmp = resolve(tmpDir, 'parity-projects.cjs')
  writeFileSync(tmp, code)
  return require(tmp)
}

function stripSlash(path) {
  return String(path).replace(/^\/+/, '')
}

function normalizeReview(review) {
  if (!review) return undefined
  const next = {
    quote: review.quote,
    author: review.author,
    rating: review.rating,
  }
  if (typeof review.details === 'string' && review.details.length) next.details = review.details
  if (typeof review.projectInfo === 'string' && review.projectInfo.length) {
    next.projectInfo = review.projectInfo
  }
  if (typeof review.location === 'string' && review.location.length) next.location = review.location
  if (typeof review.service === 'string' && review.service.length) next.service = review.service
  return next
}

function normalize(project) {
  return {
    slug: project.slug,
    url: `/projects/${project.slug}`,
    title: project.title,
    type: project.type,
    typeAccent: project.typeAccent,
    location: project.location,
    description: project.description,
    image: stripSlash(project.image || project.imagePath || ''),
    area: project.area,
    term: project.term,
    price: project.price,
    size: project.size,
    gallery: (project.gallery || []).map((item) =>
      typeof item === 'string' ? stripSlash(item) : stripSlash(item.imagePath),
    ),
    details: [...(project.details || [])],
    review: normalizeReview(project.review),
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

async function fetchStrapiProjects() {
  const baseUrl = (process.env.STRAPI_URL || 'http://127.0.0.1:1337').replace(/\/$/, '')
  const populate =
    'populate[image]=true&populate[gallery][populate][0]=image&populate[review]=true&populate[seo]=true'
  const response = await fetch(`${baseUrl}/api/projects?${populate}&pagination[pageSize]=100`)
  if (!response.ok) {
    throw new Error(`Strapi HTTP ${response.status}`)
  }
  const json = await response.json()
  return (json.data || []).map((dto) => {
    const gallery = [...(dto.gallery || [])]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((item) => stripSlash(item.imagePath))
    return normalize({
      slug: dto.slug,
      title: dto.title,
      type: dto.type,
      typeAccent: dto.typeAccent,
      location: dto.location,
      description: dto.description,
      image: stripSlash(dto.imagePath),
      area: dto.area,
      term: dto.term,
      price: dto.price,
      size: dto.size,
      gallery,
      details: dto.details,
      review: dto.review,
    })
  })
}

const local = extractLocalProjects().map(normalize)
const snapshotPath = resolve(root, 'src/shared/content/projects/projects.snapshot.json')
const snapshot = existsSync(snapshotPath)
  ? JSON.parse(readFileSync(snapshotPath, 'utf8')).map(normalize)
  : []

const results = {
  localCount: local.length,
  snapshotCount: snapshot.length,
  snapshotParity: [],
  strapiParity: null,
}

for (const project of local) {
  const other = snapshot.find((item) => item.slug === project.slug)
  if (!other) {
    results.snapshotParity.push({ slug: project.slug, issues: ['missing in snapshot'] })
    continue
  }
  const issues = diff(project, other)
  if (issues.length) {
    results.snapshotParity.push({ slug: project.slug, issues })
  }
}

if (withStrapi) {
  const strapiProjects = await fetchStrapiProjects()
  results.strapiCount = strapiProjects.length
  results.strapiParity = []
  for (const project of local) {
    const other = strapiProjects.find((item) => item.slug === project.slug)
    if (!other) {
      results.strapiParity.push({ slug: project.slug, issues: ['missing in strapi'] })
      continue
    }
    const issues = diff(project, other)
    if (issues.length) {
      results.strapiParity.push({ slug: project.slug, issues })
    }
  }
}

const snapshotOk = results.snapshotParity.length === 0 && results.localCount === 7
const strapiOk = !withStrapi || (results.strapiParity?.length === 0 && results.strapiCount === 7)

console.log(JSON.stringify(results, null, 2))
if (!snapshotOk || !strapiOk) {
  process.exit(1)
}
console.log('parity: OK')
