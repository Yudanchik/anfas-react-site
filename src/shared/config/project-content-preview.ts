const enabled = import.meta.env.DEV || import.meta.env.VITE_PROJECT_CONTENT_PREVIEW === 'true'

/** Editorial placeholders are opt-in and never rendered in a normal production build. */
export function isProjectContentPreview(search: string) {
  return enabled && new URLSearchParams(search).get('content-preview') === '1'
}
