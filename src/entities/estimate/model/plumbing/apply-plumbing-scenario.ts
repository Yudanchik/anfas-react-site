import { isZonedEstimateLine } from '../shared/estimate-zoned-line'
import type {
  EstimateLine,
  PlumbingEstimateInput,
  PlumbingQuantityField,
} from '../shared/estimate.types'
import type { EstimateZone } from '../shared/estimate-zone'
import { resolvePlumbingDefaultQuantity } from './build-plumbing-estimate-lines'
import {
  disablePlumbingConflictingAlternatives,
  disablePlumbingConflictingAlternativesInZone,
} from './plumbing-conflict-groups'
import { createZonedPlumbingEstimateLine } from './create-zoned-plumbing-estimate-line'
import { PLUMBING_PRICE_MAPPING } from './plumbing-price.mapping'

/**
 * Compact scenario сантехники: типовое состояние объекта → набор типичных работ.
 * Сценарий = быстрый черновик сметы, не финальная истина (не весь mapping).
 */
export type PlumbingStateOption =
  | 'bathroom-from-scratch'
  | 'bathroom-replacement'
  | 'kitchen'
  | 'bath-zone'
  | 'toilet-zone'
  | 'manifold'
  | 'drainage-only'
  | 'water-supply-only'
  | 'fixtures-only'
  | 'demolition-only'

export type PlumbingScenarioApplication = {
  state: PlumbingStateOption
}

export type ApplyPlumbingScenarioResult = {
  lines: EstimateLine[]
  addedCount: number
  scenarioLabel: string
  enabledPriceKeys: readonly string[]
}

const STATE_LABELS: Record<PlumbingStateOption, string> = {
  'bathroom-from-scratch': 'Сантехника санузла с нуля',
  'bathroom-replacement': 'Замена сантехники в санузле',
  kitchen: 'Кухня',
  'bath-zone': 'Ванная',
  'toilet-zone': 'Туалет',
  manifold: 'Коллекторный узел',
  'drainage-only': 'Канализация',
  'water-supply-only': 'Водоснабжение',
  'fixtures-only': 'Подключение приборов',
  'demolition-only': 'Только демонтаж',
}

/** Типовые ключи по состоянию — только характерные работы, не весь прайс. */
const STATE_KEYS: Record<PlumbingStateOption, readonly string[]> = {
  'bathroom-from-scratch': [
    'drainage-layout',
    'drainage-pipe-d32-50',
    'drainage-pipe-d110',
    'drainage-outlet-fix',
    'water-layout',
    'water-pipe-d16-20',
    'water-outlet',
    'conn-opress-water',
    'install-frame',
    'install-water-connect',
    'install-sewer-connect',
    'finish-toilet-soft',
    'finish-sink-ordinary',
    'finish-sink-mixer',
    'finish-bath-acrylic',
    'finish-bath-mixer',
    'check-water-start',
  ],
  'bathroom-replacement': [
    'demolition-toilet',
    'demolition-sink',
    'demolition-bath',
    'demolition-mixer',
    'finish-toilet-soft',
    'finish-sink-ordinary',
    'finish-sink-mixer',
    'finish-bath-acrylic',
    'finish-bath-mixer',
    'check-finish',
  ],
  kitchen: [
    'drainage-pipe-d32-50',
    'drainage-outlet-fix',
    'water-pipe-d16-20',
    'water-outlet',
    'finish-kitchen-sink',
    'finish-kitchen-mixer',
    'finish-dishwasher',
    'conn-opress-water',
  ],
  'bath-zone': [
    'finish-bath-acrylic',
    'finish-bath-mixer',
    'finish-siphon-bath',
    'finish-shower-tray',
    'finish-shower-mixer-open',
  ],
  'toilet-zone': [
    'install-frame',
    'install-water-connect',
    'install-sewer-connect',
    'finish-toilet-soft',
    'drainage-pipe-d110',
    'water-pipe-d16-20',
    'water-outlet',
  ],
  manifold: [
    'manifold-cabinet-surface',
    'manifold-beam',
    'manifold-inlet',
    'manifold-filter-coarse',
    'manifold-reducer',
    'manifold-water-meter',
    'conn-opress-water',
  ],
  'drainage-only': [
    'drainage-layout',
    'drainage-pipe-d32-50',
    'drainage-pipe-d110',
    'drainage-outlet-fix',
    'drainage-slope',
    'drainage-test-flush',
  ],
  'water-supply-only': [
    'water-layout',
    'water-pipe-d16-20',
    'water-outlet',
    'water-outlet-fix',
    'conn-opress-water',
  ],
  'fixtures-only': [
    'finish-toilet-soft',
    'finish-sink-ordinary',
    'finish-sink-mixer',
    'finish-washer',
    'finish-dishwasher',
    'check-finish',
  ],
  'demolition-only': [
    'demolition-toilet',
    'demolition-sink',
    'demolition-bath',
    'demolition-mixer',
  ],
}

const MAPPING_BY_ID = new Map(PLUMBING_PRICE_MAPPING.map((item) => [item.id, item]))

/**
 * Применяет сценарий сантехники: включает набор ключей, подставляет объёмы, гасит конфликты.
 * Быстрый черновик, не финальная истина. Ручные и несвязанные включённые строки
 * вне conflict groups не затирает.
 */
export function applyPlumbingScenario(
  lines: readonly EstimateLine[],
  input: PlumbingEstimateInput,
  application: PlumbingScenarioApplication,
): ApplyPlumbingScenarioResult {
  const keys = resolvePlumbingScenarioKeys(application)
  const next = enablePlumbingScenarioKeys(lines, keys, input)

  return {
    lines: next,
    addedCount: keys.length,
    scenarioLabel: formatPlumbingScenarioLabel(application),
    enabledPriceKeys: keys,
  }
}

/**
 * Сценарий сантехники для зоны: upsert zoned clones с `zoneId`, qty из полей зоны.
 * Canonical и другие зоны не трогает; conflicts только внутри зоны.
 */
export function applyPlumbingScenarioToZone(
  lines: readonly EstimateLine[],
  zone: EstimateZone,
  application: PlumbingScenarioApplication,
): ApplyPlumbingScenarioResult {
  const input = plumbingInputFromZone(zone)
  const keys = resolvePlumbingScenarioKeys(application)
  let next = disablePlumbingConflictingAlternativesInZone(lines, keys, zone.id)

  for (const priceKey of keys) {
    const mappingItem = MAPPING_BY_ID.get(priceKey)
    const field = mappingItem?.defaultQuantityFrom ?? 'manual'
    const qty = resolvePlumbingDefaultQuantity(field, input)

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

    const created = createZonedPlumbingEstimateLine({
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
    scenarioLabel: formatPlumbingScenarioLabel(application),
    enabledPriceKeys: keys,
  }
}

export function resolvePlumbingScenarioKeys(
  application: PlumbingScenarioApplication,
): readonly string[] {
  return [...new Set(STATE_KEYS[application.state] ?? [])].filter((key) => MAPPING_BY_ID.has(key))
}

export function formatPlumbingScenarioLabel(application: PlumbingScenarioApplication): string {
  return STATE_LABELS[application.state] ?? application.state
}

export function formatPlumbingScenarioFeedback(label: string, addedCount: number): string {
  return `Выбран сценарий «${label}», добавлено ${addedCount} строк`
}

export function formatPlumbingScenarioZoneFeedback(
  label: string,
  zoneName: string,
  addedCount: number,
): string {
  return `Сценарий «${label}» применён к зоне «${zoneName}», строк: ${addedCount}`
}

export function plumbingInputFromZone(zone: EstimateZone): PlumbingEstimateInput {
  return {
    plumbingWaterPointsCount: zone.plumbingWaterPointsCount,
    plumbingSewerPointsCount: zone.plumbingSewerPointsCount,
    plumbingWaterPipeLength: zone.plumbingWaterPipeLength,
    plumbingSewerPipeLength: zone.plumbingSewerPipeLength,
    plumbingCollectorsCount: zone.plumbingCollectorsCount,
    plumbingToiletsCount: zone.plumbingToiletsCount,
    plumbingSinksCount: zone.plumbingSinksCount,
    plumbingBathtubsCount: zone.plumbingBathtubsCount,
    plumbingShowersCount: zone.plumbingShowersCount,
    plumbingMixersCount: zone.plumbingMixersCount,
    plumbingInstallationsCount: zone.plumbingInstallationsCount,
    plumbingDrainsCount: zone.plumbingDrainsCount,
    plumbingWasherConnectionsCount: zone.plumbingWasherConnectionsCount,
    plumbingDishwasherConnectionsCount: zone.plumbingDishwasherConnectionsCount,
    plumbingWaterHeatersCount: zone.plumbingWaterHeatersCount,
    plumbingTowelWarmersCount: zone.plumbingTowelWarmersCount,
    plumbingWarmFloorArea: zone.plumbingWarmFloorArea,
    surveyorComment: '',
  }
}

function enablePlumbingScenarioKeys(
  lines: readonly EstimateLine[],
  keys: readonly string[],
  input: PlumbingEstimateInput,
): EstimateLine[] {
  const keySet = new Set(keys)
  const withConflictsDisabled = disablePlumbingConflictingAlternatives(lines, keys)

  return withConflictsDisabled.map((line) => {
    if (line.source === 'manual') return line
    if (isZonedEstimateLine(line)) return line
    if (!keySet.has(line.priceKey)) return line

    const mappingItem = MAPPING_BY_ID.get(line.priceKey)
    const field: PlumbingQuantityField = mappingItem?.defaultQuantityFrom ?? 'manual'
    const qty = resolvePlumbingDefaultQuantity(field, input)

    return {
      ...line,
      enabled: true,
      quantity: qty > 0 ? qty : line.quantity,
    }
  })
}
