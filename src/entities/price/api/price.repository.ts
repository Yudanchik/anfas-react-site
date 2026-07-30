import type { PriceCategory } from '../model/price.types'

export interface PriceRepository {
  getAll(): Promise<readonly PriceCategory[]>
  getBySlug(slug: string): Promise<PriceCategory | null>
}
