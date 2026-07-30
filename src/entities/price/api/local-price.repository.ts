import { prices } from '@/entities/price/model'

import type { PriceRepository } from './price.repository'

export const localPriceRepository: PriceRepository = {
  async getAll() {
    return prices
  },

  async getBySlug(slug) {
    return prices.find((category) => category.slug === slug) ?? null
  },
}
