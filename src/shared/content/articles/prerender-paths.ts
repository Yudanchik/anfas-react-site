import articlesSnapshot from './articles.snapshot.json'
import projectsSnapshot from '../projects/projects.snapshot.json'
import { getContentSource, getProjectsContentSource } from '../content-source'
import { strapiFetch } from '../strapi/client'

/** Static routes excluding dynamic blog/project slug pages. */
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
  '/services',
  '/services/individual',
  '/services/package',
] as const

function blogPathsFromSlugs(slugs: readonly string[]) {
  return slugs.map((slug) => `/blog/${slug}`)
}

function projectPathsFromSlugs(slugs: readonly string[]) {
  return slugs.map((slug) => `/projects/${slug}`)
}

function snapshotBlogPaths() {
  const slugs = (articlesSnapshot as Array<{ slug: string }>).map((item) => item.slug)
  return blogPathsFromSlugs(slugs)
}

function snapshotProjectPaths() {
  const slugs = (projectsSnapshot as Array<{ slug: string }>).map((item) => item.slug)
  return projectPathsFromSlugs(slugs)
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

/** Blog + project paths for prerender. Never returns empty dynamic lists when snapshots exist. */
export async function resolvePrerenderPaths(): Promise<string[]> {
  const articleSource = getContentSource()
  const projectsSource = getProjectsContentSource()

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

  return [...STATIC_PATHS, ...projectPaths, ...blogPaths]
}
