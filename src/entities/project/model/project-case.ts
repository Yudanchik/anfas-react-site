import type { Project } from './project.types'
import { hasDetailedProjectCase } from '@/shared/config/project-content-preview'
import {
  murinskiyBudgetLabel,
  murinskiyStages,
  murinskiySolutions,
  murinskiyCoverImage,
  resultPhotos,
} from './murinskiy-case.data'

export function applyProjectCase(project: Project): Project {
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
