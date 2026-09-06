import type { EstimateZoneType } from '../shared/estimate-zone'
import {
  partitionScenariosByZoneType,
  type ScenarioWithZoneTypes,
} from '../shared/estimate-zone-scenario-filter'
import type { TileStateOption } from './apply-tile-scenario'

export type TileScenarioOptionMeta = ScenarioWithZoneTypes<TileStateOption> & {
  label: string
}

/**
 * Метаданные сценариев плитки для soft-фильтра по типу зоны.
 * `recommendedZoneTypes: 'all'` — уместны для любой зоны.
 */
export const TILE_SCENARIO_OPTIONS: readonly TileScenarioOptionMeta[] = [
  {
    id: 'bathroom-from-scratch',
    label: 'Санузел с нуля',
    recommendedZoneTypes: ['bathroom'],
  },
  {
    id: 'bathroom-replacement',
    label: 'Замена плитки в санузле (демонтаж плитки)',
    recommendedZoneTypes: ['bathroom'],
  },
  {
    id: 'floor-only',
    label: 'Плитка на пол',
    recommendedZoneTypes: 'all',
  },
  {
    id: 'walls-only',
    label: 'Плитка на стены',
    recommendedZoneTypes: ['bathroom', 'kitchen', 'other'],
  },
  {
    id: 'kitchen-backsplash',
    label: 'Кухонный фартук',
    recommendedZoneTypes: ['kitchen'],
  },
  {
    id: 'large-format',
    label: 'Крупный формат',
    recommendedZoneTypes: 'all',
  },
  {
    id: 'demolition-only',
    label: 'Только демонтаж плитки',
    recommendedZoneTypes: 'all',
  },
  {
    id: 'grout-repair-only',
    label: 'Только затирка / ремонт',
    recommendedZoneTypes: 'all',
  },
] as const

export function getTileScenarioRecommendedZoneTypes(
  state: TileStateOption,
): ScenarioWithZoneTypes<TileStateOption>['recommendedZoneTypes'] {
  return (
    TILE_SCENARIO_OPTIONS.find((option) => option.id === state)?.recommendedZoneTypes ?? 'all'
  )
}

export function resolveTileScenarioOptionsForZone(
  zoneType: EstimateZoneType | null,
  showAll: boolean,
): {
  primary: readonly TileScenarioOptionMeta[]
  other: readonly TileScenarioOptionMeta[]
} {
  const result = partitionScenariosByZoneType(TILE_SCENARIO_OPTIONS, zoneType, showAll)
  return { primary: result.primary, other: result.other }
}
