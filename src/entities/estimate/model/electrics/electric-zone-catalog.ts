import type { ElectricPriceMappingItem, ElectricWorkKind } from '../shared/estimate.types'
import { isMappingItemAvailable } from '../shared/estimate-price-profile'
import { ELECTRIC_PRICE_MAPPING } from './electric-price.mapping'

/**
 * Категории компактного выбора «Добавить работу из прайса» (электрика).
 * Опции берутся из `ELECTRIC_PRICE_MAPPING`, отдельного прайса нет.
 */

export type ElectricZoneWorkCategoryId = Exclude<ElectricWorkKind, 'other'>

export type ElectricZoneWorkCategory = {
  id: ElectricZoneWorkCategoryId
  label: string
}

export const ELECTRIC_ZONE_WORK_CATEGORIES: readonly ElectricZoneWorkCategory[] = [
  { id: 'demolition', label: 'Демонтаж' },
  { id: 'layout', label: 'Разметка' },
  { id: 'chase', label: 'Штробление / отверстия' },
  { id: 'cable', label: 'Прокладка кабеля' },
  { id: 'conduit', label: 'Трубы / гофра / короба' },
  { id: 'boxes', label: 'Подрозетники / коробки' },
  { id: 'switching', label: 'Коммутация' },
  { id: 'panel', label: 'Электрощит' },
  { id: 'protection', label: 'Защита / автоматы' },
  { id: 'earthing', label: 'Заземление' },
  { id: 'underfloor', label: 'Тёплый пол' },
  { id: 'finish-outlet', label: 'Розетки / выключатели' },
  { id: 'finish-light', label: 'Освещение' },
  { id: 'low-current', label: 'Слаботочка' },
  { id: 'appliance', label: 'Подключение оборудования' },
  { id: 'check', label: 'Проверки' },
] as const

export function getElectricZoneMappingOptions(
  categoryId: ElectricZoneWorkCategoryId,
  mapping: readonly ElectricPriceMappingItem[] = ELECTRIC_PRICE_MAPPING,
): readonly ElectricPriceMappingItem[] {
  return mapping.filter(
    (item) =>
      item.kind === categoryId && isMappingItemAvailable(item),
  )
}
