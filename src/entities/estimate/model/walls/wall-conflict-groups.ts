import type { EstimateLine } from '../shared/estimate.types'
import {
  collectConflictDisabledKeys,
  disableConflictingKeysInScope,
} from '../shared/estimate-conflict-scope'

/**
 * Mutually exclusive альтернативы внутри сметы стен.
 * Включение ключа через сценарий отключает остальные в группе.
 * Ручные строки (`source=manual`) не трогаем.
 */
export const WALL_CONFLICT_GROUPS: Readonly<Record<string, readonly string[]>> = {
  'demolition-covering': [
    'demolition-wallpaper',
    'demolition-paint',
    'demolition-plaster',
    'demolition-wall-tile',
    'demolition-glassfiber',
    'demolition-paint-mesh',
  ],
  'plaster-system': ['plaster-gypsum-main', 'plaster-cement-main'],
  'putty-base-layers': ['putty-base-1', 'putty-base-2'],
  'putty-finish-layers': ['putty-finish-1', 'putty-finish-2'],
  'paint-layers': ['paint-1', 'paint-2', 'paint-3', 'paint-mech-2'],
  'wallpaper-type': [
    'wallpaper-flizelin',
    'wallpaper-vinyl-match',
    'wallpaper-photo',
    'wallpaper-textile-match',
  ],
  'slopes-panel': ['slopes-sandwich', 'slopes-ruspanel'],
}

/** Финиш обоями vs покраска (флизелин под покраску совместим с покраской). */
export const WALL_WALLPAPER_FINISH_KEYS = [
  'wallpaper-flizelin',
  'wallpaper-vinyl-match',
  'wallpaper-photo',
  'wallpaper-textile-match',
] as const

export const WALL_PAINT_FINISH_KEYS = [
  'paint-1',
  'paint-2',
  'paint-3',
  'paint-mech-2',
  'finish-flizelin-under-paint',
] as const

const PRICE_KEY_TO_CONFLICT_GROUP = buildPriceKeyIndex(WALL_CONFLICT_GROUPS)

function buildPriceKeyIndex(
  groups: Readonly<Record<string, readonly string[]>>,
): ReadonlyMap<string, string> {
  const index = new Map<string, string>()
  for (const [groupId, keys] of Object.entries(groups)) {
    for (const key of keys) index.set(key, groupId)
  }
  return index
}

export function getWallConflictGroupId(priceKey: string): string | undefined {
  return PRICE_KEY_TO_CONFLICT_GROUP.get(priceKey)
}

function collectWallDisabledKeys(enabledPriceKeys: readonly string[]): Set<string> {
  const disabledKeys = collectConflictDisabledKeys(
    enabledPriceKeys,
    WALL_CONFLICT_GROUPS,
    PRICE_KEY_TO_CONFLICT_GROUP,
  )
  const enabledSet = new Set(enabledPriceKeys)

  const enablesWallpaper = WALL_WALLPAPER_FINISH_KEYS.some((key) => enabledSet.has(key))
  const enablesPaintFinish = WALL_PAINT_FINISH_KEYS.some((key) => enabledSet.has(key))

  if (enablesWallpaper) {
    for (const key of WALL_PAINT_FINISH_KEYS) disabledKeys.add(key)
  }
  if (enablesPaintFinish) {
    for (const key of WALL_WALLPAPER_FINISH_KEYS) disabledKeys.add(key)
  }

  for (const key of enabledPriceKeys) disabledKeys.delete(key)
  return disabledKeys
}

/**
 * Отключает «соседей» в conflict group и взаимоисключение обои↔покраска.
 * Object-level: не трогает manual и zoned clones.
 */
export function disableWallConflictingAlternatives(
  lines: readonly EstimateLine[],
  enabledPriceKeys: readonly string[],
): EstimateLine[] {
  return disableConflictingKeysInScope(lines, collectWallDisabledKeys(enabledPriceKeys), {
    zoneId: null,
  })
}

/**
 * Conflict groups стен только внутри зоны.
 */
export function disableWallConflictingAlternativesInZone(
  lines: readonly EstimateLine[],
  enabledPriceKeys: readonly string[],
  zoneId: string,
): EstimateLine[] {
  return disableConflictingKeysInScope(lines, collectWallDisabledKeys(enabledPriceKeys), {
    zoneId,
  })
}
