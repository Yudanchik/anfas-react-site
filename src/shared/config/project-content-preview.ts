const enabled = import.meta.env.DEV || import.meta.env.VITE_PROJECT_CONTENT_PREVIEW === 'true'

export function canPreviewProjectContent() {
  return enabled
}

/** Editorial placeholders are opt-in and never rendered in a normal production build. */
export function isProjectContentPreview(search: string) {
  return enabled && new URLSearchParams(search).get('content-preview') === '1'
}

/** Owner-approved detailed case, available in both production and development. */
export function hasDetailedProjectCase(slug: string) {
  return slug === '2-murinskiy-37'
}

/** The Grafika rewrite is staged on dev until the case is approved for the main site. */
export function hasGrafikaCasePreview(slug: string) {
  return enabled && slug === 'zhk-grafika'
}
