export type StrapiClientOptions = {
  baseUrl: string
  token?: string
  timeoutMs?: number
}

export class StrapiRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'StrapiRequestError'
  }
}

export async function strapiFetch<T>(
  path: string,
  options: StrapiClientOptions,
): Promise<T> {
  const base = options.baseUrl.replace(/\/$/, '')
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  const timeoutMs = options.timeoutMs ?? 8_000
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new StrapiRequestError(`Strapi HTTP ${response.status} for ${path}`, response.status)
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof StrapiRequestError) {
      throw error
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new StrapiRequestError(`Strapi timeout after ${timeoutMs}ms for ${path}`)
    }
    throw new StrapiRequestError(
      `Strapi request failed for ${path}: ${error instanceof Error ? error.message : String(error)}`,
    )
  } finally {
    clearTimeout(timer)
  }
}
