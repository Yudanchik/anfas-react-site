import type { PlumbingPriceMappingItem, PlumbingWorkKind } from '../shared/estimate.types'
import { isMappingItemAvailable } from '../shared/estimate-price-profile'
import { PLUMBING_PRICE_MAPPING } from './plumbing-price.mapping'

/**
 * Категории компактного выбора «Добавить работу из прайса» (сантехника).
 * Опции берутся из `PLUMBING_PRICE_MAPPING`, отдельного прайса нет.
 */

export type PlumbingZoneWorkCategoryId = Exclude<PlumbingWorkKind, 'other'>

export type PlumbingZoneWorkCategory = {
  id: PlumbingZoneWorkCategoryId
  label: string
}

export const PLUMBING_ZONE_WORK_CATEGORIES: readonly PlumbingZoneWorkCategory[] = [
  { id: 'demolition', label: 'Демонтаж' },
  { id: 'drainage', label: 'Канализация' },
  { id: 'water-supply', label: 'Водоснабжение' },
  { id: 'connections', label: 'Соединения / опрессовка' },
  { id: 'underfloor', label: 'Водяной тёплый пол' },
  { id: 'hidden-mixer', label: 'Встроенные смесители' },
  { id: 'manifold', label: 'Коллектор / учёт' },
  { id: 'installation', label: 'Инсталляция / трапы' },
  { id: 'finish', label: 'Финишная сантехника' },
  { id: 'check', label: 'Проверки / пуск' },
] as const

export function getPlumbingZoneMappingOptions(
  categoryId: PlumbingZoneWorkCategoryId,
  mapping: readonly PlumbingPriceMappingItem[] = PLUMBING_PRICE_MAPPING,
): readonly PlumbingPriceMappingItem[] {
  return mapping.filter(
    (item) =>
      item.kind === categoryId && isMappingItemAvailable(item),
  )
}
