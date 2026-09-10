export type ManualEstimateLineValidation =
  | { ok: true }
  | { ok: false; message: string }

/** UI-валидация черновика ручной строки перед добавлением. */
export function validateManualEstimateLineInput(params: {
  title: string
  quantity: number
  unitPrice: number
}): ManualEstimateLineValidation {
  if (!params.title.trim()) {
    return { ok: false, message: 'Укажите название ручной работы' }
  }
  if (!(params.quantity > 0)) {
    return { ok: false, message: 'Укажите объём больше 0' }
  }
  if (!(params.unitPrice > 0)) {
    return { ok: false, message: 'Укажите цену больше 0' }
  }
  return { ok: true }
}
