import { isZonedEstimateLine } from '../shared/estimate-zoned-line'
import type { EstimateLine, WallEstimateInput, WallQuantityField, WallWorkKind } from '../shared/estimate.types'
import type { EstimateZone } from '../shared/estimate-zone'
import {
  resolveFinishQuantity,
  resolvePlasterQuantity,
  resolvePuttyQuantity,
  resolveWallDefaultQuantity,
} from './build-wall-estimate-lines'
import { createZonedWallEstimateLine } from './create-zoned-wall-estimate-line'
import {
  disableWallConflictingAlternatives,
  disableWallConflictingAlternativesInZone,
} from './wall-conflict-groups'
import { WALL_PRICE_MAPPING } from './wall-price.mapping'

/**
 * Compact scenario: состояние стен × целевой результат.
 * Сценарий = быстрый черновик сметы, не финальная истина.
 */
export type WallStateOption =
  | 'from-scratch'
  | 'after-demolition'
  | 'prefinish'
  | 'demolition-only'
  | 'local-leveling'
  | 'finish-only'

export type WallFinishTargetOption = 'none' | 'wallpaper' | 'paint'

export type WallDemolitionCoveringOption =
  | 'wallpaper'
  | 'paint'
  | 'plaster'
  | 'wall-tile'
  | 'glassfiber'

export type WallWallpaperTypeOption = 'flizelin' | 'vinyl-match' | 'photo' | 'textile-match'

export type WallPaintLayersOption = 'paint-1' | 'paint-2' | 'paint-3' | 'paint-mech-2'

export type WallScenarioApplication = {
  state: WallStateOption
  finishTarget: WallFinishTargetOption
  demolitionCovering?: WallDemolitionCoveringOption
  wallpaperType?: WallWallpaperTypeOption
  paintLayers?: WallPaintLayersOption
}

export type ApplyWallScenarioResult = {
  lines: EstimateLine[]
  addedCount: number
  scenarioLabel: string
  enabledPriceKeys: readonly string[]
}

const DEMOLITION_KEYS: Record<WallDemolitionCoveringOption, string> = {
  wallpaper: 'demolition-wallpaper',
  paint: 'demolition-paint',
  plaster: 'demolition-plaster',
  'wall-tile': 'demolition-wall-tile',
  glassfiber: 'demolition-glassfiber',
}

const WALLPAPER_KEYS: Record<WallWallpaperTypeOption, string> = {
  flizelin: 'wallpaper-flizelin',
  'vinyl-match': 'wallpaper-vinyl-match',
  photo: 'wallpaper-photo',
  'textile-match': 'wallpaper-textile-match',
}

const PAINT_KEYS: Record<WallPaintLayersOption, string> = {
  'paint-1': 'paint-1',
  'paint-2': 'paint-2',
  'paint-3': 'paint-3',
  'paint-mech-2': 'paint-mech-2',
}

const STATE_LABELS: Record<WallStateOption, string> = {
  'from-scratch': 'Стены с нуля',
  'after-demolition': 'После демонтажа',
  prefinish: 'Предчистовая',
  'demolition-only': 'Только демонтаж',
  'local-leveling': 'Локальное выравнивание',
  'finish-only': 'Только финиш',
}

const FINISH_LABELS: Record<WallFinishTargetOption, string> = {
  none: 'без финиша',
  wallpaper: 'под обои',
  paint: 'под покраску',
}

const MAPPING_BY_ID = new Map(WALL_PRICE_MAPPING.map((item) => [item.id, item]))

/**
 * Применяет сценарий стен: включает набор ключей, подставляет объёмы, гасит конфликты.
 * Быстрый черновик, не финальная истина. Ручные и несвязанные включённые строки
 * вне conflict groups не затирает. Сам по полям площади не запускается.
 */
export function applyWallScenario(
  lines: readonly EstimateLine[],
  input: WallEstimateInput,
  application: WallScenarioApplication,
): ApplyWallScenarioResult {
  const keys = resolveWallScenarioKeys(application)
  const next = enableWallScenarioKeys(lines, keys, input)

  return {
    lines: next,
    addedCount: keys.length,
    scenarioLabel: formatWallScenarioLabel(application),
    enabledPriceKeys: keys,
  }
}

/**
 * Сценарий стен для зоны: upsert zoned clones с `zoneId`, qty из полей зоны.
 * Canonical и другие зоны не трогает; conflicts только внутри зоны.
 */
export function applyWallScenarioToZone(
  lines: readonly EstimateLine[],
  zone: EstimateZone,
  application: WallScenarioApplication,
): ApplyWallScenarioResult {
  const input = wallInputFromZone(zone)
  const keys = resolveWallScenarioKeys(application)
  let next = disableWallConflictingAlternativesInZone(lines, keys, zone.id)

  for (const priceKey of keys) {
    const mappingItem = MAPPING_BY_ID.get(priceKey)
    const field = resolveScenarioQuantityField(mappingItem?.kind, mappingItem?.defaultQuantityFrom)
    const qty = resolveScenarioQuantity(field, input)

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

    const created = createZonedWallEstimateLine({
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
    scenarioLabel: formatWallScenarioLabel(application),
    enabledPriceKeys: keys,
  }
}

export function resolveWallScenarioKeys(
  application: WallScenarioApplication,
): readonly string[] {
  const { state, finishTarget } = application
  const keys: string[] = []

  switch (state) {
    case 'demolition-only':
      keys.push(DEMOLITION_KEYS[application.demolitionCovering ?? 'wallpaper'])
      break
    case 'local-leveling':
      keys.push('plaster-local-fix', 'putty-local-3mm')
      break
    case 'finish-only':
      // Только финиш — без цепочки подготовки
      break
    case 'from-scratch':
      keys.push(
        'primer-deep-penetration',
        'plaster-gypsum-beacons',
        'plaster-gypsum-main',
        'putty-base-2',
        'putty-sanding',
      )
      break
    case 'after-demolition':
      keys.push(
        'prep-dust-removal',
        'primer-deep-penetration',
        'plaster-gypsum-beacons',
        'plaster-gypsum-main',
        'putty-base-2',
        'putty-sanding',
      )
      break
    case 'prefinish':
      keys.push('prep-dust-removal', 'primer-one-layer', 'putty-base-2', 'putty-sanding')
      if (finishTarget === 'wallpaper') {
        keys.push('prep-sand-plaster')
      }
      if (finishTarget === 'paint') {
        keys.push('putty-finish-1', 'reinforce-glassfiber', 'putty-finish-sanding')
      }
      break
  }

  if (finishTarget === 'wallpaper' && state !== 'demolition-only' && state !== 'local-leveling') {
    keys.push(WALLPAPER_KEYS[application.wallpaperType ?? 'flizelin'])
  }

  if (finishTarget === 'paint' && state !== 'demolition-only' && state !== 'local-leveling') {
    if (state === 'from-scratch' || state === 'after-demolition') {
      keys.push('putty-finish-1', 'reinforce-glassfiber', 'putty-finish-sanding')
    }
    keys.push(PAINT_KEYS[application.paintLayers ?? 'paint-2'])
  }

  // Без дублей, порядок включения сохраняем
  return [...new Set(keys)]
}

export function formatWallScenarioLabel(application: WallScenarioApplication): string {
  const { state, finishTarget } = application
  if (state === 'demolition-only') return STATE_LABELS[state]
  if (state === 'local-leveling') return STATE_LABELS[state]
  if (state === 'finish-only') {
    if (finishTarget === 'wallpaper') return 'Только финиш: обои'
    if (finishTarget === 'paint') return 'Только финиш: покраска'
    return STATE_LABELS[state]
  }
  if (finishTarget === 'none') return `${STATE_LABELS[state]} (${FINISH_LABELS.none})`
  return `${STATE_LABELS[state]} ${FINISH_LABELS[finishTarget]}`
}

export function formatWallScenarioFeedback(label: string, addedCount: number): string {
  return `Выбран сценарий «${label}», добавлено ${addedCount} строк`
}

export function formatWallScenarioZoneFeedback(
  label: string,
  zoneName: string,
  addedCount: number,
): string {
  return `Сценарий «${label}» применён к зоне «${zoneName}», строк: ${addedCount}`
}

function wallInputFromZone(zone: EstimateZone): WallEstimateInput {
  return {
    totalWallArea: zone.wallArea,
    demolitionArea: zone.demolitionWallArea,
    plasterArea: zone.plasterArea,
    puttyArea: zone.puttyArea,
    finishArea: zone.finishArea,
    wallHeightM: 0,
    slopesLengthM: zone.slopesLength,
    cornersLengthM: zone.cornersLength,
    surveyorComment: '',
  }
}

function enableWallScenarioKeys(
  lines: readonly EstimateLine[],
  keys: readonly string[],
  input: WallEstimateInput,
): EstimateLine[] {
  const keySet = new Set(keys)
  const withConflictsDisabled = disableWallConflictingAlternatives(lines, keys)

  return withConflictsDisabled.map((line) => {
    if (line.source === 'manual') return line
    if (isZonedEstimateLine(line)) return line
    if (!keySet.has(line.priceKey)) return line

    const mappingItem = MAPPING_BY_ID.get(line.priceKey)
    const field = resolveScenarioQuantityField(mappingItem?.kind, mappingItem?.defaultQuantityFrom)
    const qty = resolveScenarioQuantity(field, input)

    return {
      ...line,
      enabled: true,
      quantity: qty > 0 ? qty : line.quantity,
    }
  })
}

function resolveScenarioQuantityField(
  kind: WallWorkKind | undefined,
  fallback: WallQuantityField | undefined,
): WallQuantityField {
  if (kind === 'finish-paint' || kind === 'finish-wallpaper') return 'finishArea'
  return fallback ?? 'manual'
}

function resolveScenarioQuantity(field: WallQuantityField, input: WallEstimateInput): number {
  switch (field) {
    case 'plasterArea':
      return resolvePlasterQuantity(input)
    case 'puttyArea':
      return resolvePuttyQuantity(input)
    case 'finishArea':
      return resolveFinishQuantity(input)
    case 'totalWallArea':
    case 'demolitionArea':
    case 'slopesLength':
    case 'cornersLength':
    case 'manual':
      return resolveWallDefaultQuantity(field, input)
  }
}

export function isWallFinishPriceKey(priceKey: string): boolean {
  const item = MAPPING_BY_ID.get(priceKey)
  return item?.kind === 'finish-paint' || item?.kind === 'finish-wallpaper'
}

export function wallScenarioIncludesFinish(application: WallScenarioApplication): boolean {
  return application.finishTarget === 'wallpaper' || application.finishTarget === 'paint'
}
