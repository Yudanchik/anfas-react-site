/**
 * Compares local services with snapshot (and optionally live Strapi).
 *
 *   pnpm parity:services
 *   STRAPI_URL=http://127.0.0.1:1337 pnpm parity:services:strapi
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const withStrapi = process.argv.includes('--strapi')
const require = createRequire(import.meta.url)

function extractLocalServices() {
  const srcPath = resolve(root, 'src/entities/service/model/services.data.ts')
  const code = readFileSync(srcPath, 'utf8')
  const start = code.indexOf('export const services')
  if (start < 0) {
    throw new Error('export const services not found')
  }
  let body = code.slice(start)
  body = body.replace(/\s+as const/g, '')
  body = body.replace('export const services', 'const services')
  body = body.replace(/const services:\s*[^=]+=/, 'const services =')
  body = body.replace(/export function getServiceHref[\s\S]*$/, '')
  body += '\nmodule.exports = services\n'
  const tmpDir = resolve(root, '.tmp')
  mkdirSync(tmpDir, { recursive: true })
  const tmp = resolve(tmpDir, 'parity-services.cjs')
  writeFileSync(tmp, body)
  return require(tmp)
}

function stripSlash(path) {
  return String(path).replace(/^\/+/, '')
}

function toMetric(stat) {
  return { value: stat.value, label: stat.label }
}

function normalize(service) {
  const base = {
    id: service.id || service.serviceId,
    slug: service.slug,
    url: `/services/${service.slug}`,
    number: service.number,
    title: service.title,
    shortText: service.shortText,
    text: service.text,
    tags: [...(service.tags || [])],
    image: stripSlash(service.image || service.imagePath || ''),
    imageWidth: service.imageWidth,
    imageHeight: service.imageHeight,
    lead: service.lead,
    hero: {
      eyebrow: service.hero.eyebrow,
      titleLine: service.hero.titleLine,
      titleAccent: service.hero.titleAccent,
      lead: service.hero.lead,
      stats: (service.hero.stats || []).map((stat) => ({
        label: stat.label,
        value: stat.value,
      })),
      aside: {
        eyebrow: service.hero.aside.eyebrow,
        title: service.hero.aside.title,
        text: service.hero.aside.text,
      },
    },
    bullets: [...(service.bullets || [])],
    metrics: (service.metrics || []).map(toMetric),
    price: service.price,
    duration: service.duration,
    ctaLabel: service.ctaLabel,
    included: {
      label: service.included.label,
      titleMain: service.included.titleMain,
      titleAccent: service.included.titleAccent,
      lead: service.included.lead,
      groups: (service.included.groups || []).map((group) => ({
        number: group.number,
        title: group.title,
        text: group.text,
        items: [...group.items],
      })),
      fit: {
        label: service.included.fit.label,
        title: service.included.fit.title,
        text: service.included.fit.text,
        points: [...service.included.fit.points],
      },
      note: service.included.note,
    },
    seo: {
      title: service.seo.title,
      description: service.seo.description,
      keywords: service.seo.keywords,
    },
  }

  if (base.id === 'individual') {
    const story = service.story || service.storyIndividual
    return {
      ...base,
      story: {
        eyebrow: story.eyebrow,
        title: story.title,
        lead: story.lead,
        hero: {
          overline: story.hero.overline,
          title: story.hero.title,
          text: story.hero.text,
          metrics: (story.hero.metrics || []).map(toMetric),
        },
        highlights: (story.highlights || []).map((item) => ({
          label: item.label,
          title: item.title,
          text: item.text,
        })),
        steps: (story.steps || []).map((item) => ({
          label: item.label,
          title: item.title,
          text: item.text,
        })),
      },
    }
  }

  const story = service.story || service.storyPackage
  return {
    ...base,
    story: {
      eyebrow: story.eyebrow,
      title: story.title,
      lead: story.lead,
      summary: {
        overline: story.summary.overline,
        title: story.summary.title,
        text: story.summary.text,
        bullets: [...story.summary.bullets],
      },
      steps: (story.steps || []).map((item) => ({
        number: item.number,
        title: item.title,
        text: item.text,
        meta: item.meta,
      })),
    },
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

async function fetchStrapiServices() {
  const baseUrl = (process.env.STRAPI_URL || 'http://127.0.0.1:1337').replace(/\/$/, '')
  const populate =
    'populate[cover]=true' +
    '&populate[metrics]=true' +
    '&populate[hero][populate][stats]=true' +
    '&populate[hero][populate][aside]=true' +
    '&populate[included][populate][groups]=true' +
    '&populate[included][populate][fit]=true' +
    '&populate[storyIndividual][populate][hero][populate]=*' +
    '&populate[storyIndividual][populate][highlights]=true' +
    '&populate[storyIndividual][populate][steps]=true' +
    '&populate[storyPackage][populate][summary]=true' +
    '&populate[storyPackage][populate][steps]=true' +
    '&populate[seo]=true'
  const response = await fetch(
    `${baseUrl}/api/services?${populate}&pagination[pageSize]=100&sort[0]=sortOrder:asc`,
  )
  if (!response.ok) {
    throw new Error(`Strapi HTTP ${response.status}`)
  }
  const json = await response.json()
  return (json.data || []).map((dto) =>
    normalize({
      id: dto.serviceId,
      serviceId: dto.serviceId,
      slug: dto.slug,
      number: dto.number,
      title: dto.title,
      shortText: dto.shortText,
      text: dto.text,
      tags: dto.tags,
      imagePath: dto.imagePath,
      imageWidth: dto.imageWidth,
      imageHeight: dto.imageHeight,
      lead: dto.lead,
      hero: dto.hero,
      bullets: dto.bullets,
      metrics: dto.metrics,
      price: dto.price,
      duration: dto.duration,
      ctaLabel: dto.ctaLabel,
      included: dto.included,
      storyIndividual: dto.storyIndividual,
      storyPackage: dto.storyPackage,
      seo: dto.seo,
    }),
  )
}

const local = extractLocalServices().map(normalize)
const snapshotPath = resolve(root, 'src/shared/content/services/services.snapshot.json')
const snapshot = existsSync(snapshotPath)
  ? JSON.parse(readFileSync(snapshotPath, 'utf8')).map(normalize)
  : []

const results = {
  localCount: local.length,
  snapshotCount: snapshot.length,
  snapshotParity: [],
  strapiParity: null,
}

for (const service of local) {
  const other = snapshot.find((item) => item.slug === service.slug)
  if (!other) {
    results.snapshotParity.push({ slug: service.slug, issues: ['missing in snapshot'] })
    continue
  }
  const issues = diff(service, other)
  if (issues.length) {
    results.snapshotParity.push({ slug: service.slug, issues })
  }
}

if (withStrapi) {
  const strapiServices = await fetchStrapiServices()
  results.strapiCount = strapiServices.length
  results.strapiParity = []
  for (const service of local) {
    const other = strapiServices.find((item) => item.slug === service.slug)
    if (!other) {
      results.strapiParity.push({ slug: service.slug, issues: ['missing in strapi'] })
      continue
    }
    const issues = diff(service, other)
    if (issues.length) {
      results.strapiParity.push({ slug: service.slug, issues })
    }
  }
}

const snapshotOk = results.snapshotParity.length === 0 && results.localCount === 2
const strapiOk = !withStrapi || (results.strapiParity?.length === 0 && results.strapiCount === 2)

console.log(JSON.stringify(results, null, 2))
if (!snapshotOk || !strapiOk) {
  process.exit(1)
}
console.log('parity: OK')
