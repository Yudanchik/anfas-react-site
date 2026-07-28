import { services } from '../model/services.data'
import type { ServiceRepository } from './service.repository'

export const localServiceRepository: ServiceRepository = {
  async getAll() {
    return services
  },

  async getBySlug(slug) {
    return services.find((service) => service.slug === slug) ?? null
  },
}
