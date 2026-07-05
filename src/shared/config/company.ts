export const company = {
  name: 'Анфас',
  serviceName: 'дизайн и ремонт',
  phone: '+7 (812) 200-80-71',
  phoneHref: 'tel:+78122008071',
  email: 'anfas-art@mail.ru',
  emailHref: 'mailto:anfas-art@mail.ru',
  address: 'Санкт-Петербург, наб. Обводного канала, 118АХ',
  instagramHref: 'https://vk.com/anfas_remont',
  telegramHref: 'https://t.me/anfas_remont',
  foundedYear: '2012',
} as const

export const navigation = [
  { label: 'Услуги', to: '/services' },
  { label: 'Проекты', to: '/projects' },
  { label: 'О нас', to: '/about' },
  { label: 'Контакты', to: '/contacts' },
] as const
