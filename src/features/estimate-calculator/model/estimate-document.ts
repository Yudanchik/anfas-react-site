import type { EstimateLine, SelectedEstimateSectionWithZones } from '@/entities/estimate'

export type EstimateDocumentDetails = {
  number: string
  date: string
  customer: string
  object: string
  estimator: string
  note: string
}

export const DOCUMENT_STORAGE_KEY = 'anfas:estimate-document:v1'

export function emptyDocumentDetails(): EstimateDocumentDetails {
  const now = new Date()
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return { number: '', date, customer: '', object: '', estimator: '', note: '' }
}

export function parseDocumentDetails(value: unknown): EstimateDocumentDetails {
  const result = emptyDocumentDetails()
  if (!value || typeof value !== 'object') return result
  for (const key of Object.keys(result) as (keyof EstimateDocumentDetails)[]) {
    const field = (value as Record<string, unknown>)[key]
    if (typeof field === 'string') result[key] = field.slice(0, key === 'note' ? 2000 : 240)
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result.date)) result.date = emptyDocumentDetails().date
  return result
}

export function readDocumentDetails(): EstimateDocumentDetails {
  try {
    return parseDocumentDetails(JSON.parse(localStorage.getItem(DOCUMENT_STORAGE_KEY) ?? 'null'))
  } catch {
    return emptyDocumentDetails()
  }
}

export function documentFilename(details: EstimateDocumentDetails, extension: string): string {
  const name = ['Анфас', 'Смета', details.number, details.object, details.date]
    .filter(Boolean)
    .join('-')
    .replace(/[<>:"/\\|?*]/g, '-')
    .split('')
    .map((char) => (char.charCodeAt(0) < 32 ? '-' : char))
    .join('')
    .slice(0, 140)
  return `${name}.${extension}`
}

export function findEstimateIssues(lines: readonly EstimateLine[]): string[] {
  const issues: string[] = []
  const overlaps = new Map<string, EstimateLine>()
  for (const line of lines) {
    if (!line.enabled) continue
    if (
      ![line.quantity, line.unitPrice, line.coefficient].every(
        (n) => Number.isFinite(n) && n > 0,
      ) ||
      !Number.isSafeInteger(Math.round(line.quantity * line.unitPrice * line.coefficient))
    ) {
      issues.push(
        `${line.zoneName ? `${line.zoneName}: ` : ''}${line.title}: проверьте объём, цену и коэффициент.`,
      )
    }
    // Only known identical work on the same surface is an overlap, not shared wording.
    const aliases: Record<string, string> = {
      'demolition-floor-tile': 'floor-tile-demo',
      'demolition-wall-tile': 'wall-tile-demo',
      'finish-floor-tile-301-1300': 'floor-tile-clad',
      'clad-301-1300': 'floor-tile-clad',
    }
    const work = aliases[line.priceKey]
    if (!work || line.source === 'manual') continue
    const key = `${line.zoneId ?? line.zoneName ?? 'general'}:${work}`
    const previous = overlaps.get(key)
    if (previous && previous.sectionId !== line.sectionId) {
      issues.push(
        `Возможный дубль между разделами: ${line.title}${line.zoneName ? ` (${line.zoneName})` : ''}. Проверьте поверхности и объёмы.`,
      )
    } else overlaps.set(key, line)
  }
  return issues
}

function csvCell(value: string | number): string {
  let text = String(value)
  if (typeof value === 'string' && /^[\s]*[=+@-]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

export function buildEstimateCsv(sections: readonly SelectedEstimateSectionWithZones[]): string {
  const rows: (string | number)[][] = [
    ['Раздел', 'Зона', 'Работа', 'Ед.', 'Объём', 'Цена, руб.', 'Коэффициент', 'Сумма, руб.'],
  ]
  for (const section of sections)
    for (const zone of section.zones)
      for (const item of zone.items) {
        const line = item.line
        rows.push([
          section.sectionTitle,
          zone.zoneTitle,
          line.title,
          line.unit,
          String(line.quantity).replace('.', ','),
          String(line.unitPrice).replace('.', ','),
          String(line.coefficient).replace('.', ','),
          item.lineTotal,
        ])
      }
  rows.push(['ИТОГО', '', '', '', '', '', '', sections.reduce((sum, s) => sum + s.subtotalRub, 0)])
  return '\ufeff' + rows.map((row) => row.map(csvCell).join(';')).join('\r\n')
}

export function downloadEstimateFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
}
