export type ArticleCategorySlug = 'inzheneriya' | 'chernovye-raboty' | 'komplektaciya'

export type ArticleSection = {
  id: string
  heading: string
  paragraphs: readonly string[]
  list?: readonly string[]
}

export type ArticleCta = {
  title: string
  text: string
  href: string
}

export type ArticleSeo = {
  title: string
  description: string
  keywords: string
}

export type Article = {
  slug: string
  title: string
  /** Фрагмент title, который в hero подсвечивается amber через <em> */
  titleAccent: string
  eyebrow: string
  lead: string
  cover: string
  coverAlt: string
  publishedAt: string
  readTime: string
  category: string
  categorySlug: ArticleCategorySlug
  seo: ArticleSeo
  sections: readonly ArticleSection[]
  checklist: readonly string[]
  mistakes: readonly string[]
  cta: ArticleCta
  relatedSlugs: readonly string[]
  relatedService: 'individual' | 'package'
}

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategorySlug, string> = {
  inzheneriya: 'Инженерия',
  'chernovye-raboty': 'Черновые работы',
  komplektaciya: 'Комплектация',
}

export function getArticleHref(slug: string) {
  return `/blog/${slug}`
}

export function getArticleCategoryHref(categorySlug: ArticleCategorySlug) {
  return `/blog?tema=${categorySlug}`
}
