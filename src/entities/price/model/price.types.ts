export type PriceCategorySlug =
  | 'vyvoz-musora'
  | 'gipsokarton'
  | 'demontazh'
  | 'kladka'
  | 'shtukaturka'
  | 'malyarnye'
  | 'plitka'
  | 'napolnye-pokrytiya'
  | 'elektroremontazh'
  | 'santehmontazh'
  | 'kondicionirovanie'
  | 'zvukoizolyaciya'
  | 'potolki'
  | 'dveri'
  | 'obshhestroitelnye'

export type PricePosition = {
  name: string
  unit: string
  priceFrom: number
  note?: string
}

export type PriceFactor = {
  title: string
  text: string
}

export type PriceFaqItem = {
  question: string
  answer: string
}

export type PriceSeo = {
  title: string
  description: string
  keywords: string
}

export type PriceRelated = {
  serviceSlug?: 'individual' | 'package'
  articleSlugs?: readonly string[]
  categorySlugs?: readonly PriceCategorySlug[]
}

export type PriceCategory = {
  slug: PriceCategorySlug
  title: string
  /** Фрагмент title, который в hero подсвечивается amber через <em> */
  titleAccent: string
  eyebrow: string
  lead: string
  seo: PriceSeo
  priceFrom: number
  priceUnit: string
  positions: readonly PricePosition[]
  disclaimer: string
  factors: readonly PriceFactor[]
  faq: readonly PriceFaqItem[]
  related: PriceRelated
}
