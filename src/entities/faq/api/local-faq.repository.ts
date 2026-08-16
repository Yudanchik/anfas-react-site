import { faqGroups } from '@/entities/faq/model/faq-groups.data'
import type { FaqGroupKey } from '@/entities/faq/model/faq.types'

import type { FaqRepository } from './faq.repository'

export const localFaqRepository: FaqRepository = {
  async getAll() {
    return faqGroups
  },

  async getByKey(key: FaqGroupKey) {
    return faqGroups.find((group) => group.key === key) ?? null
  },
}
