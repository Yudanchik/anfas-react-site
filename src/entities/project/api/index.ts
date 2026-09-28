import { localProjectRepository } from './local-project.repository'
import { strapiProjectRepository } from './strapi-project.repository'

export const projectRepository =
  import.meta.env.VITE_CONTENT_SOURCE === 'strapi'
    ? strapiProjectRepository
    : localProjectRepository
