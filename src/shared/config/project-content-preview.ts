const enabled = import.meta.env.DEV || import.meta.env.VITE_PROJECT_CONTENT_PREVIEW === 'true'

/** Editorial placeholders are opt-in and never rendered in a normal production build. */
export function isProjectContentPreview(search: string) {
  return enabled && new URLSearchParams(search).get('content-preview') === '1'
}

/** The assembled case is visible on dev; production keeps its existing project page. */
export function isProjectCaseDraft(slug: string) {
  return enabled && slug === '2-murinskiy-37'
}
