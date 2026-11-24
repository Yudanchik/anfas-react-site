import { localProjectRepository } from './local-project.repository'
import { strapiProjectRepository } from './strapi-project.repository'
import type { ProjectRepository } from './project.repository'
import { applyProjectCase } from '../model/project-case'

const sourceRepository =
  import.meta.env.VITE_CONTENT_SOURCE === 'strapi'
    ? strapiProjectRepository
    : localProjectRepository

export const projectRepository: ProjectRepository = {
  async getAll() {
    return (await sourceRepository.getAll()).map(applyProjectCase)
  },
  async getBySlug(slug) {
    const project = await sourceRepository.getBySlug(slug)
    return project ? applyProjectCase(project) : null
  },
}
