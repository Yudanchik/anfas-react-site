import { faqItems } from '@/features/faq/model/faq.data'

import type { FaqGroup } from './faq.types'
import { pricesHubFaqItems } from './prices-hub-faq.data'

/** Local curated FAQ groups (home + prices-hub). Price category FAQ stays in Prices domain. */
export const faqGroups: readonly FaqGroup[] = [
  {
    key: 'home',
    items: faqItems.map((item) => ({ question: item.question, answer: item.answer })),
  },
  {
    key: 'prices-hub',
    items: pricesHubFaqItems.map((item) => ({ question: item.question, answer: item.answer })),
  },
]
