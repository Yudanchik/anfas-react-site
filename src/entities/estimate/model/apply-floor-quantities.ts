import { normalizeNonNegative, normalizePositiveCoefficient } from './calculate-line-total'
import type { EstimateLine, FloorWorkKind } from './estimate.types'
import { FLOOR_SECTION_ID } from './floor-price.mapping'

/**
 * Applies a quantity to matching estimate lines.
 * Does not toggle enabled — sметчик includes rows manually.
 */
export function applyQuantityToMatchingLines(
  lines: readonly EstimateLine[],
  predicate: (line: EstimateLine) => boolean,
  quantity: number,
): EstimateLine[] {
  const nextQuantity = normalizeNonNegative(quantity)
  return lines.map((line) => (predicate(line) ? { ...line, quantity: nextQuantity } : line))
}

/** Applies area to all м² works except waste (waste stays manual). */
export function applyTotalAreaToSquareMeterWorks(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => line.unit === 'м²' && line.kind !== 'waste' && line.source !== 'manual',
    quantity,
  )
}

export function applyDemolitionAreaToDemolitionWorks(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => line.kind === 'demolition' && line.unit === 'м²',
    quantity,
  )
}

export function applyWetAreaToWaterproofing(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => line.kind === 'waterproofing' && line.unit === 'м²',
    quantity,
  )
}

export function applyScreedAreaToScreedWorks(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  const screedKinds: readonly FloorWorkKind[] = [
    'base-prep',
    'primer',
    'screed-semidry',
    'screed-wet',
    'self-leveling',
  ]
  return applyQuantityToMatchingLines(
    lines,
    (line) => screedKinds.includes(line.kind) && line.unit === 'м²',
    quantity,
  )
}

let manualLineCounter = 0

/**
 * Creates a manual estimate row (not from price mapping).
 * Materials are still out of scope — this is labour-only.
 */
export function createManualEstimateLine(params: {
  title: string
  unit: string
  unitPrice: number
  quantity?: number
  coefficient?: number
  comment?: string
}): EstimateLine {
  manualLineCounter += 1
  const id = `manual-${manualLineCounter}`

  return {
    id: `${FLOOR_SECTION_ID}:${id}`,
    priceKey: id,
    sectionId: FLOOR_SECTION_ID,
    kind: 'other-rough',
    title: params.title.trim() || 'Ручная строка',
    unit: params.unit.trim() || 'м²',
    unitPrice: normalizeNonNegative(params.unitPrice),
    quantity: normalizeNonNegative(params.quantity ?? 0),
    coefficient: normalizePositiveCoefficient(params.coefficient ?? 1),
    enabled: true,
    comment: params.comment?.trim() || undefined,
    source: 'manual',
  }
}

export function updateEstimateLine(
  lines: readonly EstimateLine[],
  lineId: string,
  patch: Partial<
    Pick<EstimateLine, 'enabled' | 'quantity' | 'unitPrice' | 'coefficient' | 'comment' | 'title' | 'unit'>
  >,
): EstimateLine[] {
  return lines.map((line) => {
    if (line.id !== lineId) return line

    return {
      ...line,
      ...patch,
      quantity:
        patch.quantity === undefined ? line.quantity : normalizeNonNegative(patch.quantity),
      unitPrice:
        patch.unitPrice === undefined ? line.unitPrice : normalizeNonNegative(patch.unitPrice),
      coefficient:
        patch.coefficient === undefined
          ? line.coefficient
          : normalizePositiveCoefficient(patch.coefficient),
      comment: patch.comment === undefined ? line.comment : patch.comment.trim() || undefined,
      title: patch.title === undefined ? line.title : patch.title.trim() || line.title,
      unit: patch.unit === undefined ? line.unit : patch.unit.trim() || line.unit,
    }
  })
}
