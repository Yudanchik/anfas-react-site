import type { PriceCategory } from '../model/price.types'

const moneyFormatter = new Intl.NumberFormat('ru-RU')

export function getPriceHubHref() {
  return '/prices'
}

export function getPriceCategoryHref(slug: string) {
  return `/prices/${slug}`
}

/** Форматирует число в рублёвую сумму без символа валюты, например "1 200". */
export function formatPriceValue(value: number) {
  return moneyFormatter.format(Math.round(value))
}

/** Форматирует цену категории/позиции как ориентир, например "от 1 200 ₽/м²". */
export function formatPriceFrom(value: number, unit?: string) {
  const amount = `${formatPriceValue(value)} ₽`
  return unit ? `от ${amount}/${unit}` : `от ${amount}`
}

/** Реальный минимум по позициям превью — используется для проверки/отображения цены категории. */
export function getCategoryMinPrice(category: PriceCategory) {
  return category.positions.reduce(
    (min, position) => Math.min(min, position.priceFrom),
    category.priceFrom,
  )
}

/** Резолвит связанные категории по slug из PriceRelated.categorySlugs, исключая саму категорию. */
export function getRelatedPriceCategories(
  allCategories: readonly PriceCategory[],
  category: PriceCategory,
  limit = 3,
) {
  const relatedSlugs = category.related.categorySlugs ?? []
  return relatedSlugs
    .map((slug) => allCategories.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is PriceCategory => candidate !== undefined && candidate.slug !== category.slug)
    .slice(0, limit)
}
