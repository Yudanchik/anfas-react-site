import { getPricesContentSource } from '@/shared/content/content-source'

import type { PriceRepository } from './price.repository'
import { localPriceRepository } from './local-price.repository'
import { snapshotPriceRepository } from './snapshot-price.repository'
import { strapiPriceRepository } from './strapi-price.repository'

function createPriceRepository(): PriceRepository {
  const source = getPricesContentSource()
  if (source === 'strapi') {
    return strapiPriceRepository
  }
  if (source === 'snapshot') {
    return snapshotPriceRepository
  }
  return localPriceRepository
}

export const priceRepository = createPriceRepository()

export type { PriceRepository }
