import type { FloorPriceMappingItem, FloorWorkKind } from '../shared/estimate.types'
import { FLOOR_PRICE_MAPPING } from './floor-price.mapping'

/**
 * Категории компактного выбора «Добавить работу по зоне» (полы).
 * Опции берутся из `FLOOR_PRICE_MAPPING`, отдельного прайса нет.
 */

export type FloorZoneWorkCategoryId =
  | 'demolition'
  | 'finish-floor'
  | 'waterproofing'
  | 'plinth'

export type FloorZoneWorkCategory = {
  id: FloorZoneWorkCategoryId
  label: string
}

export const FLOOR_ZONE_WORK_CATEGORIES: readonly FloorZoneWorkCategory[] = [
  { id: 'demolition', label: 'Демонтаж' },
  { id: 'finish-floor', label: 'Укладка покрытия' },
  { id: 'waterproofing', label: 'Гидроизоляция' },
  { id: 'plinth', label: 'Плинтус' },
] as const

const DEMOLITION_ZONE_KINDS: readonly FloorWorkKind[] = ['demolition']
const FINISH_ZONE_KINDS: readonly FloorWorkKind[] = ['finish-floor']
const WATERPROOFING_ZONE_KINDS: readonly FloorWorkKind[] = ['waterproofing']
const PLINTH_ZONE_KINDS: readonly FloorWorkKind[] = ['finish-plinth']

/** В категории «Плинтус» также показываем «Демонтаж плинтуса». */
const PLINTH_EXTRA_IDS = new Set(['demolition-plinth'])

export function getFloorZoneMappingOptions(
  categoryId: FloorZoneWorkCategoryId,
  mapping: readonly FloorPriceMappingItem[] = FLOOR_PRICE_MAPPING,
): readonly FloorPriceMappingItem[] {
  return mapping.filter((item) => {
    switch (categoryId) {
      case 'demolition':
        return (
          DEMOLITION_ZONE_KINDS.includes(item.kind) && !PLINTH_EXTRA_IDS.has(item.id)
        )
      case 'finish-floor':
        return FINISH_ZONE_KINDS.includes(item.kind)
      case 'waterproofing':
        return WATERPROOFING_ZONE_KINDS.includes(item.kind)
      case 'plinth':
        return PLINTH_ZONE_KINDS.includes(item.kind) || PLINTH_EXTRA_IDS.has(item.id)
      default:
        return false
    }
  })
}

export function findFloorMappingItem(
  priceKey: string,
  mapping: readonly FloorPriceMappingItem[] = FLOOR_PRICE_MAPPING,
): FloorPriceMappingItem | undefined {
  return mapping.find((item) => item.id === priceKey)
}
