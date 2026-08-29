import type { EstimateLine } from './estimate.types'

/**
 * Line total for a single estimate row (labour only, no materials).
 *
 * Rules:
 * - disabled → 0
 * - empty / non-finite / negative quantity or unitPrice → 0
 * - invalid coefficient (≤0 / NaN) → treated as 1
 * - result is rounded to whole rubles with Math.round
 */
export function calculateLineTotal(line: Pick<EstimateLine, 'enabled' | 'quantity' | 'unitPrice' | 'coefficient'>): number {
  if (!line.enabled) return 0

  const quantity = normalizeNonNegative(line.quantity)
  const unitPrice = normalizeNonNegative(line.unitPrice)
  const coefficient = normalizePositiveCoefficient(line.coefficient)

  return Math.round(quantity * unitPrice * coefficient)
}

export function normalizeNonNegative(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  return value
}

export function normalizePositiveCoefficient(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1
  return value
}
