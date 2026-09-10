import type { EstimateZoneType } from '../shared/estimate-zone'

/**
 * Soft filter сценариев по типу зоны.
 * Не блокирует сметчика: неподходящие остаются в «Другие сценарии» / при showAll.
 */

export type ScenarioZoneScope = 'all' | readonly EstimateZoneType[]

export type ScenarioWithZoneTypes<TId extends string = string> = {
  id: TId
  recommendedZoneTypes: ScenarioZoneScope
}

export type PartitionScenariosByZoneResult<T> = {
  primary: readonly T[]
  other: readonly T[]
  showAllEffective: boolean
}

export function scenarioMatchesZoneType(
  recommended: ScenarioZoneScope,
  zoneType: EstimateZoneType | null,
): boolean {
  // Общие работы и тип «Другое» — все сценарии доступны
  if (zoneType === null || zoneType === 'other') return true
  if (recommended === 'all') return true
  return recommended.includes(zoneType)
}

/**
 * Делит сценарии на подходящие и «другие».
 * `zoneType: null` — общие работы (все в primary).
 * `showAll` оставлен для совместимости API; несовместимые всегда остаются в `other`.
 */
export function partitionScenariosByZoneType<T extends ScenarioWithZoneTypes>(
  scenarios: readonly T[],
  zoneType: EstimateZoneType | null,
  showAll = false,
): PartitionScenariosByZoneResult<T> {
  if (zoneType === null || zoneType === 'other') {
    return { primary: scenarios, other: [], showAllEffective: true }
  }

  const primary: T[] = []
  const other: T[] = []
  for (const scenario of scenarios) {
    if (scenarioMatchesZoneType(scenario.recommendedZoneTypes, zoneType)) {
      primary.push(scenario)
    } else {
      other.push(scenario)
    }
  }

  return { primary, other, showAllEffective: showAll }
}
