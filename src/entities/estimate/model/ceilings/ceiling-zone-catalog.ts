import type { CeilingPriceMappingItem, CeilingWorkKind } from '../shared/estimate.types'
import { CEILING_PRICE_MAPPING } from './ceiling-price.mapping'

/**
 * Категории компактного выбора «Добавить работу из прайса» (потолки).
 * Опции берутся из `CEILING_PRICE_MAPPING`, отдельного прайса нет.
 */

export type CeilingZoneWorkCategoryId =
  | 'demolition'
  | 'prep'
  | 'plaster'
  | 'putty'
  | 'finish-paint'

export type CeilingZoneWorkCategory = {
  id: CeilingZoneWorkCategoryId
  label: string
}

export const CEILING_ZONE_WORK_CATEGORIES: readonly CeilingZoneWorkCategory[] = [
  { id: 'demolition', label: 'Демонтаж' },
  { id: 'prep', label: 'Подготовка' },
  { id: 'plaster', label: 'Штукатурка' },
  { id: 'putty', label: 'Шпаклёвка' },
  { id: 'finish-paint', label: 'Покраска' },
] as const

const PREP_KINDS: readonly CeilingWorkKind[] = ['prep', 'primer']
const PUTTY_KINDS: readonly CeilingWorkKind[] = ['putty', 'reinforce']

export function getCeilingZoneMappingOptions(
  categoryId: CeilingZoneWorkCategoryId,
  mapping: readonly CeilingPriceMappingItem[] = CEILING_PRICE_MAPPING,
): readonly CeilingPriceMappingItem[] {
  return mapping.filter((item) => {
    switch (categoryId) {
      case 'demolition':
        return item.kind === 'demolition'
      case 'prep':
        return PREP_KINDS.includes(item.kind)
      case 'plaster':
        return item.kind === 'plaster'
      case 'putty':
        return PUTTY_KINDS.includes(item.kind)
      case 'finish-paint':
        return item.kind === 'finish-paint'
      default:
        return false
    }
  })
}
