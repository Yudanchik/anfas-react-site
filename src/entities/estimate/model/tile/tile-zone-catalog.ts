import type { TilePriceMappingItem } from '../shared/estimate.types'
import { TILE_PRICE_MAPPING } from './tile-price.mapping'

/**
 * Категории компактного выбора «Добавить работу из прайса» (плитка).
 * Опции берутся из `TILE_PRICE_MAPPING`, отдельного прайса нет.
 */

export type TileZoneWorkCategoryId =
  | 'demolition'
  | 'prep'
  | 'cladding'
  | 'cutting'
  | 'grout'
  | 'seal'
  | 'repair'
  | 'accessory'

export type TileZoneWorkCategory = {
  id: TileZoneWorkCategoryId
  label: string
}

export const TILE_ZONE_WORK_CATEGORIES: readonly TileZoneWorkCategory[] = [
  { id: 'demolition', label: 'Демонтаж' },
  { id: 'prep', label: 'Подготовка' },
  { id: 'cladding', label: 'Облицовка' },
  { id: 'cutting', label: 'Рез / отверстия / углы' },
  { id: 'grout', label: 'Затирка' },
  { id: 'seal', label: 'Герметизация' },
  { id: 'repair', label: 'Ремонт' },
  { id: 'accessory', label: 'Плинтус / бордюр' },
] as const

export function getTileZoneMappingOptions(
  categoryId: TileZoneWorkCategoryId,
  mapping: readonly TilePriceMappingItem[] = TILE_PRICE_MAPPING,
): readonly TilePriceMappingItem[] {
  return mapping.filter((item) => {
    switch (categoryId) {
      case 'demolition':
        return item.kind === 'demolition'
      case 'prep':
        return item.kind === 'prep'
      case 'cladding':
        return item.kind === 'cladding'
      case 'cutting':
        return item.kind === 'cutting'
      case 'grout':
        return item.kind === 'grout'
      case 'seal':
        return item.kind === 'seal'
      case 'repair':
        return item.kind === 'repair'
      case 'accessory':
        return item.kind === 'accessory'
      default:
        return false
    }
  })
}
