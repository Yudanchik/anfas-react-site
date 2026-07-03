import type { Project } from '../model/project.types'

export interface ProjectRepository {
  getAll(): Promise<readonly Project[]>
  getBySlug(slug: string): Promise<Project | null>
}
