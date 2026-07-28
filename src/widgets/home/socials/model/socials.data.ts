import { company } from '@/shared/config/company'

export const SOCIALS_VIDEO_SRC = '/videos/hero.mp4' as const

export const SOCIALS_PHONE_MOCKUP_SRC = '/images/phone-mockup.png' as const

export const META_DISCLAIMER =
  'Деятельность Meta, включая Facebook и Instagram, признана экстремистской и запрещена на территории России.' as const

export const socialLinks = [
  {
    title: 'VK',
    text: 'Публикуем дизайн-проекты, готовые интерьеры, подборки материалов и заметки для тех, кто планирует обновление квартиры.',
    href: company.vkHref,
  },
  {
    title: 'Telegram',
    text: 'Показываем этапы на объекте, короткие апдейты и рабочие комментарии по срокам, материалам и реализации.',
    href: company.telegramHref,
  },
  {
    title: 'YouTube',
    text: 'Снимаем видеообзоры интерьеров, рассказываем, как проходит реализация, и объясняем сложные узлы простым языком.',
    href: company.youtubeHref,
  },
  {
    title: 'Instagram',
    text: 'Собираем визуальные подборки, живые кадры с объектов и атмосферу проектов, чтобы заранее почувствовать стиль будущего интерьера.',
    href: company.instagramHref,
  },
] as const
