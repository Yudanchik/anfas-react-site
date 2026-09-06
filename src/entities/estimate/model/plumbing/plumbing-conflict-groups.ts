import type { EstimateLine } from '../shared/estimate.types'
import {
  collectConflictDisabledKeys,
  disableConflictingKeysInScope,
} from '../shared/estimate-conflict-scope'

/**
 * Mutually exclusive альтернативы внутри сметы сантехники.
 * Включение ключа через сценарий отключает остальные в группе.
 * Ручные строки (`source=manual`) не трогаем.
 *
 * Держим тонко: шаг ТП, тип трапа, чугун/акрил ванна, soft vs напольный унитаз.
 * Диаметры труб НЕ мьютексим — на объекте они сосуществуют.
 */
export const PLUMBING_CONFLICT_GROUPS: Readonly<Record<string, readonly string[]>> = {
  'ufh-step': ['ufh-pipe-100', 'ufh-pipe-150-200'],
  'drain-type': ['drain-point', 'drain-slot'],
  'bath-material': ['finish-bath-cast-iron', 'finish-bath-acrylic'],
  'toilet-install': ['finish-toilet-soft', 'finish-toilet-floor'],
}

const PRICE_KEY_TO_CONFLICT_GROUP = buildPriceKeyIndex(PLUMBING_CONFLICT_GROUPS)

function buildPriceKeyIndex(
  groups: Readonly<Record<string, readonly string[]>>,
): ReadonlyMap<string, string> {
  const index = new Map<string, string>()
  for (const [groupId, keys] of Object.entries(groups)) {
    for (const key of keys) index.set(key, groupId)
  }
  return index
}

export function getPlumbingConflictGroupId(priceKey: string): string | undefined {
  return PRICE_KEY_TO_CONFLICT_GROUP.get(priceKey)
}

function collectPlumbingDisabledKeys(enabledPriceKeys: readonly string[]): Set<string> {
  const disabledKeys = collectConflictDisabledKeys(
    enabledPriceKeys,
    PLUMBING_CONFLICT_GROUPS,
    PRICE_KEY_TO_CONFLICT_GROUP,
  )

  for (const key of enabledPriceKeys) disabledKeys.delete(key)
  return disabledKeys
}

/**
 * Отключает «соседей» в conflict group.
 * Object-level: не трогает manual и zoned clones.
 */
export function disablePlumbingConflictingAlternatives(
  lines: readonly EstimateLine[],
  enabledPriceKeys: readonly string[],
): EstimateLine[] {
  return disableConflictingKeysInScope(lines, collectPlumbingDisabledKeys(enabledPriceKeys), {
    zoneId: null,
  })
}

/**
 * Conflict groups сантехники только внутри зоны.
 */
export function disablePlumbingConflictingAlternativesInZone(
  lines: readonly EstimateLine[],
  enabledPriceKeys: readonly string[],
  zoneId: string,
): EstimateLine[] {
  return disableConflictingKeysInScope(lines, collectPlumbingDisabledKeys(enabledPriceKeys), {
    zoneId,
  })
}
