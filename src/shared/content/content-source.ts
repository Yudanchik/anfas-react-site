export type ContentSource = 'local' | 'strapi' | 'snapshot'

export type ProjectsContentSource = ContentSource

export function getContentSource(): ContentSource {
  const value = (process.env.CONTENT_SOURCE || 'local').trim().toLowerCase()
  if (value === 'strapi' || value === 'snapshot') {
    return value
  }
  return 'local'
}

/** Independent of article CONTENT_SOURCE. Default local keeps production unchanged. */
export function getProjectsContentSource(): ProjectsContentSource {
  const value = (process.env.PROJECTS_CONTENT_SOURCE || 'local').trim().toLowerCase()
  if (value === 'strapi' || value === 'snapshot') {
    return value
  }
  return 'local'
}
