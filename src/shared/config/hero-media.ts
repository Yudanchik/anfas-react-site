export type SharedHeroSlide = {
  image: string
  alt: string
  eyebrow: string
}

export const sharedHeroSlides: ReadonlyArray<SharedHeroSlide> = [
  {
    image: '/images/hero/hero-bedroom.png',
    alt: 'Спокойная премиальная спальня в тёплых бежевых тонах',
    eyebrow: 'Санкт-Петербург · с 2012 года',
  },
  {
    image: '/images/hero/hero-living.png',
    alt: 'Современная гостиная с мягким светом и дорогими материалами',
    eyebrow: 'Дизайн · ремонт · комплектация',
  },
  {
    image: '/images/hero/hero-kitchen.png',
    alt: 'Минималистичная кухня с акцентным тёплым освещением',
    eyebrow: 'Под ваш ритм жизни',
  },
  {
    image: '/images/hero/hero-dining.png',
    alt: 'Премиальная столовая зона с мягким вечерним светом и тёплыми материалами',
    eyebrow: 'Премиальный интерьер без визуального шума',
  },
] as const

export const innerHeroImages = {
  services: sharedHeroSlides[0],
  projects: sharedHeroSlides[1],
  contacts: sharedHeroSlides[2],
  about: sharedHeroSlides[3],
} as const
