export const company = {
  name: 'Анфас',
  serviceName: 'все виды ремонтных работ',
  phone: '+7 (812) 200-80-71',
  phoneHref: 'tel:+78122008071',
  email: 'anfas-art@mail.ru',
  emailHref: 'mailto:anfas-art@mail.ru',
  address: 'Санкт-Петербург, наб. Обводного канала, д. 118АХ, офис 15С',
  addressShort: 'наб. Обводного канала, д. 118АХ',
  office: 'офис 15С',
  workHours: 'Пн-Пт 10:00-19:00',
  mapHref:
    'https://yandex.ru/maps/?text=%D0%A1%D0%B0%D0%BD%D0%BA%D1%82-%D0%9F%D0%B5%D1%82%D0%B5%D1%80%D0%B1%D1%83%D1%80%D0%B3%2C%20%D0%BD%D0%B0%D0%B1.%20%D0%9E%D0%B1%D0%B2%D0%BE%D0%B4%D0%BD%D0%BE%D0%B3%D0%BE%20%D0%BA%D0%B0%D0%BD%D0%B0%D0%BB%D0%B0%2C%20118%D0%90%D0%A5',
  mapCenter: {
    lon: 30.300723,
    lat: 59.903756,
  },
  mapEmbedSrc:
    'https://yandex.ru/map-widget/v1/?ll=30.300723%2C59.903756&z=17&pt=30.300723%2C59.903756%2Cpm2rdm',
  vkHref: 'https://vk.com/anfas_remont',
  telegramHref: 'https://t.me/anfas_remont',
  youtubeHref: 'https://www.youtube.com/@anfas_remont',
  instagramHref: 'https://www.instagram.com/anfas_remont/',
  foundedYear: '2012',
  legalOwner: 'ООО «АНФАС»',
  legalInn: '7838108397',
  legalKpp: '783801001',
  legalRegLabel: 'ОГРН',
  legalRegNumber: '1227800123418',
  legalOgrnip: '1227800123418',
  legalAddress: '190005, Санкт-Петербург, наб. Обводного канала, д. 118АХ, офис 15С',
  legalProfileHref: 'https://www.rusprofile.ru/id/1227800123418',
} as const

export const navigation = [
  { label: 'Услуги', to: '/services' },
  { label: 'Проекты', to: '/projects' },
  { label: 'Журнал', to: '/blog' },
  { label: 'О нас', to: '/about' },
  { label: 'Контакты', to: '/contacts' },
] as const
