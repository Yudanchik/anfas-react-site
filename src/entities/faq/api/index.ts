import { getFaqContentSource } from '@/shared/content/content-source'

import type { FaqRepository } from './faq.repository'
import { localFaqRepository } from './local-faq.repository'
import { snapshotFaqRepository } from './snapshot-faq.repository'
import { strapiFaqRepository } from './strapi-faq.repository'

function createFaqRepository(): FaqRepository {
  const source = getFaqContentSource()
  if (source === 'strapi') return strapiFaqRepository
  if (source === 'snapshot') return snapshotFaqRepository
  return localFaqRepository
}

export const faqRepository = createFaqRepository()

export type { FaqRepository }
