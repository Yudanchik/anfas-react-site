import { company } from '@/shared/config/company'

export const SOCIALS_VIDEO_SRC = '/videos/hero.mp4' as const

export const SOCIALS_PHONE_MOCKUP_SRC = '/images/phone-mockup.png' as const

export const META_DISCLAIMER =
  'Деятельность Meta, включая Facebook и Instagram, признана экстремистской и запрещена на территории России.' as const

export const socialLinks = [
  {
    title: 'VK',
    text: 'Публикуем дизайн-проекты квартир, готовые ремонты под ключ, подборки материалов и полезные заметки для тех, кто планирует интерьер без хаоса.',
    href: company.vkHref,
  },
  {
    title: 'Telegram',
    text: 'Показываем этапы ремонта квартиры, короткие апдейты с объектов и рабочие комментарии по срокам, комплектации и реализации.',
    href: company.telegramHref,
  },
  {
    title: 'YouTube',
    text: 'Снимаем видеообзоры интерьеров, рассказываем, как проходит реализация, и объясняем сложные моменты ремонта понятным языком.',
    href: company.youtubeHref,
  },
  {
    title: 'Instagram',
    text: 'Собираем визуальные подборки, живые кадры с объектов и атмосферу проектов, чтобы заранее почувствовать стиль будущего интерьера.',
    href: company.instagramHref,
  },
] as const
