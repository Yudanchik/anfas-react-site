import { absoluteUrl } from '@/shared/config/seo'
import { murinskiyStages, resultPhotos, planPhotos } from './murinskiy-case.data'

export const murinskiyCasePath = '/projects/2-murinskiy-37/'
export const murinskiyCaseTitle = 'Ремонт после пожара на 2-м Муринском, 59 м² | Анфас, СПб'
export const murinskiyCaseDescription =
  'Кейс Анфас в Санкт-Петербурге: восстановление квартиры 59 м² после пожара за 8 месяцев. Планировка, инженерия, этапы ремонта, фото результата и бюджет.'
export const murinskiyCaseImage = 'images/projects/2-murinskiy-37/story/result-36.webp'
export const murinskiyCaseShareImage =
  'images/projects/2-murinskiy-37/share/design-cover-1200x630.jpg'
export const murinskiyCaseShareImageAlt =
  'Гостиная с синим диваном — визуализация с обложки дизайн-проекта квартиры на 2-м Муринском'

const projectUrl = absoluteUrl(murinskiyCasePath)
const photos = [
  ...planPhotos.slice(0, 2),
  ...murinskiyStages.flatMap((stage) => stage.photos),
  ...resultPhotos,
]

export const murinskiyCaseStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CreativeWork',
      '@id': `${projectUrl}#project`,
      name: '2-й Муринский, 37 — восстановление квартиры после пожара',
      description: murinskiyCaseDescription,
      url: projectUrl,
      image: absoluteUrl(`/${murinskiyCaseImage}`),
      mainEntityOfPage: projectUrl,
      creator: { '@id': absoluteUrl('/#organization') },
      locationCreated: { '@type': 'Place', name: '2-й Муринский, 37, Санкт-Петербург' },
      associatedMedia: photos.map((photo) => ({
        '@type': 'ImageObject',
        contentUrl: absoluteUrl(`/${photo.src}`),
        caption: photo.publicCaption ?? photo.caption,
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Проекты', item: absoluteUrl('/projects/') },
        { '@type': 'ListItem', position: 3, name: '2-й Муринский, 37', item: projectUrl },
      ],
    },
  ],
}
