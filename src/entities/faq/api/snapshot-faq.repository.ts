import type { FaqGroup } from '@/entities/faq/model/faq.types'
import type { FaqGroupKey } from '@/entities/faq/model/faq.types'
import faqSnapshot from '@/shared/content/faq/faq.snapshot.json'

import type { FaqRepository } from './faq.repository'

const snapshotGroups = faqSnapshot as FaqGroup[]

export const snapshotFaqRepository: FaqRepository = {
  async getAll(): Promise<readonly FaqGroup[]> {
    return snapshotGroups
  },

  async getByKey(key: FaqGroupKey): Promise<FaqGroup | null> {
    return snapshotGroups.find((group) => group.key === key) ?? null
  },
}
