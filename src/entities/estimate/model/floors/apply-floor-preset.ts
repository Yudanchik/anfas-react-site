import { normalizeNonNegative } from '../shared/calculate-line-total'
import { disableConflictingAlternatives } from './floor-conflict-groups'
import type { EstimateLine, FloorEstimateInput } from '../shared/estimate.types'

export type DemolitionCoveringOption =
  | 'laminate'
  | 'linoleum'
  | 'tile'
  | 'parquet'
  | 'screed'

export type ScreedTypeOption =
  | 'semidry-up-to-80'
  | 'semidry-over-80'
  | 'wet-up-to-50'
  | 'wet-50-to-80'
  | 'wet-over-80'

export type WaterproofingLayersOption = 'acrylic-1' | 'acrylic-2'

export type WasteTripOption = 'gazelle-6' | 'gazelle-12' | 'carry-out'

export type FloorPresetId =
  | 'demolition-covering'
  | 'screed-on-slab'
  | 'self-leveling'
  | 'wet-zones'
  | 'waste'

export type FloorPresetApplication =
  | { presetId: 'demolition-covering'; covering: DemolitionCoveringOption }
  | { presetId: 'screed-on-slab'; screedType: ScreedTypeOption }
  | { presetId: 'self-leveling' }
  | { presetId: 'wet-zones'; layers: WaterproofingLayersOption }
  | { presetId: 'waste'; trip: WasteTripOption }

export type ApplyFloorPresetResult = {
  lines: EstimateLine[]
  /** Lines turned on by this preset (package size). */
  addedCount: number
  presetLabel: string
}

const PRESET_LABELS: Record<FloorPresetId, string> = {
  'demolition-covering': 'Демонтаж старого покрытия',
  'screed-on-slab': 'Стяжка по плите',
  'self-leveling': 'Выравнивание ровнителем',
  'wet-zones': 'Мокрые зоны',
  waste: 'Вывоз мусора',
}

const DEMOLITION_COVERING_KEYS: Record<DemolitionCoveringOption, readonly string[]> = {
  laminate: ['demolition-laminate'],
  linoleum: ['demolition-linoleum'],
  tile: ['demolition-floor-tile'],
  parquet: ['demolition-parquet-board'],
  screed: ['demolition-screed-up-to-70'],
}

const SCREED_PRESET_KEYS: Record<ScreedTypeOption, readonly string[]> = {
  'semidry-up-to-80': [
    'semidry-prep',
    'semidry-dust-removal',
    'semidry-primer',
    'semidry-screed-up-to-80',
  ],
  'semidry-over-80': [
    'semidry-prep',
    'semidry-dust-removal',
    'semidry-primer',
    'semidry-screed-over-80',
  ],
  'wet-up-to-50': ['wet-prep', 'wet-dust-removal', 'wet-primer', 'wet-screed-up-to-50'],
  'wet-50-to-80': ['wet-prep', 'wet-dust-removal', 'wet-primer', 'wet-screed-50-to-80'],
  'wet-over-80': ['wet-prep', 'wet-dust-removal', 'wet-primer', 'wet-screed-over-80'],
}

const SELF_LEVELING_KEYS = [
  'self-leveling-dust-removal',
  'self-leveling-primer',
  'self-leveling-device',
] as const

const WASTE_KEYS: Record<WasteTripOption, readonly string[]> = {
  'gazelle-6': ['waste-gazelle-6'],
  'gazelle-12': ['waste-gazelle-12'],
  'carry-out': ['waste-carry-out'],
}

/**
 * Applies an explicit estimator scenario: enables a curated key set, sets quantities,
 * and disables conflicting alternatives. Never touches manual rows or unrelated enabled lines
 * outside conflict groups. Does not run from area input / recommendation alone.
 */
export function applyFloorPreset(
  lines: readonly EstimateLine[],
  input: FloorEstimateInput,
  application: FloorPresetApplication,
): ApplyFloorPresetResult {
  const { keys, quantity, presetId } = resolvePresetPlan(application, input)
  const next = enablePresetKeys(lines, keys, quantity)

  return {
    lines: next,
    addedCount: keys.length,
    presetLabel: PRESET_LABELS[presetId],
  }
}

export function formatFloorPresetFeedback(label: string, addedCount: number): string {
  return `Выбран сценарий «${label}», добавлено ${addedCount} строк`
}

function resolvePresetPlan(
  application: FloorPresetApplication,
  input: FloorEstimateInput,
): { keys: readonly string[]; quantity: number; presetId: FloorPresetId } {
  switch (application.presetId) {
    case 'demolition-covering':
      return {
        presetId: application.presetId,
        keys: DEMOLITION_COVERING_KEYS[application.covering],
        quantity: normalizeNonNegative(input.demolitionArea),
      }
    case 'screed-on-slab':
      return {
        presetId: application.presetId,
        keys: SCREED_PRESET_KEYS[application.screedType],
        quantity: resolveScreedQuantity(input),
      }
    case 'self-leveling':
      return {
        presetId: application.presetId,
        keys: SELF_LEVELING_KEYS,
        quantity: resolveScreedQuantity(input),
      }
    case 'wet-zones':
      return {
        presetId: application.presetId,
        keys:
          application.layers === 'acrylic-1'
            ? ['waterproofing-acrylic-1']
            : ['waterproofing-acrylic-2'],
        quantity: normalizeNonNegative(input.wetZonesArea),
      }
    case 'waste':
      return {
        presetId: application.presetId,
        keys: WASTE_KEYS[application.trip],
        quantity: 1,
      }
  }
}

function resolveScreedQuantity(input: FloorEstimateInput): number {
  if (input.screedArea > 0) return normalizeNonNegative(input.screedArea)
  return normalizeNonNegative(input.totalFloorArea)
}

function enablePresetKeys(
  lines: readonly EstimateLine[],
  keys: readonly string[],
  quantity: number,
): EstimateLine[] {
  const keySet = new Set(keys)
  const withConflictsDisabled = disableConflictingAlternatives(lines, keys)
  const qty = normalizeNonNegative(quantity)

  return withConflictsDisabled.map((line) => {
    if (line.source === 'manual') return line
    if (!keySet.has(line.priceKey)) return line
    return {
      ...line,
      enabled: true,
      quantity: qty > 0 ? qty : line.quantity,
    }
  })
}

export function getFloorPresetLabel(presetId: FloorPresetId): string {
  return PRESET_LABELS[presetId]
}
