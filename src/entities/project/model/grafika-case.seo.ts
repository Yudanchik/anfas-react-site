import { absoluteUrl } from '@/shared/config/seo'
import { grafikaCover, grafikaPhotos, grafikaStagePhotos } from './grafika-case.data'

export const grafikaCasePath = '/projects/zhk-grafika/'
export const grafikaCaseTitle = 'Ремонт студии 29,2 м² под аренду в ЖК «Графика», Мурино | Анфас'
export const grafikaCaseDescription =
  'Полная реновация инвестиционной квартиры в Мурино: отдельная спальня, рабочее место на лоджии и умный свет. Этапы работ и результат: 2024 год, 7 месяцев, бюджет ≈ 3,68 млн ₽ и аренда 80 000 ₽ в месяц.'
export const grafikaShareImage = 'images/projects/zhk-grafika/share/grafika-1200x630.jpg'
export const grafikaShareImageAlt =
  'Готовая кухня в ЖК «Графика»: деревянные фасады, техника и подсветка столешницы'

const url = absoluteUrl(grafikaCasePath)
export const grafikaStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CreativeWork',
      '@id': `${url}#project`,
      name: 'ЖК «Графика» — ремонт инвестиционной квартиры 29,2 м² под аренду',
      description: grafikaCaseDescription,
      url,
      mainEntityOfPage: url,
      image: absoluteUrl(`/${grafikaCover}`),
      creator: { '@id': absoluteUrl('/#organization') },
      creditText: 'Дизайн-проект — Арина Сафронова. Реализация ремонта — Анфас.',
      dateCreated: '2024',
      locationCreated: {
        '@type': 'Place',
        name: 'ЖК «Графика», Мурино, ул. Екатерининская, 16, корпус 5',
      },
      associatedMedia: [...grafikaStagePhotos, ...grafikaPhotos].map((photo) => ({
        '@type': 'ImageObject',
        contentUrl: absoluteUrl(`/${photo.src}`),
        caption: photo.caption,
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Проекты', item: absoluteUrl('/projects/') },
        { '@type': 'ListItem', position: 3, name: 'ЖК «Графика»', item: url },
      ],
    },
  ],
}
