import { isZonedEstimateLine } from '../shared/estimate-zoned-line'
import type {
  ElectricEstimateInput,
  ElectricQuantityField,
  EstimateLine,
} from '../shared/estimate.types'
import type { EstimateZone } from '../shared/estimate-zone'
import { resolveElectricDefaultQuantity } from './build-electric-estimate-lines'
import {
  disableElectricConflictingAlternatives,
  disableElectricConflictingAlternativesInZone,
} from './electric-conflict-groups'
import { createZonedElectricEstimateLine } from './create-zoned-electric-estimate-line'
import { ELECTRIC_PRICE_MAPPING } from './electric-price.mapping'

/**
 * Compact scenario электрики: типовое состояние объекта → набор типичных работ.
 * Сценарий = быстрый черновик сметы, не финальная истина (не весь mapping).
 */
export type ElectricStateOption =
  | 'apartment-from-scratch'
  | 'room-rewire'
  | 'kitchen'
  | 'bathroom'
  | 'lighting-only'
  | 'outlets-switches'
  | 'low-current'
  | 'panel-only'
  | 'demolition-only'

export type ElectricScenarioApplication = {
  state: ElectricStateOption
}

export type ApplyElectricScenarioResult = {
  lines: EstimateLine[]
  addedCount: number
  scenarioLabel: string
  enabledPriceKeys: readonly string[]
}

const STATE_LABELS: Record<ElectricStateOption, string> = {
  'apartment-from-scratch': 'Электрика квартиры с нуля',
  'room-rewire': 'Перекоммутация комнаты',
  kitchen: 'Электрика кухни',
  bathroom: 'Электрика санузла',
  'lighting-only': 'Только освещение',
  'outlets-switches': 'Розетки и выключатели',
  'low-current': 'Слаботочные сети',
  'panel-only': 'Только электрощит',
  'demolition-only': 'Только демонтаж электрики',
}

/** Типовые ключи по состоянию — только характерные работы, не весь прайс. */
const STATE_KEYS: Record<ElectricStateOption, readonly string[]> = {
  'apartment-from-scratch': [
    'layout-routes',
    'layout-supply-points',
    'chase-concrete-to-35',
    'cable-chase-1-5-2-5',
    'hole-podrozetnik-concrete',
    'podrozetnik-fix',
    'junction-wago',
    'panel-enclosure-outdoor-12',
    'panel-assembly-12',
    'breaker-1p',
    'rcd-1pn',
    'finish-outlet-switch',
    'finish-spot',
    'check-group-after-mount',
  ],
  'room-rewire': [
    'layout-supply-points',
    'chase-brick-to-35',
    'cable-chase-1-5-2-5',
    'hole-podrozetnik-brick',
    'podrozetnik-fix',
    'finish-outlet-switch',
    'finish-spot',
  ],
  kitchen: [
    'chase-concrete-to-35',
    'cable-cooktop',
    'cable-chase-1-5-2-5',
    'hole-podrozetnik-concrete',
    'podrozetnik-fix',
    'finish-outlet-switch',
    'finish-power-outlet-cook',
    'appliance-cooktop',
    'appliance-oven',
    'appliance-hood',
  ],
  bathroom: [
    'chase-brick-to-35',
    'cable-chase-1-5-2-5',
    'hole-podrozetnik-brick',
    'podrozetnik-fix',
    'finish-outlet-wet',
    'finish-spot',
    'earthing-bath',
    'appliance-towel-ready',
  ],
  'lighting-only': ['finish-spot', 'finish-pendant'],
  'outlets-switches': ['finish-outlet-switch'],
  'low-current': ['cable-utp', 'finish-rj45', 'low-current-test-internet'],
  'panel-only': [
    'panel-enclosure-outdoor-12',
    'panel-assembly-12',
    'breaker-1p',
    'rcd-1pn',
    'meter-1ph',
    'check-panel-after-assembly',
  ],
  'demolition-only': ['demolition-old-electrics', 'demolition-outlets', 'demolition-cable'],
}

const MAPPING_BY_ID = new Map(ELECTRIC_PRICE_MAPPING.map((item) => [item.id, item]))

/**
 * Применяет сценарий электрики: включает набор ключей, подставляет объёмы, гасит конфликты.
 * Быстрый черновик, не финальная истина. Ручные и несвязанные включённые строки
 * вне conflict groups не затирает.
 */
export function applyElectricScenario(
  lines: readonly EstimateLine[],
  input: ElectricEstimateInput,
  application: ElectricScenarioApplication,
): ApplyElectricScenarioResult {
  const keys = resolveElectricScenarioKeys(application)
  const next = enableElectricScenarioKeys(lines, keys, input)

  return {
    lines: next,
    addedCount: keys.length,
    scenarioLabel: formatElectricScenarioLabel(application),
    enabledPriceKeys: keys,
  }
}

/**
 * Сценарий электрики для зоны: upsert zoned clones с `zoneId`, qty из полей зоны.
 * Canonical и другие зоны не трогает; conflicts только внутри зоны.
 */
export function applyElectricScenarioToZone(
  lines: readonly EstimateLine[],
  zone: EstimateZone,
  application: ElectricScenarioApplication,
): ApplyElectricScenarioResult {
  const input = electricInputFromZone(zone)
  const keys = resolveElectricScenarioKeys(application)
  let next = disableElectricConflictingAlternativesInZone(lines, keys, zone.id)

  for (const priceKey of keys) {
    const mappingItem = MAPPING_BY_ID.get(priceKey)
    const field = mappingItem?.defaultQuantityFrom ?? 'manual'
    const qty = resolveElectricDefaultQuantity(field, input)

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

    const created = createZonedElectricEstimateLine({
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
    scenarioLabel: formatElectricScenarioLabel(application),
    enabledPriceKeys: keys,
  }
}

export function resolveElectricScenarioKeys(
  application: ElectricScenarioApplication,
): readonly string[] {
  return [...new Set(STATE_KEYS[application.state] ?? [])]
}

export function formatElectricScenarioLabel(application: ElectricScenarioApplication): string {
  return STATE_LABELS[application.state] ?? application.state
}

export function formatElectricScenarioFeedback(label: string, addedCount: number): string {
  return `Выбран сценарий «${label}», добавлено ${addedCount} строк`
}

export function formatElectricScenarioZoneFeedback(
  label: string,
  zoneName: string,
  addedCount: number,
): string {
  return `Сценарий «${label}» применён к зоне «${zoneName}», строк: ${addedCount}`
}

export function electricInputFromZone(zone: EstimateZone): ElectricEstimateInput {
  return {
    electricSocketsCount: zone.electricSocketsCount,
    electricSwitchesCount: zone.electricSwitchesCount,
    electricLightPointsCount: zone.electricLightPointsCount,
    electricDataPointsCount: zone.electricDataPointsCount,
    electricStrobeLength: zone.electricStrobeLength,
    electricCableLength: zone.electricCableLength,
    electricSocketBoxesCount: zone.electricSocketBoxesCount,
    electricJunctionBoxesCount: zone.electricJunctionBoxesCount,
    electricPanelModulesCount: zone.electricPanelModulesCount,
    electricWarmFloorArea: zone.electricWarmFloorArea,
    electricApplianceConnectionsCount: zone.electricApplianceConnectionsCount,
    surveyorComment: '',
  }
}

function enableElectricScenarioKeys(
  lines: readonly EstimateLine[],
  keys: readonly string[],
  input: ElectricEstimateInput,
): EstimateLine[] {
  const keySet = new Set(keys)
  const withConflictsDisabled = disableElectricConflictingAlternatives(lines, keys)

  return withConflictsDisabled.map((line) => {
    if (line.source === 'manual') return line
    if (isZonedEstimateLine(line)) return line
    if (!keySet.has(line.priceKey)) return line

    const mappingItem = MAPPING_BY_ID.get(line.priceKey)
    const field: ElectricQuantityField = mappingItem?.defaultQuantityFrom ?? 'manual'
    const qty = resolveElectricDefaultQuantity(field, input)

    return {
      ...line,
      enabled: true,
      quantity: qty > 0 ? qty : line.quantity,
    }
  })
}
