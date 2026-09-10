import type { EstimateLine } from '../shared/estimate.types'
import {
  collectConflictDisabledKeys,
  disableConflictingKeysInScope,
} from '../shared/estimate-conflict-scope'

/**
 * Mutually exclusive альтернативы внутри сметы потолков.
 * Включение ключа через сценарий отключает остальные в группе.
 * Ручные строки (`source=manual`) не трогаем.
 */
export const CEILING_CONFLICT_GROUPS: Readonly<Record<string, readonly string[]>> = {
  'demolition-covering': [
    'demolition-paint',
    'demolition-plaster',
    'demolition-putty',
    'demolition-wallpaper',
    'demolition-gkl-frame',
    'demolition-suspended',
    'demolition-stretch',
    'demolition-stretch-no-save',
    'demolition-panel',
  ],
  'putty-layers': ['putty-ceiling-1', 'putty-ceiling-2'],
  'putty-finish-layers': ['putty-finish-ceiling-1', 'putty-finish-ceiling-2'],
  'paint-layers': [
    'paint-ceiling-1',
    'paint-ceiling-2',
    'paint-ceiling-3',
    'paint-ceiling-mech-2',
  ],
  'plaster-mode': ['plaster-ceiling-main', 'plaster-ceiling-partial'],
}

const PRICE_KEY_TO_CONFLICT_GROUP = buildPriceKeyIndex(CEILING_CONFLICT_GROUPS)

function buildPriceKeyIndex(
  groups: Readonly<Record<string, readonly string[]>>,
): ReadonlyMap<string, string> {
  const index = new Map<string, string>()
  for (const [groupId, keys] of Object.entries(groups)) {
    for (const key of keys) index.set(key, groupId)
  }
  return index
}

export function getCeilingConflictGroupId(priceKey: string): string | undefined {
  return PRICE_KEY_TO_CONFLICT_GROUP.get(priceKey)
}

function collectCeilingDisabledKeys(enabledPriceKeys: readonly string[]): Set<string> {
  const disabledKeys = collectConflictDisabledKeys(
    enabledPriceKeys,
    CEILING_CONFLICT_GROUPS,
    PRICE_KEY_TO_CONFLICT_GROUP,
  )

  for (const key of enabledPriceKeys) disabledKeys.delete(key)
  return disabledKeys
}

/**
 * Отключает «соседей» в conflict group.
 * Object-level: не трогает manual и zoned clones.
 */
export function disableCeilingConflictingAlternatives(
  lines: readonly EstimateLine[],
  enabledPriceKeys: readonly string[],
): EstimateLine[] {
  return disableConflictingKeysInScope(lines, collectCeilingDisabledKeys(enabledPriceKeys), {
    zoneId: null,
  })
}

/**
 * Conflict groups потолков только внутри зоны.
 */
export function disableCeilingConflictingAlternativesInZone(
  lines: readonly EstimateLine[],
  enabledPriceKeys: readonly string[],
  zoneId: string,
): EstimateLine[] {
  return disableConflictingKeysInScope(lines, collectCeilingDisabledKeys(enabledPriceKeys), {
    zoneId,
  })
}
