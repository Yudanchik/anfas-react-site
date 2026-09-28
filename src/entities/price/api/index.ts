import { localPriceRepository } from './local-price.repository'
import { strapiPriceRepository } from './strapi-price.repository'

export const priceRepository =
  import.meta.env.VITE_CONTENT_SOURCE === 'strapi' ? strapiPriceRepository : localPriceRepository
