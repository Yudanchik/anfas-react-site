export function strapiMediaUrl(url: string | undefined, fallback: string): string {
  if (!url) return fallback
  const resolved = new URL(url, import.meta.env.VITE_STRAPI_URL)
  if (!['http:', 'https:'].includes(resolved.protocol)) throw new Error('Unsupported CMS media URL')
  return resolved.toString()
}
