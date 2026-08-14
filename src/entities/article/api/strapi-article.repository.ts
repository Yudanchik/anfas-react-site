import type { ArticleRepository } from '@/entities/article/api/article.repository'
import { adaptStrapiArticle } from '@/entities/article/api/strapi-article.adapter'
import {
  strapiArticleDtoSchema,
  strapiArticlesResponseSchema,
} from '@/shared/content/strapi/article.dto'
import { strapiFetch } from '@/shared/content/strapi/client'

import { snapshotArticleRepository } from './snapshot-article.repository'

const POPULATE =
  'populate[category]=true&populate[seo]=true&populate[sections]=true&populate[cta]=true&populate[cover]=true&populate[relatedArticles][fields][0]=slug'

function getStrapiOptions() {
  const baseUrl = process.env.STRAPI_URL?.trim()
  if (!baseUrl) {
    throw new Error('STRAPI_URL is required when CONTENT_SOURCE=strapi')
  }
  return {
    baseUrl,
    token: process.env.STRAPI_TOKEN?.trim() || undefined,
    timeoutMs: Number(process.env.STRAPI_TIMEOUT_MS || 8000),
  }
}

async function fetchAllFromStrapi() {
  const options = getStrapiOptions()
  const json = await strapiFetch<unknown>(`/api/articles?${POPULATE}&pagination[pageSize]=100`, options)
  const parsed = strapiArticlesResponseSchema.parse(json)
  return parsed.data.map((dto) => adaptStrapiArticle(strapiArticleDtoSchema.parse(dto)))
}

export const strapiArticleRepository: ArticleRepository = {
  async getAll() {
    try {
      return await fetchAllFromStrapi()
    } catch (error) {
      console.warn('[articles] Strapi unavailable, using snapshot fallback:', error)
      return snapshotArticleRepository.getAll()
    }
  },

  async getBySlug(slug: string) {
    try {
      const options = getStrapiOptions()
      const json = await strapiFetch<{ data: unknown[] }>(
        `/api/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&${POPULATE}`,
        options,
      )
      const first = json.data?.[0]
      if (!first) {
        return null
      }
      return adaptStrapiArticle(strapiArticleDtoSchema.parse(first))
    } catch (error) {
      console.warn(`[articles] Strapi unavailable for ${slug}, using snapshot:`, error)
      return snapshotArticleRepository.getBySlug(slug)
    }
  },
}
