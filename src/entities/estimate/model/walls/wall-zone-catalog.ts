import type { WallPriceMappingItem, WallWorkKind } from '../shared/estimate.types'
import { WALL_PRICE_MAPPING } from './wall-price.mapping'

/**
 * Категории компактного выбора «Добавить работу из прайса» (стены).
 * Опции берутся из `WALL_PRICE_MAPPING`, отдельного прайса нет.
 */

export type WallZoneWorkCategoryId =
  | 'demolition'
  | 'prep'
  | 'plaster'
  | 'putty'
  | 'slopes'
  | 'finish-paint'
  | 'finish-wallpaper'

export type WallZoneWorkCategory = {
  id: WallZoneWorkCategoryId
  label: string
}

export const WALL_ZONE_WORK_CATEGORIES: readonly WallZoneWorkCategory[] = [
  { id: 'demolition', label: 'Демонтаж' },
  { id: 'prep', label: 'Подготовка' },
  { id: 'plaster', label: 'Штукатурка' },
  { id: 'putty', label: 'Шпаклёвка' },
  { id: 'slopes', label: 'Откосы / углы' },
  { id: 'finish-paint', label: 'Покраска' },
  { id: 'finish-wallpaper', label: 'Обои' },
] as const

const PREP_KINDS: readonly WallWorkKind[] = ['prep', 'primer']
const PLASTER_KINDS: readonly WallWorkKind[] = ['plaster-gypsum', 'plaster-cement']
const PUTTY_KINDS: readonly WallWorkKind[] = ['putty', 'reinforce']

export function getWallZoneMappingOptions(
  categoryId: WallZoneWorkCategoryId,
  mapping: readonly WallPriceMappingItem[] = WALL_PRICE_MAPPING,
): readonly WallPriceMappingItem[] {
  return mapping.filter((item) => {
    switch (categoryId) {
      case 'demolition':
        return item.kind === 'demolition'
      case 'prep':
        return PREP_KINDS.includes(item.kind)
      case 'plaster':
        return PLASTER_KINDS.includes(item.kind)
      case 'putty':
        return PUTTY_KINDS.includes(item.kind)
      case 'slopes':
        return item.kind === 'slopes'
      case 'finish-paint':
        return item.kind === 'finish-paint'
      case 'finish-wallpaper':
        return item.kind === 'finish-wallpaper'
      default:
        return false
    }
  })
}
