export const sourceAnswers = [
  '',
  'chatgpt',
  'search',
  'maps',
  'recommendation',
  'social',
  'other',
] as const

export const sourceOptions = [
  { value: '', label: 'Не указывать' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'search', label: 'Поиск Яндекс / Google' },
  { value: 'maps', label: 'Карты' },
  { value: 'recommendation', label: 'Рекомендация знакомых' },
  { value: 'social', label: 'Соцсети' },
  { value: 'other', label: 'Другое' },
] as const

export type LeadTouch = {
  landingPath: string
  referrerHost: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
}

export type LeadAttribution = { firstTouch: LeadTouch; lastTouch: LeadTouch }

const STORAGE_KEY = 'anfas-lead-attribution-v1'
const ownHosts = new Set([
  'anfas-art.ru',
  'www.anfas-art.ru',
  'anfas-remont.ru',
  'www.anfas-remont.ru',
])
let captured: LeadAttribution | undefined

function text(value: unknown, limit = 100): string {
  return typeof value === 'string'
    ? value
        .replace(/\p{Cc}/gu, '')
        .trim()
        .slice(0, limit)
    : ''
}

function host(value: unknown): string {
  const candidate = text(value, 253).toLowerCase()
  return /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(candidate) ? candidate : ''
}

function path(value: unknown): string {
  const candidate = text(value, 240).split(/[?#]/)[0]
  return candidate.startsWith('/') && !candidate.startsWith('//') ? candidate : '/'
}

function touch(value: unknown): LeadTouch | undefined {
  if (!value || typeof value !== 'object') return undefined
  const data = value as Record<string, unknown>
  if (typeof data.landingPath !== 'string') return undefined
  return {
    landingPath: path(data.landingPath),
    referrerHost: host(data.referrerHost),
    utmSource: text(data.utmSource),
    utmMedium: text(data.utmMedium),
    utmCampaign: text(data.utmCampaign),
  }
}

export function normalizeAttribution(value: unknown): LeadAttribution | undefined {
  if (!value || typeof value !== 'object') return undefined
  const data = value as Record<string, unknown>
  const firstTouch = touch(data.firstTouch)
  const lastTouch = touch(data.lastTouch)
  return firstTouch && lastTouch ? { firstTouch, lastTouch } : undefined
}

/** Called once per document, before SPA navigation can lose the landing query. */
export function attributionForVisit(
  url: string,
  referrer: string,
  previous?: LeadAttribution,
): LeadAttribution {
  const current = new URL(url)
  let referrerHost = ''
  try {
    const external = new URL(referrer)
    if (
      ['http:', 'https:'].includes(external.protocol) &&
      external.hostname !== current.hostname &&
      !ownHosts.has(external.hostname)
    ) {
      referrerHost = host(external.hostname)
    }
  } catch {
    // Referrer is often absent (manual link, app, privacy settings).
  }
  const visit: LeadTouch = {
    landingPath: path(current.pathname),
    referrerHost,
    utmSource: text(current.searchParams.get('utm_source')),
    utmMedium: text(current.searchParams.get('utm_medium')),
    utmCampaign: text(current.searchParams.get('utm_campaign')),
  }
  return {
    firstTouch: previous?.firstTouch ?? visit,
    lastTouch: !previous || visit.referrerHost || visit.utmSource ? visit : previous.lastTouch,
  }
}

export function captureLeadAttribution(): LeadAttribution | undefined {
  if (captured || typeof window === 'undefined') return captured
  let previous: LeadAttribution | undefined
  try {
    previous = normalizeAttribution(
      JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? 'null'),
    )
  } catch {
    // A blocked or corrupt store must not prevent a real enquiry.
  }
  captured = attributionForVisit(window.location.href, document.referrer, previous)
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured))
  } catch {
    // Keep the source in memory for this document when storage is unavailable.
  }
  return captured
}
