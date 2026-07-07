export const company = {
  name: 'Анфас',
  serviceName: 'дизайн и ремонт',
  phone: '+7 (812) 200-80-71',
  phoneHref: 'tel:+78122008071',
  email: 'anfas-art@mail.ru',
  emailHref: 'mailto:anfas-art@mail.ru',
  address: 'Санкт-Петербург, наб. Обводного канала, 118АХ',
  vkHref: 'https://vk.com/anfas_remont',
  telegramHref: 'https://t.me/anfas_remont',
  youtubeHref: 'https://www.youtube.com/@anfas_remont',
  instagramHref: 'https://www.instagram.com/anfas_remont/',
  foundedYear: '2012',
  legalOwner: 'ИП Осетров Кирилл Артурович',
  legalInn: '7838108397',
  legalOgrnip: '1227800123418',
  legalProfileHref: 'https://www.rusprofile.ru/id/1227800123418',
} as const

export const navigation = [
  { label: 'Услуги', to: '/services' },
  { label: 'Проекты', to: '/projects' },
  { label: 'О нас', to: '/about' },
  { label: 'Контакты', to: '/contacts' },
] as const
