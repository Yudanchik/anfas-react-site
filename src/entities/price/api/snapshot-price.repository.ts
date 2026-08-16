import type { PriceCategory } from '@/entities/price/model/price.types'
import pricesSnapshot from '@/shared/content/prices/prices.snapshot.json'

import type { PriceRepository } from './price.repository'

const snapshotPrices = pricesSnapshot as PriceCategory[]

export const snapshotPriceRepository: PriceRepository = {
  async getAll(): Promise<readonly PriceCategory[]> {
    return snapshotPrices
  },

  async getBySlug(slug: string): Promise<PriceCategory | null> {
    return snapshotPrices.find((category) => category.slug === slug) ?? null
  },
}
