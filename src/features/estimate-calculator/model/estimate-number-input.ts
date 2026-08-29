/**
 * Чистые хелперы числовых полей калькулятора (площади, объёмы, цены, коэффициенты).
 * Пустое / мусор → 0; минус из черновика убирается; десятичные через `.` или `,`.
 */

/** Оставляет цифры и не больше одного разделителя (`.` или `,`). Буквы и прочий мусор отбрасывает. */
export function sanitizeEstimateNumberDraft(raw: string): string {
  let result = ''
  let hasSeparator = false

  for (const char of raw) {
    if (char >= '0' && char <= '9') {
      result += char
      continue
    }
    if ((char === '.' || char === ',') && !hasSeparator) {
      result += char
      hasSeparator = true
    }
  }

  return result
}

export function parseEstimateNumberInput(raw: string): number {
  const normalized = sanitizeEstimateNumberDraft(raw).replace(',', '.').trim()
  if (normalized === '' || normalized === '.') {
    return 0
  }
  const value = Number(normalized)
  if (!Number.isFinite(value)) return 0
  // Минус уже отброшен sanitize; на всякий случай clamp.
  return value < 0 ? 0 : value
}

/** Строка для отображения вне фокуса. */
export function formatEstimateNumberDisplay(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0'
  return String(value)
}

/**
 * Черновик при focus: при 0 — пустая строка, чтобы сразу печатать без выделения «0».
 */
export function getEstimateNumberFocusDraft(value: number): string {
  if (!Number.isFinite(value) || value === 0) return ''
  return String(value)
}
