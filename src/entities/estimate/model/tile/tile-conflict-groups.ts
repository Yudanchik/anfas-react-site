import type { EstimateLine } from '../shared/estimate.types'
import {
  collectConflictDisabledKeys,
  disableConflictingKeysInScope,
} from '../shared/estimate-conflict-scope'

/**
 * Mutually exclusive альтернативы внутри сметы плитки.
 * Включение ключа через сценарий отключает остальные в группе.
 * Ручные строки (`source=manual`) не трогаем.
 */
export const TILE_CONFLICT_GROUPS: Readonly<Record<string, readonly string[]>> = {
  'clad-format': [
    'clad-301-1300',
    'clad-1301-1700',
    'clad-1701-3600',
    'clad-over-3600',
    'clad-mosaic',
    'clad-small-format',
  ],
  'grout-type': [
    'grout-cement',
    'grout-cement-small',
    'grout-epoxy',
    'grout-epoxy-small',
    'grout-epoxy-mosaic',
  ],
  'corner-finish': ['corner-cement', 'corner-epoxy'],
  'cut-45': ['cut-45-ceramic', 'cut-45-porcelain', 'cut-45-large'],
  'hole-size': ['hole-up-to-100', 'hole-100-230', 'hole-rect'],
}

const PRICE_KEY_TO_CONFLICT_GROUP = buildPriceKeyIndex(TILE_CONFLICT_GROUPS)

function buildPriceKeyIndex(
  groups: Readonly<Record<string, readonly string[]>>,
): ReadonlyMap<string, string> {
  const index = new Map<string, string>()
  for (const [groupId, keys] of Object.entries(groups)) {
    for (const key of keys) index.set(key, groupId)
  }
  return index
}

export function getTileConflictGroupId(priceKey: string): string | undefined {
  return PRICE_KEY_TO_CONFLICT_GROUP.get(priceKey)
}

function collectTileDisabledKeys(enabledPriceKeys: readonly string[]): Set<string> {
  const disabledKeys = collectConflictDisabledKeys(
    enabledPriceKeys,
    TILE_CONFLICT_GROUPS,
    PRICE_KEY_TO_CONFLICT_GROUP,
  )

  for (const key of enabledPriceKeys) disabledKeys.delete(key)
  return disabledKeys
}

/**
 * Отключает «соседей» в conflict group.
 * Object-level: не трогает manual и zoned clones.
 */
export function disableTileConflictingAlternatives(
  lines: readonly EstimateLine[],
  enabledPriceKeys: readonly string[],
): EstimateLine[] {
  return disableConflictingKeysInScope(lines, collectTileDisabledKeys(enabledPriceKeys), {
    zoneId: null,
  })
}

/**
 * Conflict groups плитки только внутри зоны.
 */
export function disableTileConflictingAlternativesInZone(
  lines: readonly EstimateLine[],
  enabledPriceKeys: readonly string[],
  zoneId: string,
): EstimateLine[] {
  return disableConflictingKeysInScope(lines, collectTileDisabledKeys(enabledPriceKeys), {
    zoneId,
  })
}
