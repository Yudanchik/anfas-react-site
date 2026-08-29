import { normalizeNonNegative, normalizePositiveCoefficient } from './calculate-line-total'
import type { EstimateLine, EstimateWorkKind } from './estimate.types'

/**
 * Zoned clone lines: отдельная строка сметы для зоны (кухня, коридор…).
 * Уникальный `id`, тот же `priceKey`, что у позиции прайса; строки без зоны остаются общими.
 * Conflict groups их не отключают. Сейчас используется на полах; стены могут переиспользовать позже.
 */

const ZONE_ID_PATTERN = /:zone-(\d+)$/

let zoneLineCounter = 0

export function isZonedEstimateLine(line: Pick<EstimateLine, 'id'>): boolean {
  return ZONE_ID_PATTERN.test(line.id)
}

/**
 * Сдвигает счётчик zone-id после hydrate из localStorage,
 * чтобы новые `:zone-N` не пересеклись с уже сохранёнными.
 */
export function noteZonedLineIds(lines: readonly EstimateLine[]): void {
  for (const line of lines) {
    const match = ZONE_ID_PATTERN.exec(line.id)
    if (!match) continue
    const value = Number(match[1])
    if (Number.isFinite(value) && value > zoneLineCounter) {
      zoneLineCounter = value
    }
  }
}

export type CreateZonedEstimateLineParams = {
  sectionId: string
  priceKey: string
  title: string
  unit: string
  unitPrice: number
  kind: EstimateWorkKind
  quantity: number
  zoneName: string
  comment?: string
  source?: EstimateLine['source']
  frontendCategorySlug?: EstimateLine['frontendCategorySlug']
  note?: string
  coefficient?: number
}

/**
 * Создаёт отдельную строку сметы из прайс-позиции для конкретной зоны.
 * Сразу `enabled`; существующие строки не мутирует — результат добавляет вызывающий код.
 */
export function createZonedEstimateLine(params: CreateZonedEstimateLineParams): EstimateLine {
  zoneLineCounter += 1
  const zoneName = params.zoneName.trim()
  const comment = params.comment?.trim()

  return {
    id: `${params.sectionId}:zone-${zoneLineCounter}`,
    priceKey: params.priceKey,
    sectionId: params.sectionId,
    kind: params.kind,
    title: params.title,
    unit: params.unit.trim() || 'м²',
    unitPrice: normalizeNonNegative(params.unitPrice),
    quantity: normalizeNonNegative(params.quantity),
    coefficient: normalizePositiveCoefficient(params.coefficient ?? 1),
    enabled: true,
    zoneName: zoneName || undefined,
    comment: comment || undefined,
    source: params.source ?? 'pdf',
    frontendCategorySlug: params.frontendCategorySlug,
    note: params.note,
  }
}
