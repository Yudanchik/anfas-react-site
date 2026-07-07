import { company } from '@/shared/config/company'

export const SOCIALS_VIDEO_SRC =
  'https://cdn.vidzflow.com/v/8UW6JPwAo1_720p_1696949430.mp4' as const

export const SOCIALS_PHONE_MOCKUP_SRC = '/images/Phone%20Mockup.png' as const

export const META_DISCLAIMER =
  'Деятельность Meta (соцсети Facebook и Instagram) запрещена в России как экстремистская.' as const

export const socialLinks = [
  {
    title: 'VK',
    text: 'Показываем проекты, заметки о ремонте и полезные публикации для клиентов.',
    href: company.vkHref,
  },
  {
    title: 'Telegram',
    text: 'Публикуем новости, быстрые обновления и короткие рабочие заметки с объектов.',
    href: company.telegramHref,
  },
  {
    title: 'YouTube',
    text: 'Видеообзоры с объектов, примеры работ и ответы на частые вопросы.',
    href: company.youtubeHref,
  },
  {
    title: 'Instagram',
    text: 'Живые сторис с объектов, визуальные решения и закулисье команды.',
    href: company.instagramHref,
  },
] as const
