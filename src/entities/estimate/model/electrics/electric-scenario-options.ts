import type { EstimateZoneType } from '../shared/estimate-zone'
import {
  partitionScenariosByZoneType,
  scenarioMatchesZoneType,
  type ScenarioWithZoneTypes,
} from '../shared/estimate-zone-scenario-filter'
import type { ElectricStateOption } from './apply-electric-scenario'

export type ElectricScenarioOptionMeta = ScenarioWithZoneTypes<ElectricStateOption> & {
  label: string
}

/**
 * Метаданные сценариев электрики для soft-фильтра / apply-guard по типу зоны.
 *
 * Правила применимости:
 * - общие работы (`null`) и тип `other` — все сценарии;
 * - «Электрика кухни» → kitchen; «Электрика санузла» → bathroom;
 *   «Перекоммутация комнаты» → room/corridor; остальные — все.
 */
export const ELECTRIC_SCENARIO_OPTIONS: readonly ElectricScenarioOptionMeta[] = [
  {
    id: 'apartment-from-scratch',
    label: 'Электрика квартиры с нуля',
    recommendedZoneTypes: 'all',
  },
  {
    id: 'room-rewire',
    label: 'Перекоммутация комнаты',
    recommendedZoneTypes: ['room', 'corridor'],
  },
  {
    id: 'kitchen',
    label: 'Электрика кухни',
    recommendedZoneTypes: ['kitchen'],
  },
  {
    id: 'bathroom',
    label: 'Электрика санузла',
    recommendedZoneTypes: ['bathroom'],
  },
  {
    id: 'lighting-only',
    label: 'Только освещение',
    recommendedZoneTypes: 'all',
  },
  {
    id: 'outlets-switches',
    label: 'Розетки и выключатели',
    recommendedZoneTypes: 'all',
  },
  {
    id: 'low-current',
    label: 'Слаботочные сети',
    recommendedZoneTypes: 'all',
  },
  {
    id: 'panel-only',
    label: 'Только электрощит',
    recommendedZoneTypes: 'all',
  },
  {
    id: 'demolition-only',
    label: 'Только демонтаж электрики',
    recommendedZoneTypes: 'all',
  },
] as const

export function getElectricScenarioRecommendedZoneTypes(
  state: ElectricStateOption,
): ScenarioWithZoneTypes<ElectricStateOption>['recommendedZoneTypes'] {
  return (
    ELECTRIC_SCENARIO_OPTIONS.find((option) => option.id === state)?.recommendedZoneTypes ?? 'all'
  )
}

export function getElectricScenarioOptionLabel(state: ElectricStateOption): string {
  return ELECTRIC_SCENARIO_OPTIONS.find((option) => option.id === state)?.label ?? state
}

/** Можно ли применять сценарий к target (null = общие работы). Soft-правило. */
export function isElectricScenarioAllowedForZone(
  state: ElectricStateOption,
  zoneType: EstimateZoneType | null,
): boolean {
  return scenarioMatchesZoneType(getElectricScenarioRecommendedZoneTypes(state), zoneType)
}

export function formatElectricScenarioZoneMismatchMessage(state: ElectricStateOption): string {
  const label = getElectricScenarioOptionLabel(state)
  if (state === 'kitchen') {
    return `Сценарий «${label}» подходит для кухни. Измените тип зоны или выберите другой сценарий.`
  }
  if (state === 'bathroom') {
    return `Сценарий «${label}» подходит для санузла. Измените тип зоны или выберите другой сценарий.`
  }
  if (state === 'room-rewire') {
    return `Сценарий «${label}» подходит для комнаты или коридора. Измените тип зоны или выберите другой сценарий.`
  }
  return `Сценарий «${label}» не подходит для выбранного типа зоны. Измените тип зоны или выберите другой сценарий.`
}

/**
 * Делит сценарии на подходящие и прочие.
 * Обычный UI показывает только `primary`; `other` остаётся для API/edge cases.
 */
export function resolveElectricScenarioOptionsForZone(
  zoneType: EstimateZoneType | null,
  _showAll = false,
): {
  primary: readonly ElectricScenarioOptionMeta[]
  other: readonly ElectricScenarioOptionMeta[]
} {
  const result = partitionScenariosByZoneType(ELECTRIC_SCENARIO_OPTIONS, zoneType, false)
  return { primary: result.primary, other: result.other }
}
