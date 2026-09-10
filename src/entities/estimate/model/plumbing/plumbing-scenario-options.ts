import type { EstimateZoneType } from '../shared/estimate-zone'
import {
  partitionScenariosByZoneType,
  scenarioMatchesZoneType,
  type ScenarioWithZoneTypes,
} from '../shared/estimate-zone-scenario-filter'
import type { PlumbingStateOption } from './apply-plumbing-scenario'

export type PlumbingScenarioOptionMeta = ScenarioWithZoneTypes<PlumbingStateOption> & {
  label: string
}

/**
 * Метаданные сценариев сантехники для soft-фильтра / apply-guard по типу зоны.
 *
 * Правила применимости:
 * - общие работы (`null`) и тип `other` — все сценарии;
 * - санузловые → bathroom; кухня → kitchen; остальные — all.
 */
export const PLUMBING_SCENARIO_OPTIONS: readonly PlumbingScenarioOptionMeta[] = [
  {
    id: 'bathroom-from-scratch',
    label: 'Сантехника санузла с нуля',
    recommendedZoneTypes: ['bathroom'],
  },
  {
    id: 'bathroom-replacement',
    label: 'Замена сантехники в санузле',
    recommendedZoneTypes: ['bathroom'],
  },
  {
    id: 'kitchen',
    label: 'Кухня',
    recommendedZoneTypes: ['kitchen'],
  },
  {
    id: 'bath-zone',
    label: 'Ванная',
    recommendedZoneTypes: ['bathroom'],
  },
  {
    id: 'toilet-zone',
    label: 'Туалет',
    recommendedZoneTypes: ['bathroom'],
  },
  {
    id: 'manifold',
    label: 'Коллекторный узел',
    recommendedZoneTypes: 'all',
  },
  {
    id: 'drainage-only',
    label: 'Канализация',
    recommendedZoneTypes: 'all',
  },
  {
    id: 'water-supply-only',
    label: 'Водоснабжение',
    recommendedZoneTypes: 'all',
  },
  {
    id: 'fixtures-only',
    label: 'Подключение приборов',
    recommendedZoneTypes: 'all',
  },
  {
    id: 'demolition-only',
    label: 'Только демонтаж',
    recommendedZoneTypes: 'all',
  },
] as const

export function getPlumbingScenarioRecommendedZoneTypes(
  state: PlumbingStateOption,
): ScenarioWithZoneTypes<PlumbingStateOption>['recommendedZoneTypes'] {
  return (
    PLUMBING_SCENARIO_OPTIONS.find((option) => option.id === state)?.recommendedZoneTypes ?? 'all'
  )
}

export function getPlumbingScenarioOptionLabel(state: PlumbingStateOption): string {
  return PLUMBING_SCENARIO_OPTIONS.find((option) => option.id === state)?.label ?? state
}

/** Можно ли применять сценарий к target (null = общие работы). Soft-правило. */
export function isPlumbingScenarioAllowedForZone(
  state: PlumbingStateOption,
  zoneType: EstimateZoneType | null,
): boolean {
  return scenarioMatchesZoneType(getPlumbingScenarioRecommendedZoneTypes(state), zoneType)
}

export function formatPlumbingScenarioZoneMismatchMessage(state: PlumbingStateOption): string {
  const label = getPlumbingScenarioOptionLabel(state)
  if (state === 'kitchen') {
    return `Сценарий «${label}» подходит для кухни. Измените тип зоны или выберите другой сценарий.`
  }
  if (
    state === 'bathroom-from-scratch' ||
    state === 'bathroom-replacement' ||
    state === 'bath-zone' ||
    state === 'toilet-zone'
  ) {
    return `Сценарий «${label}» подходит для санузла. Измените тип зоны или выберите другой сценарий.`
  }
  return `Сценарий «${label}» не подходит для выбранного типа зоны. Измените тип зоны или выберите другой сценарий.`
}

/**
 * Делит сценарии на подходящие и прочие.
 * Обычный UI показывает только `primary`; `other` остаётся для API/edge cases.
 */
export function resolvePlumbingScenarioOptionsForZone(
  zoneType: EstimateZoneType | null,
  _showAll = false,
): {
  primary: readonly PlumbingScenarioOptionMeta[]
  other: readonly PlumbingScenarioOptionMeta[]
} {
  const result = partitionScenariosByZoneType(PLUMBING_SCENARIO_OPTIONS, zoneType, false)
  return { primary: result.primary, other: result.other }
}
