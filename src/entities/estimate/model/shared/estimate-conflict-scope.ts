import type { EstimateLine } from './estimate.types'
import { isZonedEstimateLine } from './estimate-zoned-line'

/**
 * Отключает конфликтные ключи только среди строк выбранного scope.
 * `zoneId: null` — только общие (canonical / без zoneId);
 * `zoneId: string` — только clones этой зоны.
 * Manual не трогает.
 */
export function disableConflictingKeysInScope(
  lines: readonly EstimateLine[],
  disabledKeys: ReadonlySet<string>,
  scope: { zoneId: string | null },
): EstimateLine[] {
  if (disabledKeys.size === 0) return [...lines]

  return lines.map((line) => {
    if (line.source === 'manual') return line
    if (!disabledKeys.has(line.priceKey)) return line
    if (!line.enabled) return line

    const lineZoneId = line.zoneId ?? null
    if (scope.zoneId === null) {
      // Object-level: only canonical (non-zoned) rows
      if (isZonedEstimateLine(line) || lineZoneId) return line
    } else if (lineZoneId !== scope.zoneId) {
      return line
    }

    return { ...line, enabled: false }
  })
}

export function collectConflictDisabledKeys(
  enabledPriceKeys: readonly string[],
  groups: Readonly<Record<string, readonly string[]>>,
  priceKeyToGroup: ReadonlyMap<string, string>,
): Set<string> {
  const disabledKeys = new Set<string>()
  for (const priceKey of enabledPriceKeys) {
    const groupId = priceKeyToGroup.get(priceKey)
    if (!groupId) continue
    const groupKeys = groups[groupId] ?? []
    for (const key of groupKeys) {
      if (key !== priceKey) disabledKeys.add(key)
    }
  }
  return disabledKeys
}
