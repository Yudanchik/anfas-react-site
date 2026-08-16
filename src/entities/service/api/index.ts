import { getServicesContentSource } from '@/shared/content/content-source'

import type { ServiceRepository } from './service.repository'
import { localServiceRepository } from './local-service.repository'
import { snapshotServiceRepository } from './snapshot-service.repository'
import { strapiServiceRepository } from './strapi-service.repository'

function createServiceRepository(): ServiceRepository {
  const source = getServicesContentSource()
  if (source === 'strapi') {
    return strapiServiceRepository
  }
  if (source === 'snapshot') {
    return snapshotServiceRepository
  }
  return localServiceRepository
}

export const serviceRepository = createServiceRepository()

export type { ServiceRepository }
