import { localServiceRepository } from './local-service.repository'
import { strapiServiceRepository } from './strapi-service.repository'

export const serviceRepository =
  import.meta.env.VITE_CONTENT_SOURCE === 'strapi'
    ? strapiServiceRepository
    : localServiceRepository
