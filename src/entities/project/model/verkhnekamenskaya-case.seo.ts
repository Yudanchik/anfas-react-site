import { absoluteUrl } from '@/shared/config/seo'
import { canPreviewProjectContent } from '@/shared/config/project-content-preview'
import type { Project } from './project.types'
import { verkhnekamenskayaMedia, verkhnekamenskayaShareImage } from './verkhnekamenskaya-case.data'
export const verkhnekamenskayaCasePath = '/projects/verkhnekamenskaya/'
export const verkhnekamenskayaCaseTitle =
  'Ремонт кофейни на Верхнекаменской, 45 м² — фото и бюджет | Анфас'
export const verkhnekamenskayaCaseDescription =
  'Ремонт коммерческого помещения на Верхнекаменской, 11: каркасные стены с закладными и ГКЛ, малярные работы, новая электрика, освещение и эпоксидный пол. Фото этапов и готовой кофейни, бюджет 1 937 412 ₽ без мебели и техники.'
const mediaUrl = (path: string) =>
  new URL(
    `/${path}`,
    canPreviewProjectContent() ? 'https://dev.anfas-remont.ru' : absoluteUrl('/'),
  ).toString()
export const verkhnekamenskayaShareImageUrl = mediaUrl(verkhnekamenskayaShareImage)
export const verkhnekamenskayaShareImageAlt =
  'Готовая кофейня на Верхнекаменской: зал, стойка с подсветкой и эпоксидный пол'
export const getVerkhnekamenskayaStructuredData = (project: Project) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CreativeWork',
      '@id': `${absoluteUrl(verkhnekamenskayaCasePath)}#project`,
      name: project.title,
      description: verkhnekamenskayaCaseDescription,
      url: absoluteUrl(verkhnekamenskayaCasePath),
      image: mediaUrl(project.image),
      creator: { '@id': absoluteUrl('/#organization') },
      locationCreated: { '@type': 'Place', name: 'Санкт-Петербург, ул. Верхнекаменская, 11' },
      associatedMedia: verkhnekamenskayaMedia.map((photo) => ({
        '@type': 'ImageObject',
        contentUrl: mediaUrl(photo.src),
        caption: photo.caption,
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Проекты', item: absoluteUrl('/projects/') },
        {
          '@type': 'ListItem',
          position: 3,
          name: project.title,
          item: absoluteUrl(verkhnekamenskayaCasePath),
        },
      ],
    },
  ],
})
