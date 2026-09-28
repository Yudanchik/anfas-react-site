import type { FaqGroup, FaqGroupKey } from '../model/faq.types'

export interface FaqRepository {
  getAll(): Promise<readonly FaqGroup[]>
  getByKey(key: FaqGroupKey): Promise<FaqGroup | null>
}
