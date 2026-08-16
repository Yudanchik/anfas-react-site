import articlesSnapshot from './articles.snapshot.json'
import projectsSnapshot from '../projects/projects.snapshot.json'
import servicesSnapshot from '../services/services.snapshot.json'
import pricesSnapshot from '../prices/prices.snapshot.json'
import {
  getContentSource,
  getPricesContentSource,
  getProjectsContentSource,
  getServicesContentSource,
} from '../content-source'
import { strapiFetch } from '../strapi/client'

/** Static routes excluding dynamic blog/project/service/price slug pages. */
const STATIC_PATHS = [
  '/',
  '/about',
  '/blog',
  '/contacts',
  '/cookies',
  '/prices',
  '/prices/thanks',
  '/privacy',
  '/projects',
  '/services',
] as const

const FALLBACK_SERVICE_PATHS = ['/services/individual', '/services/package'] as const

const FALLBACK_PRICE_PATHS = [
  '/prices/vyvoz-musora',
  '/prices/gipsokarton',
  '/prices/demontazh',
  '/prices/kladka',
  '/prices/shtukaturka',
  '/prices/malyarnye',
  '/prices/plitka',
  '/prices/napolnye-pokrytiya',
  '/prices/elektroremontazh',
  '/prices/santehmontazh',
  '/prices/kondicionirovanie',
  '/prices/zvukoizolyaciya',
  '/prices/potolki',
  '/prices/dveri',
  '/prices/obshhestroitelnye',
] as const

function blogPathsFromSlugs(slugs: readonly string[]) {
  return slugs.map((slug) => `/blog/${slug}`)
}

function projectPathsFromSlugs(slugs: readonly string[]) {
  return slugs.map((slug) => `/projects/${slug}`)
}

function servicePathsFromSlugs(slugs: readonly string[]) {
  return slugs.map((slug) => `/services/${slug}`)
}

function pricePathsFromSlugs(slugs: readonly string[]) {
  return slugs.map((slug) => `/prices/${slug}`)
}

function snapshotBlogPaths() {
  const slugs = (articlesSnapshot as Array<{ slug: string }>).map((item) => item.slug)
  return blogPathsFromSlugs(slugs)
}

function snapshotProjectPaths() {
  const slugs = (projectsSnapshot as Array<{ slug: string }>).map((item) => item.slug)
  return projectPathsFromSlugs(slugs)
}

function snapshotServicePaths() {
  const slugs = (servicesSnapshot as Array<{ slug: string }>).map((item) => item.slug)
  if (slugs.length === 0) {
    return [...FALLBACK_SERVICE_PATHS]
  }
  return servicePathsFromSlugs(slugs)
}

function snapshotPricePaths() {
  const slugs = (pricesSnapshot as Array<{ slug: string }>).map((item) => item.slug)
  if (slugs.length === 0) {
    return [...FALLBACK_PRICE_PATHS]
  }
  return pricePathsFromSlugs(slugs)
}

async function strapiBlogPaths(): Promise<string[]> {
  const baseUrl = process.env.STRAPI_URL?.trim()
  if (!baseUrl) {
    console.warn('[prerender] STRAPI_URL missing — using snapshot blog paths')
    return snapshotBlogPaths()
  }

  try {
    const json = await strapiFetch<{ data: Array<{ slug: string }> }>(
      '/api/articles?fields[0]=slug&pagination[pageSize]=100',
      {
        baseUrl,
        token: process.env.STRAPI_TOKEN?.trim() || undefined,
        timeoutMs: Number(process.env.STRAPI_TIMEOUT_MS || 8000),
      },
    )
    const slugs = (json.data ?? []).map((item) => item.slug).filter(Boolean)
    if (slugs.length === 0) {
      console.warn('[prerender] Strapi returned 0 articles — using snapshot')
      return snapshotBlogPaths()
    }
    return blogPathsFromSlugs(slugs)
  } catch (error) {
    console.warn('[prerender] Strapi unavailable — using snapshot blog paths:', error)
    return snapshotBlogPaths()
  }
}

async function strapiProjectPaths(): Promise<string[]> {
  const baseUrl = process.env.STRAPI_URL?.trim()
  if (!baseUrl) {
    console.warn('[prerender] STRAPI_URL missing — using snapshot project paths')
    return snapshotProjectPaths()
  }

  try {
    const json = await strapiFetch<{ data: Array<{ slug: string }> }>(
      '/api/projects?fields[0]=slug&pagination[pageSize]=100',
      {
        baseUrl,
        token: process.env.STRAPI_TOKEN?.trim() || undefined,
        timeoutMs: Number(process.env.STRAPI_TIMEOUT_MS || 8000),
      },
    )
    const slugs = (json.data ?? []).map((item) => item.slug).filter(Boolean)
    if (slugs.length === 0) {
      console.warn('[prerender] Strapi returned 0 projects — using snapshot')
      return snapshotProjectPaths()
    }
    return projectPathsFromSlugs(slugs)
  } catch (error) {
    console.warn('[prerender] Strapi unavailable — using snapshot project paths:', error)
    return snapshotProjectPaths()
  }
}

async function strapiServicePaths(): Promise<string[]> {
  const baseUrl = process.env.STRAPI_URL?.trim()
  if (!baseUrl) {
    console.warn('[prerender] STRAPI_URL missing — using snapshot service paths')
    return snapshotServicePaths()
  }

  try {
    const json = await strapiFetch<{ data: Array<{ slug: string }> }>(
      '/api/services?fields[0]=slug&pagination[pageSize]=100&sort[0]=sortOrder:asc',
      {
        baseUrl,
        token: process.env.STRAPI_TOKEN?.trim() || undefined,
        timeoutMs: Number(process.env.STRAPI_TIMEOUT_MS || 8000),
      },
    )
    const slugs = (json.data ?? []).map((item) => item.slug).filter(Boolean)
    if (slugs.length === 0) {
      console.warn('[prerender] Strapi returned 0 services — using snapshot')
      return snapshotServicePaths()
    }
    return servicePathsFromSlugs(slugs)
  } catch (error) {
    console.warn('[prerender] Strapi unavailable — using snapshot service paths:', error)
    return snapshotServicePaths()
  }
}

async function strapiPricePaths(): Promise<string[]> {
  const baseUrl = process.env.STRAPI_URL?.trim()
  if (!baseUrl) {
    console.warn('[prerender] STRAPI_URL missing — using snapshot price paths')
    return snapshotPricePaths()
  }

  try {
    const json = await strapiFetch<{ data: Array<{ slug: string }> }>(
      '/api/price-categories?fields[0]=slug&pagination[pageSize]=100&sort[0]=sortOrder:asc',
      {
        baseUrl,
        token: process.env.STRAPI_TOKEN?.trim() || undefined,
        timeoutMs: Number(process.env.STRAPI_TIMEOUT_MS || 8000),
      },
    )
    const slugs = (json.data ?? []).map((item) => item.slug).filter(Boolean)
    if (slugs.length === 0) {
      console.warn('[prerender] Strapi returned 0 price categories — using snapshot')
      return snapshotPricePaths()
    }
    return pricePathsFromSlugs(slugs)
  } catch (error) {
    console.warn('[prerender] Strapi unavailable — using snapshot price paths:', error)
    return snapshotPricePaths()
  }
}

/** Blog + project + service + price paths for prerender. Never returns empty dynamic lists when snapshots exist. */
export async function resolvePrerenderPaths(): Promise<string[]> {
  const articleSource = getContentSource()
  const projectsSource = getProjectsContentSource()
  const servicesSource = getServicesContentSource()
  const pricesSource = getPricesContentSource()

  let blogPaths: string[]
  if (articleSource === 'strapi') {
    blogPaths = await strapiBlogPaths()
  } else {
    blogPaths = snapshotBlogPaths()
  }
  if (blogPaths.length === 0) {
    blogPaths = snapshotBlogPaths()
  }

  let projectPaths: string[]
  if (projectsSource === 'strapi') {
    projectPaths = await strapiProjectPaths()
  } else {
    // local + snapshot: committed snapshot (parity with projects.data.ts)
    projectPaths = snapshotProjectPaths()
  }
  if (projectPaths.length === 0) {
    projectPaths = snapshotProjectPaths()
  }

  let servicePaths: string[]
  if (servicesSource === 'strapi') {
    servicePaths = await strapiServicePaths()
  } else {
    servicePaths = snapshotServicePaths()
  }
  if (servicePaths.length === 0) {
    servicePaths = [...FALLBACK_SERVICE_PATHS]
  }

  let pricePaths: string[]
  if (pricesSource === 'strapi') {
    pricePaths = await strapiPricePaths()
  } else {
    pricePaths = snapshotPricePaths()
  }
  if (pricePaths.length === 0) {
    pricePaths = [...FALLBACK_PRICE_PATHS]
  }

  return [...STATIC_PATHS, ...pricePaths, ...projectPaths, ...servicePaths, ...blogPaths]
}
