import { getProjectsContentSource } from '@/shared/content/content-source'

import type { ProjectRepository } from './project.repository'
import { localProjectRepository } from './local-project.repository'
import { snapshotProjectRepository } from './snapshot-project.repository'
import { strapiProjectRepository } from './strapi-project.repository'

function createProjectRepository(): ProjectRepository {
  const source = getProjectsContentSource()
  if (source === 'strapi') {
    return strapiProjectRepository
  }
  if (source === 'snapshot') {
    return snapshotProjectRepository
  }
  return localProjectRepository
}

export const projectRepository = createProjectRepository()

export type { ProjectRepository }
