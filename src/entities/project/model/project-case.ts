import type { Project } from './project.types'
import {
  hasDetailedProjectCase,
  hasGrafikaProjectCase,
} from '@/shared/config/project-content-preview'
import {
  grafikaBudgetLabel,
  grafikaCover,
  grafikaPhotos,
  grafikaStages,
  grafikaSolutions,
} from './grafika-case.data'
import {
  murinskiyBudgetLabel,
  murinskiyStages,
  murinskiySolutions,
  murinskiyCoverImage,
  resultPhotos,
} from './murinskiy-case.data'

import {
  verkhnekamenskayaBudgetLabel,
  verkhnekamenskayaCover,
  verkhnekamenskayaPhotos,
  verkhnekamenskayaStages,
} from './verkhnekamenskaya-case.data'

export function applyProjectCase(project: Project): Project {
  if (project.slug === 'verkhnekamenskaya') {
    return {
      ...project,
      image: verkhnekamenskayaCover,
      gallery: verkhnekamenskayaPhotos.map((photo) => photo.src),
      price: verkhnekamenskayaBudgetLabel,
      description:
        'Ремонт кофейни и магазина на Верхнекаменской: каркасные стены с закладными и ГКЛ, малярные работы, новая электрика и освещение, эпоксидный наливной пол.',
      review: undefined,
      details: verkhnekamenskayaStages.map((stage) => `${stage.title}: ${stage.description}`),
    }
  }
  if (hasGrafikaProjectCase(project.slug)) {
    return {
      ...project,
      image: grafikaCover,
      gallery: grafikaPhotos.map((photo) => photo.src),
      type: 'Инвестиционная квартира под аренду',
      typeAccent: 'под аренду',
      location: 'Мурино, ЖК «Графика»',
      description:
        'Реновация квартиры 29,2 м² с отдельной спальней и рабочим местом на лоджии. Реализация в 2024 году за 7 месяцев; аренда — 80 000 ₽ в месяц по данным команды «Анфас».',
      term: '7 месяцев',
      price: grafikaBudgetLabel,
      review: undefined,
      details: [
        ...grafikaStages.map((stage) => `${stage.title}: ${stage.description}`),
        ...grafikaSolutions.map((solution) => `${solution.title}: ${solution.text}`),
      ],
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
