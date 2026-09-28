export function assetUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path
  const normalizedPath = path.replace(/^\/+/, '')
  return `${import.meta.env.BASE_URL}${normalizedPath}`
}
