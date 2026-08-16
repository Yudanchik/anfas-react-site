export type ContentSource = 'local' | 'strapi' | 'snapshot'

export type ProjectsContentSource = ContentSource
export type ServicesContentSource = ContentSource
export type PricesContentSource = ContentSource

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

/** Independent of articles/projects sources. Default local keeps production unchanged. */
export function getServicesContentSource(): ServicesContentSource {
  const value = (process.env.SERVICES_CONTENT_SOURCE || 'local').trim().toLowerCase()
  if (value === 'strapi' || value === 'snapshot') {
    return value
  }
  return 'local'
}

/** Independent of articles/projects/services sources. Default local keeps production unchanged. */
export function getPricesContentSource(): PricesContentSource {
  const value = (process.env.PRICES_CONTENT_SOURCE || 'local').trim().toLowerCase()
  if (value === 'strapi' || value === 'snapshot') {
    return value
  }
  return 'local'
}
