import type { PriceRepository } from '@/entities/price/api/price.repository'
import { adaptStrapiPriceCategory } from '@/entities/price/api/strapi-price.adapter'
import {
  strapiPriceCategoriesResponseSchema,
  strapiPriceCategoryDtoSchema,
} from '@/shared/content/strapi/price-category.dto'
import { strapiFetch } from '@/shared/content/strapi/client'

import { snapshotPriceRepository } from './snapshot-price.repository'

const POPULATE =
  'populate[positions]=true' +
  '&populate[factors]=true' +
  '&populate[faq]=true' +
  '&populate[seo]=true'

function getStrapiOptions() {
  const baseUrl = process.env.STRAPI_URL?.trim()
  if (!baseUrl) {
    throw new Error('STRAPI_URL is required when PRICES_CONTENT_SOURCE=strapi')
  }
  return {
    baseUrl,
    token: process.env.STRAPI_TOKEN?.trim() || undefined,
    timeoutMs: Number(process.env.STRAPI_TIMEOUT_MS || 8000),
  }
}

async function fetchAllFromStrapi() {
  const options = getStrapiOptions()
  const json = await strapiFetch<unknown>(
    `/api/price-categories?${POPULATE}&pagination[pageSize]=100&sort[0]=sortOrder:asc`,
    options,
  )
  const parsed = strapiPriceCategoriesResponseSchema.parse(json)
  return parsed.data.map((dto) => adaptStrapiPriceCategory(strapiPriceCategoryDtoSchema.parse(dto)))
}

export const strapiPriceRepository: PriceRepository = {
  async getAll() {
    try {
      return await fetchAllFromStrapi()
    } catch (error) {
      console.warn('[prices] Strapi unavailable, using snapshot fallback:', error)
      return snapshotPriceRepository.getAll()
    }
  },

  async getBySlug(slug: string) {
    try {
      const options = getStrapiOptions()
      const json = await strapiFetch<{ data: unknown[] }>(
        `/api/price-categories?filters[slug][$eq]=${encodeURIComponent(slug)}&${POPULATE}`,
        options,
      )
      const first = json.data?.[0]
      if (!first) {
        return null
      }
      return adaptStrapiPriceCategory(strapiPriceCategoryDtoSchema.parse(first))
    } catch (error) {
      console.warn(`[prices] Strapi unavailable for ${slug}, using snapshot:`, error)
      return snapshotPriceRepository.getBySlug(slug)
    }
  },
}
