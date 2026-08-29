import { normalizeNonNegative, normalizePositiveCoefficient } from './calculate-line-total'
import type { EstimateLine, EstimateWorkKind } from './estimate.types'

/**
 * Applies a quantity to matching estimate lines.
 * Does not toggle enabled — estimator includes rows manually.
 */
export function applyQuantityToMatchingLines(
  lines: readonly EstimateLine[],
  predicate: (line: EstimateLine) => boolean,
  quantity: number,
): EstimateLine[] {
  const nextQuantity = normalizeNonNegative(quantity)
  return lines.map((line) => (predicate(line) ? { ...line, quantity: nextQuantity } : line))
}

let manualLineCounter = 0

/**
 * Bumps the manual id counter past any restored `manual-N` priceKeys
 * so newly added manual rows do not collide after localStorage hydrate.
 */
export function noteManualLineIds(lines: readonly EstimateLine[]): void {
  for (const line of lines) {
    if (line.source !== 'manual') continue
    const match = /^manual-(\d+)$/.exec(line.priceKey)
    if (!match) continue
    const value = Number(match[1])
    if (Number.isFinite(value) && value > manualLineCounter) {
      manualLineCounter = value
    }
  }
}

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
  sectionId?: string
  kind?: EstimateWorkKind
}): EstimateLine {
  manualLineCounter += 1
  const id = `manual-${manualLineCounter}`
  const sectionId = params.sectionId ?? 'floors'

  return {
    id: `${sectionId}:${id}`,
    priceKey: id,
    sectionId,
    kind: params.kind ?? 'other-rough',
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
