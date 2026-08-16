import type { Service } from '@/entities/service/model/services.data'
import servicesSnapshot from '@/shared/content/services/services.snapshot.json'

import type { ServiceRepository } from './service.repository'

const snapshotServices = servicesSnapshot as Service[]

export const snapshotServiceRepository: ServiceRepository = {
  async getAll(): Promise<readonly Service[]> {
    return snapshotServices
  },

  async getBySlug(slug: string): Promise<Service | null> {
    return snapshotServices.find((service) => service.slug === slug) ?? null
  },
}
