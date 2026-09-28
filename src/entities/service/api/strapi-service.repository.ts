import type { ServiceRepository } from '@/entities/service/api/service.repository'
import { adaptStrapiService } from '@/entities/service/api/strapi-service.adapter'
import {
  strapiServiceDtoSchema,
  strapiServicesResponseSchema,
} from '@/shared/content/strapi/service.dto'
import { strapiFetch } from '@/shared/content/strapi/client'

const POPULATE =
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
    `/api/services?${POPULATE}&pagination[pageSize]=100&sort[0]=sortOrder:asc`,
    options,
  )
  const parsed = strapiServicesResponseSchema.parse(json)
  return parsed.data
    .map((dto) => adaptStrapiService(strapiServiceDtoSchema.parse(dto)))
    .sort((a, b) => {
      const order = { individual: 0, package: 1 } as const
      return order[a.id] - order[b.id]
    })
}

export const strapiServiceRepository: ServiceRepository = {
  async getAll() {
    try {
      return await fetchAllFromStrapi()
    } catch (error) {
      console.warn('[services] Strapi unavailable, request failed:', error)
      throw error
    }
  },

  async getBySlug(slug: string) {
    try {
      const options = getStrapiOptions()
      const json = await strapiFetch<{ data: unknown[] }>(
        `/api/services?filters[slug][$eq]=${encodeURIComponent(slug)}&${POPULATE}`,
        options,
      )
      const first = json.data?.[0]
      if (!first) {
        return null
      }
      return adaptStrapiService(strapiServiceDtoSchema.parse(first))
    } catch (error) {
      console.warn(`[services] Strapi unavailable for ${slug}, request failed:`, error)
      throw error
    }
  },
}
