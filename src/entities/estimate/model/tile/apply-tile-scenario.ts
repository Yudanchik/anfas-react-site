import { isZonedEstimateLine } from '../shared/estimate-zoned-line'
import type { EstimateLine, TileEstimateInput, TileQuantityField } from '../shared/estimate.types'
import type { EstimateZone } from '../shared/estimate-zone'
import {
  resolveTileCladArea,
  resolveTileDefaultQuantity,
  resolveTileFloorWallCladArea,
} from './build-tile-estimate-lines'
import { createZonedTileEstimateLine } from './create-zoned-tile-estimate-line'
import {
  disableTileConflictingAlternatives,
  disableTileConflictingAlternativesInZone,
} from './tile-conflict-groups'
import { TILE_PRICE_MAPPING } from './tile-price.mapping'

/**
 * Compact scenario: состояние плитки × формат × затирка.
 * Сценарий = быстрый черновик сметы, не финальная истина.
 */
export type TileStateOption =
  | 'bathroom-from-scratch'
  | 'bathroom-replacement'
  | 'floor-only'
  | 'walls-only'
  | 'kitchen-backsplash'
  | 'large-format'
  | 'demolition-only'
  | 'grout-repair-only'

export type TileCladFormatOption =
  '301-1300' | '1301-1700' | '1701-3600' | 'over-3600' | 'mosaic' | 'small-format'

export type TileGroutOption = 'none' | 'cement' | 'epoxy'

export type TileDemolitionSurfacesOption = 'floor' | 'walls' | 'both'

export type TileScenarioApplication = {
  state: TileStateOption
  cladFormat?: TileCladFormatOption
  grout?: TileGroutOption
  demolitionSurfaces?: TileDemolitionSurfacesOption
}

export type ApplyTileScenarioResult = {
  lines: EstimateLine[]
  addedCount: number
  scenarioLabel: string
  enabledPriceKeys: readonly string[]
}

const CLAD_FORMAT_KEYS: Record<TileCladFormatOption, string> = {
  '301-1300': 'clad-301-1300',
  '1301-1700': 'clad-1301-1700',
  '1701-3600': 'clad-1701-3600',
  'over-3600': 'clad-over-3600',
  mosaic: 'clad-mosaic',
  'small-format': 'clad-small-format',
}

const STATE_LABELS: Record<TileStateOption, string> = {
  'bathroom-from-scratch': 'Санузел с нуля',
  'bathroom-replacement': 'Замена плитки в санузле (демонтаж)',
  'floor-only': 'Плитка на пол',
  'walls-only': 'Плитка на стены',
  'kitchen-backsplash': 'Кухонный фартук',
  'large-format': 'Крупный формат',
  'demolition-only': 'Только демонтаж плитки',
  'grout-repair-only': 'Только затирка / ремонт',
}

const FORMAT_LABELS: Record<TileCladFormatOption, string> = {
  '301-1300': '301–1300',
  '1301-1700': '1301–1700',
  '1701-3600': '1701–3600',
  'over-3600': '>3600',
  mosaic: 'мозаика',
  'small-format': 'мелкоштучка',
}

const GROUT_LABELS: Record<TileGroutOption, string> = {
  none: 'без затирки',
  cement: 'цементная затирка',
  epoxy: 'эпоксидная затирка',
}

const BATHROOM_PREP = ['prep-dust', 'prep-primer', 'prep-layout'] as const

const MAPPING_BY_ID = new Map(TILE_PRICE_MAPPING.map((item) => [item.id, item]))

/**
 * Применяет сценарий плитки: включает набор ключей, подставляет объёмы, гасит конфликты.
 * Быстрый черновик, не финальная истина. Ручные и несвязанные включённые строки
 * вне conflict groups не затирает. Гидроизоляцию не включает.
 */
export function applyTileScenario(
  lines: readonly EstimateLine[],
  input: TileEstimateInput,
  application: TileScenarioApplication,
): ApplyTileScenarioResult {
  const keys = resolveTileScenarioKeys(application)
  const next = enableTileScenarioKeys(lines, keys, input, application)

  return {
    lines: next,
    addedCount: keys.length,
    scenarioLabel: formatTileScenarioLabel(application),
    enabledPriceKeys: keys,
  }
}

/**
 * Сценарий плитки для зоны: upsert zoned clones с `zoneId`, qty из полей зоны.
 * Canonical и другие зоны не трогает; conflicts только внутри зоны.
 */
export function applyTileScenarioToZone(
  lines: readonly EstimateLine[],
  zone: EstimateZone,
  application: TileScenarioApplication,
): ApplyTileScenarioResult {
  const input = tileInputFromZone(zone)
  const keys = resolveTileScenarioKeys(application)
  let next = disableTileConflictingAlternativesInZone(lines, keys, zone.id)

  for (const priceKey of keys) {
    const mappingItem = MAPPING_BY_ID.get(priceKey)
    const field = mappingItem?.defaultQuantityFrom ?? 'manual'
    const qty = resolveScenarioQuantity(field, input, application, priceKey)

    const existingIndex = next.findIndex(
      (line) =>
        isZonedEstimateLine(line) &&
        line.zoneId === zone.id &&
        line.priceKey === priceKey &&
        line.source !== 'manual',
    )

    if (existingIndex >= 0) {
      const existing = next[existingIndex]
      next = next.map((line, index) =>
        index === existingIndex
          ? {
              ...existing,
              enabled: true,
              quantity: qty > 0 ? qty : existing.quantity,
              zoneName: zone.name,
              zoneId: zone.id,
            }
          : line,
      )
      continue
    }

    const created = createZonedTileEstimateLine({
      priceKey,
      quantity: qty,
      zoneName: zone.name,
      zoneId: zone.id,
    })
    if (created) next = [...next, created]
  }

  return {
    lines: next,
    addedCount: keys.length,
    scenarioLabel: formatTileScenarioLabel(application),
    enabledPriceKeys: keys,
  }
}

export function resolveTileScenarioKeys(application: TileScenarioApplication): readonly string[] {
  const { state } = application
  const cladFormat = application.cladFormat ?? defaultCladFormat(state)
  const grout = application.grout ?? 'cement'
  const surfaces = application.demolitionSurfaces ?? 'both'
  const keys: string[] = []

  switch (state) {
    case 'bathroom-from-scratch':
      keys.push(...BATHROOM_PREP)
      keys.push(CLAD_FORMAT_KEYS[cladFormat])
      keys.push(...groutKeys(grout))
      break
    case 'bathroom-replacement':
      keys.push('demolition-floor-tile', 'demolition-wall-tile')
      keys.push(...BATHROOM_PREP)
      keys.push(CLAD_FORMAT_KEYS[cladFormat])
      keys.push(...groutKeys(grout))
      break
    case 'floor-only':
      keys.push('prep-layout', CLAD_FORMAT_KEYS[cladFormat])
      keys.push(...groutKeys(grout))
      break
    case 'walls-only':
      keys.push('prep-layout', CLAD_FORMAT_KEYS[cladFormat])
      keys.push(...groutKeys(grout))
      break
    case 'kitchen-backsplash':
      keys.push('prep-layout', CLAD_FORMAT_KEYS[cladFormat])
      keys.push(...groutKeys(grout))
      break
    case 'large-format':
      keys.push('prep-layout', CLAD_FORMAT_KEYS[cladFormat])
      keys.push('cut-edge-large-small', 'hole-up-to-100')
      keys.push(...groutKeys(grout))
      break
    case 'demolition-only':
      if (surfaces === 'floor' || surfaces === 'both') keys.push('demolition-floor-tile')
      if (surfaces === 'walls' || surfaces === 'both') keys.push('demolition-wall-tile')
      break
    case 'grout-repair-only':
      if (grout === 'cement') keys.push('grout-cement', 'grout-clean-cement')
      else if (grout === 'epoxy') keys.push('grout-epoxy', 'grout-clean-epoxy')
      else keys.push('repair-one-tile')
      break
  }

  return [...new Set(keys)]
}

export function formatTileScenarioLabel(application: TileScenarioApplication): string {
  const { state } = application
  const cladFormat = application.cladFormat ?? defaultCladFormat(state)
  const grout = application.grout ?? 'cement'
  const surfaces = application.demolitionSurfaces ?? 'both'

  if (state === 'demolition-only') {
    const surfaceLabel =
      surfaces === 'floor' ? 'пол' : surfaces === 'walls' ? 'стены' : 'пол и стены'
    return `Только демонтаж плитки (${surfaceLabel})`
  }

  if (state === 'bathroom-replacement') {
    return `Замена плитки в санузле (демонтаж), ${FORMAT_LABELS[cladFormat]}, ${GROUT_LABELS[grout]}`
  }

  if (state === 'grout-repair-only') {
    if (grout === 'none') return 'Только ремонт: замена одной плитки'
    return `Только затирка (${GROUT_LABELS[grout]})`
  }

  if (state === 'kitchen-backsplash') {
    return `${STATE_LABELS[state]}, ${FORMAT_LABELS[cladFormat]}, ${GROUT_LABELS[grout]}`
  }

  if (state === 'large-format') {
    return `${STATE_LABELS[state]}, ${FORMAT_LABELS[cladFormat]}, ${GROUT_LABELS[grout]}`
  }

  if (grout === 'none') {
    return `${STATE_LABELS[state]}, ${FORMAT_LABELS[cladFormat]} (${GROUT_LABELS.none})`
  }

  return `${STATE_LABELS[state]}, ${FORMAT_LABELS[cladFormat]}, ${GROUT_LABELS[grout]}`
}

export function formatTileScenarioFeedback(label: string, addedCount: number): string {
  return `Выбран сценарий «${label}», добавлено ${addedCount} строк`
}

export function formatTileScenarioZoneFeedback(
  label: string,
  zoneName: string,
  addedCount: number,
): string {
  return `Сценарий «${label}» применён к зоне «${zoneName}», строк: ${addedCount}`
}

function tileInputFromZone(zone: EstimateZone): TileEstimateInput {
  return {
    floorTileArea: zone.tileFloorArea,
    wallTileArea: zone.tileWallArea,
    backsplashArea: zone.tileBacksplashArea,
    cuttingLength: zone.tileCuttingLength,
    cornerLength: zone.tileCornerLength,
    holesCount: zone.tileHolesCount,
    repairCount: zone.tileRepairCount,
    surveyorComment: '',
  }
}

function defaultCladFormat(state: TileStateOption): TileCladFormatOption {
  return state === 'large-format' ? '1701-3600' : '301-1300'
}

function groutKeys(grout: TileGroutOption): string[] {
  if (grout === 'cement') return ['grout-cement', 'grout-clean-cement']
  if (grout === 'epoxy') return ['grout-epoxy', 'grout-clean-epoxy']
  return []
}

function enableTileScenarioKeys(
  lines: readonly EstimateLine[],
  keys: readonly string[],
  input: TileEstimateInput,
  application: TileScenarioApplication,
): EstimateLine[] {
  const keySet = new Set(keys)
  const withConflictsDisabled = disableTileConflictingAlternatives(lines, keys)

  return withConflictsDisabled.map((line) => {
    if (line.source === 'manual') return line
    if (isZonedEstimateLine(line)) return line
    if (!keySet.has(line.priceKey)) return line

    const mappingItem = MAPPING_BY_ID.get(line.priceKey)
    const field = mappingItem?.defaultQuantityFrom ?? 'manual'
    const qty = resolveScenarioQuantity(field, input, application, line.priceKey)

    return {
      ...line,
      enabled: true,
      quantity: qty > 0 ? qty : line.quantity,
    }
  })
}

function resolveScenarioQuantity(
  field: TileQuantityField,
  input: TileEstimateInput,
  application: TileScenarioApplication,
  priceKey: string,
): number {
  const { state } = application

  if (priceKey === 'demolition-floor-tile') {
    return resolveTileDefaultQuantity('floorTileArea', input)
  }
  if (priceKey === 'demolition-wall-tile') {
    return resolveTileDefaultQuantity('wallTileArea', input)
  }

  if (field === 'cladArea' || isCladOrPrepOrGroutKey(priceKey)) {
    switch (state) {
      case 'floor-only':
        return resolveTileDefaultQuantity('floorTileArea', input)
      case 'walls-only':
        return resolveTileDefaultQuantity('wallTileArea', input)
      case 'kitchen-backsplash':
        return resolveTileDefaultQuantity('backsplashArea', input)
      case 'bathroom-from-scratch':
      case 'bathroom-replacement':
        return resolveTileFloorWallCladArea(input)
      default:
        return resolveTileCladArea(input)
    }
  }

  return resolveTileDefaultQuantity(field, input)
}

function isCladOrPrepOrGroutKey(priceKey: string): boolean {
  return (
    priceKey.startsWith('clad-') ||
    priceKey.startsWith('prep-') ||
    priceKey.startsWith('grout-') ||
    priceKey.startsWith('surcharge-')
  )
}
