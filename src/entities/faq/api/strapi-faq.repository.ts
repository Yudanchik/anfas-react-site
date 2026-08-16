import type { FaqRepository } from '@/entities/faq/api/faq.repository'
import { adaptStrapiFaqGroup } from '@/entities/faq/api/strapi-faq.adapter'
import type { FaqGroupKey } from '@/entities/faq/model/faq.types'
import {
  strapiFaqGroupDtoSchema,
  strapiFaqGroupsResponseSchema,
} from '@/shared/content/strapi/faq-group.dto'
import { strapiFetch } from '@/shared/content/strapi/client'

import { snapshotFaqRepository } from './snapshot-faq.repository'

const POPULATE = 'populate[items]=true'

function getStrapiOptions() {
  const baseUrl = process.env.STRAPI_URL?.trim()
  if (!baseUrl) {
    throw new Error('STRAPI_URL is required when FAQ_CONTENT_SOURCE=strapi')
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
    `/api/faq-groups?${POPULATE}&pagination[pageSize]=20&sort[0]=sortOrder:asc`,
    options,
  )
  const parsed = strapiFaqGroupsResponseSchema.parse(json)
  return parsed.data.map((dto) => adaptStrapiFaqGroup(strapiFaqGroupDtoSchema.parse(dto)))
}

export const strapiFaqRepository: FaqRepository = {
  async getAll() {
    try {
      return await fetchAllFromStrapi()
    } catch (error) {
      console.warn('[faq] Strapi unavailable, using snapshot fallback:', error)
      return snapshotFaqRepository.getAll()
    }
  },

  async getByKey(key: FaqGroupKey) {
    try {
      const options = getStrapiOptions()
      const json = await strapiFetch<{ data: unknown[] }>(
        `/api/faq-groups?filters[key][$eq]=${encodeURIComponent(key)}&${POPULATE}`,
        options,
      )
      const first = json.data?.[0]
      if (!first) return null
      return adaptStrapiFaqGroup(strapiFaqGroupDtoSchema.parse(first))
    } catch (error) {
      console.warn(`[faq] Strapi unavailable for ${key}, using snapshot:`, error)
      return snapshotFaqRepository.getByKey(key)
    }
  },
}
