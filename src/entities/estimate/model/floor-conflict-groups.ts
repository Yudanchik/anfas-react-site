import type { EstimateLine } from './estimate.types'

/**
 * Mutually exclusive alternatives within a floor estimate.
 * Enabling one key via a preset disables other keys in the same group.
 * Manual rows (`source=manual`) are never touched.
 */
export const FLOOR_CONFLICT_GROUPS: Readonly<Record<string, readonly string[]>> = {
  'demolition-covering': [
    'demolition-laminate',
    'demolition-floating-laminate-engineered',
    'demolition-linoleum',
    'demolition-parquet-board',
    'demolition-glued-parquet',
    'demolition-wooden-floors',
    'demolition-rough-boards',
    'demolition-floor-tile',
  ],
  'demolition-screed': ['demolition-screed-up-to-70', 'demolition-screed-over-70'],
  'screed-main': [
    'semidry-screed-up-to-80',
    'semidry-screed-over-80',
    'wet-screed-up-to-50',
    'wet-screed-50-to-80',
    'wet-screed-over-80',
    'wet-screed-local-small',
  ],
  'waterproofing-acrylic-layers': ['waterproofing-acrylic-1', 'waterproofing-acrylic-2'],
  'self-leveling-device': ['self-leveling-device', 'self-leveling-local-small'],
  'waste-trip': [
    'waste-gazelle-6',
    'waste-gazelle-12',
    'waste-gazelle-16',
    'waste-puhto-20',
    'waste-puhto-27',
  ],
}

const PRICE_KEY_TO_CONFLICT_GROUP = buildPriceKeyIndex(FLOOR_CONFLICT_GROUPS)

function buildPriceKeyIndex(
  groups: Readonly<Record<string, readonly string[]>>,
): ReadonlyMap<string, string> {
  const index = new Map<string, string>()
  for (const [groupId, keys] of Object.entries(groups)) {
    for (const key of keys) index.set(key, groupId)
  }
  return index
}

export function getFloorConflictGroupId(priceKey: string): string | undefined {
  return PRICE_KEY_TO_CONFLICT_GROUP.get(priceKey)
}

/**
 * Disables siblings in the same conflict group for each enabled key.
 * Does not disable the enabled keys themselves or manual rows.
 */
export function disableConflictingAlternatives(
  lines: readonly EstimateLine[],
  enabledPriceKeys: readonly string[],
): EstimateLine[] {
  const disabledKeys = new Set<string>()

  for (const priceKey of enabledPriceKeys) {
    const groupId = PRICE_KEY_TO_CONFLICT_GROUP.get(priceKey)
    if (!groupId) continue
    const groupKeys = FLOOR_CONFLICT_GROUPS[groupId] ?? []
    for (const key of groupKeys) {
      if (key !== priceKey) disabledKeys.add(key)
    }
  }

  if (disabledKeys.size === 0) return [...lines]

  return lines.map((line) => {
    if (line.source === 'manual') return line
    if (!disabledKeys.has(line.priceKey)) return line
    if (!line.enabled) return line
    return { ...line, enabled: false }
  })
}
