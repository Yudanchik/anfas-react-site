export type ContentSource = 'local' | 'strapi' | 'snapshot'

export function getContentSource(): ContentSource {
  const value = (process.env.CONTENT_SOURCE || 'local').trim().toLowerCase()
  if (value === 'strapi' || value === 'snapshot') {
    return value
  }
  return 'local'
}
