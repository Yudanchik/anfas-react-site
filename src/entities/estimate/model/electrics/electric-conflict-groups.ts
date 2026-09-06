import type { EstimateLine } from '../shared/estimate.types'
import {
  collectConflictDisabledKeys,
  disableConflictingKeysInScope,
} from '../shared/estimate-conflict-scope'

/**
 * Mutually exclusive альтернативы внутри сметы электрики.
 * Включение ключа через сценарий отключает остальные в группе.
 * Ручные строки (`source=manual`) не трогаем.
 *
 * Держим тонко: только реально взаимоисключающие размеры (тёплый пол, щит, люстра).
 * Разные материалы штробы/кабеля НЕ мьютексим — на объекте они сосуществуют.
 */
export const ELECTRIC_CONFLICT_GROUPS: Readonly<Record<string, readonly string[]>> = {
  'ufh-install': ['ufh-install-small', 'ufh-install-large'],
  'panel-assembly-size': ['panel-assembly-12', 'panel-assembly-18', 'panel-assembly-24'],
  'panel-enclosure-outdoor-size': [
    'panel-enclosure-outdoor-12',
    'panel-enclosure-outdoor-18',
    'panel-enclosure-outdoor-24',
  ],
  'panel-enclosure-indoor-size': [
    'panel-enclosure-indoor-12',
    'panel-enclosure-indoor-18',
    'panel-enclosure-indoor-24',
  ],
  'finish-chandelier-size': [
    'finish-chandelier-std',
    'finish-chandelier-complex',
    'finish-chandelier-heavy',
  ],
}

const PRICE_KEY_TO_CONFLICT_GROUP = buildPriceKeyIndex(ELECTRIC_CONFLICT_GROUPS)

function buildPriceKeyIndex(
  groups: Readonly<Record<string, readonly string[]>>,
): ReadonlyMap<string, string> {
  const index = new Map<string, string>()
  for (const [groupId, keys] of Object.entries(groups)) {
    for (const key of keys) index.set(key, groupId)
  }
  return index
}

export function getElectricConflictGroupId(priceKey: string): string | undefined {
  return PRICE_KEY_TO_CONFLICT_GROUP.get(priceKey)
}

function collectElectricDisabledKeys(enabledPriceKeys: readonly string[]): Set<string> {
  const disabledKeys = collectConflictDisabledKeys(
    enabledPriceKeys,
    ELECTRIC_CONFLICT_GROUPS,
    PRICE_KEY_TO_CONFLICT_GROUP,
  )

  for (const key of enabledPriceKeys) disabledKeys.delete(key)
  return disabledKeys
}

/**
 * Отключает «соседей» в conflict group.
 * Object-level: не трогает manual и zoned clones.
 */
export function disableElectricConflictingAlternatives(
  lines: readonly EstimateLine[],
  enabledPriceKeys: readonly string[],
): EstimateLine[] {
  return disableConflictingKeysInScope(lines, collectElectricDisabledKeys(enabledPriceKeys), {
    zoneId: null,
  })
}

/**
 * Conflict groups электрики только внутри зоны.
 */
export function disableElectricConflictingAlternativesInZone(
  lines: readonly EstimateLine[],
  enabledPriceKeys: readonly string[],
  zoneId: string,
): EstimateLine[] {
  return disableConflictingKeysInScope(lines, collectElectricDisabledKeys(enabledPriceKeys), {
    zoneId,
  })
}
