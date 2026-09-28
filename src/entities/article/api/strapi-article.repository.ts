import type { ArticleRepository } from '@/entities/article/api/article.repository'
import { adaptStrapiArticle } from '@/entities/article/api/strapi-article.adapter'
import {
  strapiArticleDtoSchema,
  strapiArticlesResponseSchema,
} from '@/shared/content/strapi/article.dto'
import { strapiFetch } from '@/shared/content/strapi/client'

const POPULATE =
  'populate[category]=true&populate[seo]=true&populate[sections]=true&populate[cta]=true&populate[cover]=true&populate[relatedArticles][fields][0]=slug'

function getStrapiOptions() {
  const baseUrl = import.meta.env.VITE_STRAPI_URL?.trim()
  if (!baseUrl) {
    throw new Error('VITE_STRAPI_URL is required when VITE_CONTENT_SOURCE=strapi')
  }
  return {
    baseUrl,
    timeoutMs: 8000,
  }
}

async function fetchAllFromStrapi() {
  const options = getStrapiOptions()
  const json = await strapiFetch<unknown>(
    `/api/articles?${POPULATE}&pagination[pageSize]=100`,
    options,
  )
  const parsed = strapiArticlesResponseSchema.parse(json)
  return parsed.data.map((dto) => adaptStrapiArticle(strapiArticleDtoSchema.parse(dto)))
}

export const strapiArticleRepository: ArticleRepository = {
  async getAll() {
    try {
      return await fetchAllFromStrapi()
    } catch (error) {
      console.warn('[articles] Strapi unavailable, request failed:', error)
      throw error
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
      console.warn(`[articles] Strapi unavailable for ${slug}, request failed:`, error)
      throw error
    }
  },
}
