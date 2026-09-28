import { localFaqRepository } from './local-faq.repository'
import { strapiFaqRepository } from './strapi-faq.repository'

export const faqRepository =
  import.meta.env.VITE_CONTENT_SOURCE === 'strapi' ? strapiFaqRepository : localFaqRepository
