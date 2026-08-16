import type { ServiceRepository } from '@/entities/service/api/service.repository'
import { adaptStrapiService } from '@/entities/service/api/strapi-service.adapter'
import {
  strapiServiceDtoSchema,
  strapiServicesResponseSchema,
} from '@/shared/content/strapi/service.dto'
import { strapiFetch } from '@/shared/content/strapi/client'

import { snapshotServiceRepository } from './snapshot-service.repository'

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
  const baseUrl = process.env.STRAPI_URL?.trim()
  if (!baseUrl) {
    throw new Error('STRAPI_URL is required when SERVICES_CONTENT_SOURCE=strapi')
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
      console.warn('[services] Strapi unavailable, using snapshot fallback:', error)
      return snapshotServiceRepository.getAll()
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
      console.warn(`[services] Strapi unavailable for ${slug}, using snapshot:`, error)
      return snapshotServiceRepository.getBySlug(slug)
    }
  },
}
