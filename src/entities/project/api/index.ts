import { localProjectRepository } from './local-project.repository'
import type { ProjectRepository } from './project.repository'
import { applyProjectCase } from '../model/project-case'

export const projectRepository: ProjectRepository = {
  async getAll() {
    return (await localProjectRepository.getAll()).map(applyProjectCase)
  },
  async getBySlug(slug) {
    const project = await localProjectRepository.getBySlug(slug)
    return project ? applyProjectCase(project) : null
  },
}
