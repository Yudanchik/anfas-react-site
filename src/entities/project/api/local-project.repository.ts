import { projects } from '../model/projects.data'
import type { ProjectRepository } from './project.repository'

export const localProjectRepository: ProjectRepository = {
  async getAll() {
    return projects
  },

  async getBySlug(slug) {
    return projects.find((project) => project.slug === slug) ?? null
  },
}
