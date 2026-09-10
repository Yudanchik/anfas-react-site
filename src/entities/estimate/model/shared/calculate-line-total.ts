import type { EstimateLine } from './estimate.types'

/**
 * Итог одной строки сметы (только работа, материалы не считаем).
 * Выключенная строка → 0; пустой/отрицательный объём или цена → 0;
 * некорректный коэффициент → 1; результат округляется до рублей (`Math.round`).
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
