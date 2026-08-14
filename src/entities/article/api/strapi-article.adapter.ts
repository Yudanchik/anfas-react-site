import type { Article } from '@/entities/article/model/article.types'
import type { StrapiArticleDto } from '@/shared/content/strapi/article.dto'

function ensureStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.filter((item): item is string => typeof item === 'string')
}

export function adaptStrapiArticle(dto: StrapiArticleDto): Article {
  const categorySlug = dto.category?.slug
  if (!categorySlug) {
    throw new Error(`Article ${dto.slug} is missing category`)
  }

  return {
    slug: dto.slug,
    title: dto.title,
    titleAccent: dto.titleAccent,
    eyebrow: dto.eyebrow,
    lead: dto.lead,
    cover: dto.coverPath,
    coverAlt: dto.coverAlt,
    publishedAt: dto.publishedAtDate,
    readTime: dto.readTime,
    category: dto.category?.name ?? categorySlug,
    categorySlug,
    seo: {
      title: dto.seo.title,
      description: dto.seo.description,
      keywords: dto.seo.keywords,
    },
    sections: dto.sections.map((section) => ({
      id: section.sectionId,
      heading: section.heading,
      paragraphs: ensureStringArray(section.paragraphs),
      ...(section.list ? { list: ensureStringArray(section.list) } : {}),
    })),
    checklist: ensureStringArray(dto.checklist),
    mistakes: ensureStringArray(dto.mistakes),
    cta: {
      title: dto.cta.title,
      text: dto.cta.text,
      href: dto.cta.href,
    },
    relatedSlugs: (dto.relatedArticles ?? []).map((item) => item.slug),
    relatedService: dto.relatedService,
  }
}
