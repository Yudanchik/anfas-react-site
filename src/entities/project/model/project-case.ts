import type { Project } from './project.types'
import {
  hasDetailedProjectCase,
  hasGrafikaCasePreview,
} from '@/shared/config/project-content-preview'
import { grafikaBudgetLabel, grafikaCover, grafikaPhotos } from './grafika-case.data'
import {
  murinskiyBudgetLabel,
  murinskiyStages,
  murinskiySolutions,
  murinskiyCoverImage,
  resultPhotos,
} from './murinskiy-case.data'

export function applyProjectCase(project: Project): Project {
  if (hasGrafikaCasePreview(project.slug)) {
    return {
      ...project,
      image: grafikaCover,
      gallery: grafikaPhotos.map((photo) => photo.src),
      type: 'Инвестиционная квартира под аренду',
      typeAccent: 'под аренду',
      location: 'Мурино, ЖК «Графика»',
      description:
        'Студия 29,2 м² с отдельной спальней и рабочим местом на лоджии. Реализация в 2024 году за 7 месяцев; аренда — 80 000 ₽ в месяц по данным команды «Анфас».',
      term: '7 месяцев',
      price: grafikaBudgetLabel,
      review: undefined,
    }
  }
  if (!hasDetailedProjectCase(project.slug)) return project
  return {
    ...project,
    image: murinskiyCoverImage,
    gallery: resultPhotos.map((photo) => photo.src),
    type: 'Восстановление квартиры после пожара',
    typeAccent: 'после пожара',
    description:
      'Квартира 59 м² после пожара: новая планировка с тремя комнатами, гардеробом и постирочной. Дизайн, ремонт, комплектация и подготовка к проживанию за 8 месяцев.',
    term: '8 месяцев',
    price: murinskiyBudgetLabel,
    review: undefined,
    details: [
      ...murinskiyStages.map((stage) => `${stage.title}: ${stage.description}`),
      ...murinskiySolutions.map((solution) => `${solution.title}: ${solution.text}`),
    ],
  }
}
