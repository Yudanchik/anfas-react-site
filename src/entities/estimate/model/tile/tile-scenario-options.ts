import type { EstimateZoneType } from '../shared/estimate-zone'
import {
  partitionScenariosByZoneType,
  scenarioMatchesZoneType,
  type ScenarioWithZoneTypes,
} from '../shared/estimate-zone-scenario-filter'
import type { TileStateOption } from './apply-tile-scenario'

export type TileScenarioOptionMeta = ScenarioWithZoneTypes<TileStateOption> & {
  label: string
}

/**
 * Метаданные сценариев плитки для soft-фильтра / apply-guard по типу зоны.
 *
 * Правила применимости:
 * - общие работы (`null`) и тип `other` — все сценарии;
 * - иначе — `all` или список, содержащий тип зоны.
 * «Кухонный фартук» → kitchen (+ general/other); не для bathroom/room/corridor.
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
    recommendedZoneTypes: 'all',
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

export function getTileScenarioOptionLabel(state: TileStateOption): string {
  return TILE_SCENARIO_OPTIONS.find((option) => option.id === state)?.label ?? state
}

/** Можно ли применять сценарий к target (null = общие работы). */
export function isTileScenarioAllowedForZone(
  state: TileStateOption,
  zoneType: EstimateZoneType | null,
): boolean {
  return scenarioMatchesZoneType(getTileScenarioRecommendedZoneTypes(state), zoneType)
}

export function formatTileScenarioZoneMismatchMessage(state: TileStateOption): string {
  const label = getTileScenarioOptionLabel(state)
  if (state === 'kitchen-backsplash') {
    return `Сценарий «${label}» подходит для кухни. Измените тип зоны или выберите другой сценарий.`
  }
  if (state === 'bathroom-from-scratch' || state === 'bathroom-replacement') {
    return `Сценарий «${label}» подходит для санузла. Измените тип зоны или выберите другой сценарий.`
  }
  return `Сценарий «${label}» не подходит для выбранного типа зоны. Измените тип зоны или выберите другой сценарий.`
}

/**
 * Делит сценарии на подходящие и прочие.
 * `showAll` не переносит incompatible в primary — UI показывает `other` как справочные
 * (не выбираемые); apply-guard блокирует применение.
 */
export function resolveTileScenarioOptionsForZone(
  zoneType: EstimateZoneType | null,
  _showAll = false,
): {
  primary: readonly TileScenarioOptionMeta[]
  other: readonly TileScenarioOptionMeta[]
} {
  const result = partitionScenariosByZoneType(TILE_SCENARIO_OPTIONS, zoneType, false)
  return { primary: result.primary, other: result.other }
}
