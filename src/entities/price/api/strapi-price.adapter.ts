import type { PriceCategory, PriceCategorySlug } from '@/entities/price/model/price.types'
import type { StrapiPriceCategoryDto } from '@/shared/content/strapi/price-category.dto'

function sortByOrder<T extends { sortOrder?: number | null }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export function adaptStrapiPriceCategory(dto: StrapiPriceCategoryDto): PriceCategory {
  const related: PriceCategory['related'] = {}
  if (dto.serviceSlug) {
    related.serviceSlug = dto.serviceSlug
  }
  if (dto.relatedArticleSlugs && dto.relatedArticleSlugs.length > 0) {
    related.articleSlugs = [...dto.relatedArticleSlugs]
  }
  if (dto.relatedCategorySlugs && dto.relatedCategorySlugs.length > 0) {
    related.categorySlugs = dto.relatedCategorySlugs as PriceCategorySlug[]
  }

  return {
    slug: dto.slug as PriceCategorySlug,
    title: dto.title,
    titleAccent: dto.titleAccent,
    eyebrow: dto.eyebrow,
    lead: dto.lead,
    seo: {
      title: dto.seo.title,
      description: dto.seo.description,
      keywords: dto.seo.keywords,
    },
    priceFrom: dto.priceFrom,
    priceUnit: dto.priceUnit,
    positions: sortByOrder(dto.positions).map((position) => {
      const row: PriceCategory['positions'][number] = {
        name: position.name,
        unit: position.unit,
        priceFrom: position.priceFrom,
      }
      if (position.note) {
        return { ...row, note: position.note }
      }
      return row
    }),
    disclaimer: dto.disclaimer,
    factors: sortByOrder(dto.factors).map((factor) => ({
      title: factor.title,
      text: factor.text,
    })),
    faq: sortByOrder(dto.faq).map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
    related,
  }
}
