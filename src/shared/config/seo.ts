export const siteUrl = 'https://anfas-art.ru'

export const defaultSeoImage = '/images/hero/hero-living.png'

type SeoMetaOptions = {
  title: string
  description?: string
  path: string
  keywords?: string
  image?: string
  robots?: string
  type?: 'website' | 'article'
}

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return new URL(normalizedPath, siteUrl).toString()
}

export function createSeoMeta({
  title,
  description,
  path,
  keywords,
  image = defaultSeoImage,
  robots = 'index, follow',
  type = 'website',
}: SeoMetaOptions) {
  const canonical = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)
  const meta = [
    { title },
    { name: 'robots', content: robots },
    { tagName: 'link', rel: 'canonical', href: canonical },
    { property: 'og:title', content: title },
    { property: 'og:type', content: type },
    { property: 'og:url', content: canonical },
    { property: 'og:image', content: imageUrl },
    { property: 'og:locale', content: 'ru_RU' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:image', content: imageUrl },
  ]

  if (description) {
    meta.splice(1, 0, { name: 'description', content: description })
    meta.splice(6, 0, { property: 'og:description', content: description })
    meta.push({ name: 'twitter:description', content: description })
  }

  if (keywords) {
    meta.splice(2, 0, { name: 'keywords', content: keywords })
  }

  return meta
}

export const seoQueryClusters = {
  home: [
    'ремонт квартир под ключ',
    'ремонт квартир под ключ дизайн проект',
    'ремонт квартиры под ключ цена',
    'ремонт квартиры под ключ',
    'дизайн проект квартиры',
    'ремонт под ключ в новостройке',
    'ремонт под ключ с фиксированной ценой',
  ],
  services: [
    'ремонт квартир под ключ',
    'комплексный ремонт квартиры',
    'ремонт квартиры под ключ цена',
    'дизайнерский ремонт квартиры',
    'ремонт новостройки под ключ',
  ],
  projects: [
    'реальные проекты ремонта',
    'примеры ремонта квартир',
    'портфолио ремонта квартир',
    'ремонт квартир фото',
    'готовые проекты ремонта квартиры',
  ],
  about: [
    'о компании по ремонту квартир под ключ',
    'студия ремонта квартир',
    'ремонт под ключ с прозрачным контролем',
    'индивидуальный подход к ремонту',
  ],
  contacts: [
    'контакты компании по ремонту квартир',
    'оставить заявку на ремонт',
    'заказать расчёт ремонта',
    'связаться с компанией по ремонту',
  ],
  package: [
    'ремонт под ключ',
    'готовые решения по ремонту',
    'пакетный ремонт квартиры',
    'ремонт с фиксированной ценой',
    'ремонт с понятными сроками',
  ],
  design: [
    'ремонт по дизайн проекту',
    'дизайнерский ремонт квартиры',
    'ремонт квартиры по проекту',
    'ремонт по дизайн проекту под ключ',
  ],
} as const

export const seoNotes = [
  'собрали ключевые запросы без переспама',
  'в первую очередь держим ремонт квартир, под ключ, дизайн проект и пакетные решения',
  'помогаем росту и поиску без агрессивного keyword stuffing',
] as const
