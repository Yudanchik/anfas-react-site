import articlesSnapshot from './articles.snapshot.json'
import { getContentSource } from '../content-source'
import { strapiFetch } from '../strapi/client'

const STATIC_PATHS = [
  '/',
  '/about',
  '/blog',
  '/contacts',
  '/cookies',
  '/prices',
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
  '/prices/thanks',
  '/privacy',
  '/projects',
  '/projects/2-murinskiy-37',
  '/projects/zhk-grafika',
  '/projects/verkhnekamenskaya',
  '/projects/prospekt-slavy-4',
  '/projects/forest-akvilon',
  '/projects/id-kudrovo',
  '/projects/grand-house',
  '/services',
  '/services/individual',
  '/services/package',
] as const

function pathsFromSlugs(slugs: readonly string[]) {
  return slugs.map((slug) => `/blog/${slug}`)
}

function snapshotBlogPaths() {
  const slugs = (articlesSnapshot as Array<{ slug: string }>).map((item) => item.slug)
  return pathsFromSlugs(slugs)
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
    return pathsFromSlugs(slugs)
  } catch (error) {
    console.warn('[prerender] Strapi unavailable — using snapshot blog paths:', error)
    return snapshotBlogPaths()
  }
}

/** Blog article paths for prerender. Never returns an empty blog list when snapshot exists. */
export async function resolvePrerenderPaths(): Promise<string[]> {
  const source = getContentSource()
  let blogPaths: string[]

  if (source === 'strapi') {
    blogPaths = await strapiBlogPaths()
  } else {
    // local + snapshot: use committed snapshot (parity with articles.data.ts in pilot)
    blogPaths = snapshotBlogPaths()
  }

  if (blogPaths.length === 0) {
    blogPaths = snapshotBlogPaths()
  }

  return [...STATIC_PATHS, ...blogPaths]
}
