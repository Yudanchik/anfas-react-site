/**
 * Pure helpers for estimate numeric fields (areas, quantities, prices, coefficients).
 * Empty / invalid → 0; negatives → 0. Decimals allowed.
 */

export function parseEstimateNumberInput(raw: string): number {
  const normalized = raw.replace(',', '.').trim()
  if (normalized === '' || normalized === '.' || normalized === '-' || normalized === '-.') {
    return 0
  }
  const value = Number(normalized)
  if (!Number.isFinite(value)) return 0
  return value < 0 ? 0 : value
}

/** Display string while not editing; keep simple decimal representation. */
export function formatEstimateNumberDisplay(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0'
  return String(value)
}

/**
 * Draft shown on focus: blank when value is 0 so the user can type without selecting.
 * Otherwise show the current number as text.
 */
export function getEstimateNumberFocusDraft(value: number): string {
  if (!Number.isFinite(value) || value === 0) return ''
  return String(value)
}
