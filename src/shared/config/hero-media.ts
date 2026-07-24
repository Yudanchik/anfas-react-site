import heroBedroom from '@/assets/images/hero/hero-bedroom.webp'
import heroDining from '@/assets/images/hero/hero-dining.webp'
import heroKitchen from '@/assets/images/hero/hero-kitchen.webp'
import heroLiving from '@/assets/images/hero/hero-living.webp'

export type SharedHeroSlide = {
  image: string
  alt: string
  eyebrow: string
  width: number
  height: number
}

export const HERO_LCP_IMAGE = heroBedroom

export const sharedHeroSlides: ReadonlyArray<SharedHeroSlide> = [
  {
    image: heroBedroom,
    alt: 'Спокойная премиальная спальня в тёплых бежевых тонах',
    eyebrow: 'Санкт-Петербург · с 2012 года',
    width: 1672,
    height: 941,
  },
  {
    image: heroLiving,
    alt: 'Современная гостиная с мягким светом и дорогими материалами',
    eyebrow: 'Дизайн · ремонт · комплектация',
    width: 1672,
    height: 941,
  },
  {
    image: heroKitchen,
    alt: 'Минималистичная кухня с акцентным тёплым освещением',
    eyebrow: 'Под ваш ритм жизни',
    width: 1672,
    height: 941,
  },
  {
    image: heroDining,
    alt: 'Премиальная столовая зона с мягким вечерним светом и тёплыми материалами',
    eyebrow: 'Премиальный интерьер без визуального шума',
    width: 1692,
    height: 929,
  },
] as const

export const innerHeroImages = {
  services: sharedHeroSlides[0],
  projects: sharedHeroSlides[1],
  contacts: sharedHeroSlides[2],
  about: sharedHeroSlides[3],
} as const
