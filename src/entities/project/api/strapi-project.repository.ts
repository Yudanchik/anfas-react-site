import type { ProjectRepository } from '@/entities/project/api/project.repository'
import { adaptStrapiProject } from '@/entities/project/api/strapi-project.adapter'
import {
  strapiProjectDtoSchema,
  strapiProjectsResponseSchema,
} from '@/shared/content/strapi/project.dto'
import { strapiFetch } from '@/shared/content/strapi/client'

import { snapshotProjectRepository } from './snapshot-project.repository'

const POPULATE =
  'populate[image]=true&populate[gallery][populate][0]=image&populate[review]=true&populate[seo]=true'

function getStrapiOptions() {
  const baseUrl = process.env.STRAPI_URL?.trim()
  if (!baseUrl) {
    throw new Error('STRAPI_URL is required when PROJECTS_CONTENT_SOURCE=strapi')
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
    `/api/projects?${POPULATE}&pagination[pageSize]=100`,
    options,
  )
  const parsed = strapiProjectsResponseSchema.parse(json)
  return parsed.data.map((dto) => adaptStrapiProject(strapiProjectDtoSchema.parse(dto)))
}

export const strapiProjectRepository: ProjectRepository = {
  async getAll() {
    try {
      return await fetchAllFromStrapi()
    } catch (error) {
      console.warn('[projects] Strapi unavailable, using snapshot fallback:', error)
      return snapshotProjectRepository.getAll()
    }
  },

  async getBySlug(slug: string) {
    try {
      const options = getStrapiOptions()
      const json = await strapiFetch<{ data: unknown[] }>(
        `/api/projects?filters[slug][$eq]=${encodeURIComponent(slug)}&${POPULATE}`,
        options,
      )
      const first = json.data?.[0]
      if (!first) {
        return null
      }
      return adaptStrapiProject(strapiProjectDtoSchema.parse(first))
    } catch (error) {
      console.warn(`[projects] Strapi unavailable for ${slug}, using snapshot:`, error)
      return snapshotProjectRepository.getBySlug(slug)
    }
  },
}
