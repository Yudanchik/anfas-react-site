import type { Project } from '@/entities/project/model/project.types'
import projectsSnapshot from '@/shared/content/projects/projects.snapshot.json'

import type { ProjectRepository } from './project.repository'

const snapshotProjects = projectsSnapshot as Project[]

export const snapshotProjectRepository: ProjectRepository = {
  async getAll(): Promise<readonly Project[]> {
    return snapshotProjects
  },

  async getBySlug(slug: string): Promise<Project | null> {
    return snapshotProjects.find((project) => project.slug === slug) ?? null
  },
}
