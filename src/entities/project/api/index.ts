import { localProjectRepository } from './local-project.repository'
import { strapiProjectRepository } from './strapi-project.repository'
import type { ProjectRepository } from './project.repository'
import type { Project } from '../model/project.types'
import {
  murinskiyBudgetLabel,
  murinskiyStages,
  murinskiySolutions,
} from '../model/murinskiy-case.data'
import { isProjectCaseDraft } from '@/shared/config/project-content-preview'

const sourceRepository =
  import.meta.env.VITE_CONTENT_SOURCE === 'strapi'
    ? strapiProjectRepository
    : localProjectRepository

function applyCaseContent(project: Project): Project {
  if (!isProjectCaseDraft(project.slug)) return project
  return {
    ...project,
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

export const projectRepository: ProjectRepository = {
  async getAll() {
    return (await sourceRepository.getAll()).map(applyCaseContent)
  },
  async getBySlug(slug) {
    const project = await sourceRepository.getBySlug(slug)
    return project ? applyCaseContent(project) : null
  },
}
