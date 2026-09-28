import type { FaqGroup } from '@/entities/faq/model/faq.types'
import type { StrapiFaqGroupDto } from '@/shared/content/strapi/faq-group.dto'

export function adaptStrapiFaqGroup(dto: StrapiFaqGroupDto): FaqGroup {
  const items = [...dto.items]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((item) => ({
      question: item.question,
      answer: item.answer,
    }))

  return {
    key: dto.key,
    items,
  }
}
