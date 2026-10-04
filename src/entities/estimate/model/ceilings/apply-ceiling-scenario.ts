import { isZonedEstimateLine } from '../shared/estimate-zoned-line'
import type {
  CeilingEstimateInput,
  CeilingQuantityField,
  CeilingWorkKind,
  EstimateLine,
} from '../shared/estimate.types'
import type { EstimateZone } from '../shared/estimate-zone'
import {
  resolveCeilingDefaultQuantity,
  resolveCeilingFinishQuantity,
  resolveCeilingPlasterQuantity,
  resolveCeilingPuttyQuantity,
} from './build-ceiling-estimate-lines'
import { createZonedCeilingEstimateLine } from './create-zoned-ceiling-estimate-line'
import {
  disableCeilingConflictingAlternatives,
  disableCeilingConflictingAlternativesInZone,
} from './ceiling-conflict-groups'
import { CEILING_PRICE_MAPPING } from './ceiling-price.mapping'

/**
 * Compact scenario: состояние потолков × целевой результат.
 * Сценарий = быстрый черновик сметы, не финальная истина.
 */
export type CeilingStateOption =
  | 'from-scratch'
  | 'after-demolition'
  | 'prefinish'
  | 'demolition-only'
  | 'local-leveling'
  | 'finish-only'

export type CeilingFinishTargetOption = 'none' | 'paint'

export type CeilingDemolitionCoveringOption =
  | 'paint'
  | 'plaster'
  | 'putty'
  | 'wallpaper'
  | 'gkl-frame'
  | 'suspended'
  | 'stretch'
  | 'stretch-no-save'
  | 'panel'

export type CeilingPaintLayersOption =
  'paint-ceiling-1' | 'paint-ceiling-2' | 'paint-ceiling-3' | 'paint-ceiling-mech-2'

export type CeilingScenarioApplication = {
  state: CeilingStateOption
  finishTarget: CeilingFinishTargetOption
  demolitionCovering?: CeilingDemolitionCoveringOption
  paintLayers?: CeilingPaintLayersOption
  demolitionBeforeWork?: boolean
  substrate?: 'unknown' | 'mineral' | 'plastered' | 'drywall'
  quality?: 'q2' | 'q3' | 'q4'
  reinforce?: boolean
}

export type CeilingScenarioPlan = { keys: readonly string[]; issues: readonly string[] }

export type ApplyCeilingScenarioResult = {
  lines: EstimateLine[]
  addedCount: number
  scenarioLabel: string
  enabledPriceKeys: readonly string[]
}

const DEMOLITION_KEYS: Record<CeilingDemolitionCoveringOption, string> = {
  paint: 'demolition-paint',
  plaster: 'demolition-plaster',
  putty: 'demolition-putty',
  wallpaper: 'demolition-wallpaper',
  'gkl-frame': 'demolition-gkl-frame',
  suspended: 'demolition-suspended',
  stretch: 'demolition-stretch',
  'stretch-no-save': 'demolition-stretch-no-save',
  panel: 'demolition-panel',
}

const PAINT_KEYS: Record<CeilingPaintLayersOption, string> = {
  'paint-ceiling-1': 'paint-ceiling-1',
  'paint-ceiling-2': 'paint-ceiling-2',
  'paint-ceiling-3': 'paint-ceiling-3',
  'paint-ceiling-mech-2': 'paint-ceiling-mech-2',
}

const STATE_LABELS: Record<CeilingStateOption, string> = {
  'from-scratch': 'Потолок с нуля',
  'after-demolition': 'После демонтажа',
  prefinish: 'Предчистовая',
  'demolition-only': 'Только демонтаж',
  'local-leveling': 'Локальное выравнивание',
  'finish-only': 'Только финиш',
}

const FINISH_LABELS: Record<CeilingFinishTargetOption, string> = {
  none: 'без финиша',
  paint: 'под покраску',
}

const PAINT_FINISH_CHAIN = [
  'putty-finish-ceiling-1',
  'reinforce-glassfiber-ceiling',
  'putty-finish-sanding-ceiling',
] as const

const PREP_PLASTER_CHAIN = [
  'primer-deep-penetration',
  'plaster-beacons-ceiling',
  'plaster-ceiling-main',
  'plaster-beacon-removal-ceiling',
  'putty-ceiling-2',
  'putty-sanding-ceiling',
] as const

const MAPPING_BY_ID = new Map(CEILING_PRICE_MAPPING.map((item) => [item.id, item]))

/**
 * Применяет сценарий потолков: включает набор ключей, подставляет объёмы, гасит конфликты.
 * Быстрый черновик, не финальная истина. Ручные и несвязанные включённые строки
 * вне conflict groups не затирает. Сам по полям площади не запускается.
 */
export function applyCeilingScenario(
  lines: readonly EstimateLine[],
  input: CeilingEstimateInput,
  application: CeilingScenarioApplication,
): ApplyCeilingScenarioResult {
  const keys = resolveCeilingScenarioKeys(application)
  const next = enableCeilingScenarioKeys(lines, keys, input)

  return {
    lines: next,
    addedCount: keys.length,
    scenarioLabel: formatCeilingScenarioLabel(application),
    enabledPriceKeys: keys,
  }
}

/**
 * Сценарий потолков для зоны: upsert zoned clones с `zoneId`, qty из полей зоны.
 * Canonical и другие зоны не трогает; conflicts только внутри зоны.
 */
export function applyCeilingScenarioToZone(
  lines: readonly EstimateLine[],
  zone: EstimateZone,
  application: CeilingScenarioApplication,
): ApplyCeilingScenarioResult {
  const input = ceilingInputFromZone(zone)
  const keys = resolveCeilingScenarioKeys(application)
  let next = disableCeilingConflictingAlternativesInZone(lines, keys, zone.id)

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

    const created = createZonedCeilingEstimateLine({
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
    scenarioLabel: formatCeilingScenarioLabel(application),
    enabledPriceKeys: keys,
  }
}

export function resolveCeilingScenarioKeys(
  application: CeilingScenarioApplication,
): readonly string[] {
  return resolveCeilingScenarioPlan(application).keys
}

export function resolveCeilingScenarioPlan(
  application: CeilingScenarioApplication,
): CeilingScenarioPlan {
  const { state, finishTarget } = application
  const keys: string[] = []
  const issues: string[] = []
  const modern = application.substrate !== undefined
  if (modern && state !== 'demolition-only' && state !== 'finish-only') {
    if (application.substrate === 'unknown')
      issues.push('Осмотрите основание потолка перед выбором подготовки.')
    if (application.substrate === 'drywall')
      issues.push('Для ГКЛ нужна отдельная обработка швов; штукатурный маршрут здесь не подходит.')
    if (state === 'prefinish' && application.substrate !== 'plastered')
      issues.push('Предчистовая предполагает уже готовую прочную штукатурку.')
  }
  const ready = !modern || issues.length === 0
  if (modern && finishTarget === 'paint' && application.quality === 'q2' && state !== 'finish-only')
    issues.push(
      'Для гладкой матовой окраски выберите Q3, для глянцевой — Q4; Q2 подходит только для фактурного покрытия.',
    )
  if (state === 'from-scratch' && application.demolitionBeforeWork) {
    keys.push(DEMOLITION_KEYS[application.demolitionCovering ?? 'paint'])
  }

  switch (state) {
    case 'demolition-only':
      keys.push(DEMOLITION_KEYS[application.demolitionCovering ?? 'paint'])
      break
    case 'local-leveling':
      if (ready) keys.push('prep-dust-removal', 'putty-local-3mm', 'putty-sanding-ceiling')
      break
    case 'finish-only':
      // Только финиш — без цепочки подготовки
      break
    case 'from-scratch':
      if (ready)
        keys.push(
          ...(modern && application.substrate === 'plastered'
            ? ['prep-dust-removal', 'primer-one-layer', 'putty-ceiling-2', 'putty-sanding-ceiling']
            : PREP_PLASTER_CHAIN),
        )
      break
    case 'after-demolition':
      if (!modern && application.demolitionBeforeWork === undefined) {
        keys.push(DEMOLITION_KEYS[application.demolitionCovering ?? 'paint'])
      }
      keys.push('prep-dust-removal')
      if (ready)
        keys.push(
          ...(modern && application.substrate === 'plastered'
            ? ['primer-one-layer', 'putty-ceiling-2', 'putty-sanding-ceiling']
            : PREP_PLASTER_CHAIN),
        )
      break
    case 'prefinish':
      keys.push('prep-dust-removal')
      if (ready) keys.push('primer-one-layer', 'putty-ceiling-2', 'putty-sanding-ceiling')
      if (!modern && finishTarget === 'paint') keys.push(...PAINT_FINISH_CHAIN)
      break
  }

  if (modern && ready && ['from-scratch', 'after-demolition', 'prefinish'].includes(state)) {
    const quality = application.quality ?? 'q3'
    const needsReinforcement = application.reinforce === true && finishTarget === 'paint'
    // Прежний пакет из двух базовых слоёв сохраняется для Q3/Q4; Q2 использует один.
    const baseIndex = keys.indexOf('putty-ceiling-2')
    if (baseIndex >= 0 && quality === 'q2') keys.splice(baseIndex, 1, 'putty-ceiling-1')
    if (quality === 'q3' || quality === 'q4' || needsReinforcement) {
      if (needsReinforcement) keys.push('reinforce-glassfiber-ceiling')
      keys.push(quality === 'q4' ? 'putty-finish-ceiling-2' : 'putty-finish-ceiling-1')
      keys.push('putty-finish-sanding-ceiling')
    }
  }
  if (
    finishTarget === 'paint' &&
    state !== 'demolition-only' &&
    state !== 'local-leveling' &&
    ready
  ) {
    if (!modern && (state === 'from-scratch' || state === 'after-demolition'))
      keys.push(...PAINT_FINISH_CHAIN)
    keys.push(PAINT_KEYS[application.paintLayers ?? 'paint-ceiling-2'])
  }

  // Без дублей, порядок включения сохраняем
  return { keys: [...new Set(keys)], issues }
}

export function formatCeilingScenarioLabel(application: CeilingScenarioApplication): string {
  const { state, finishTarget } = application
  if (state === 'demolition-only') return STATE_LABELS[state]
  if (state === 'local-leveling') return STATE_LABELS[state]
  if (state === 'finish-only') {
    if (finishTarget === 'paint') return 'Только финиш: покраска'
    return STATE_LABELS[state]
  }
  if (finishTarget === 'none') return `${STATE_LABELS[state]} (${FINISH_LABELS.none})`
  return `${STATE_LABELS[state]} ${FINISH_LABELS[finishTarget]}`
}

export function formatCeilingScenarioFeedback(label: string, addedCount: number): string {
  return `Выбран сценарий «${label}», добавлено ${addedCount} строк`
}

export function formatCeilingScenarioZoneFeedback(
  label: string,
  zoneName: string,
  addedCount: number,
): string {
  return `Сценарий «${label}» применён к зоне «${zoneName}», строк: ${addedCount}`
}

function ceilingInputFromZone(zone: EstimateZone): CeilingEstimateInput {
  return {
    totalCeilingArea: zone.ceilingArea,
    demolitionArea: zone.demolitionCeilingArea,
    plasterArea: zone.plasterCeilingArea,
    puttyArea: zone.puttyCeilingArea,
    finishArea: zone.finishCeilingArea,
    surveyorComment: '',
  }
}

function enableCeilingScenarioKeys(
  lines: readonly EstimateLine[],
  keys: readonly string[],
  input: CeilingEstimateInput,
): EstimateLine[] {
  const keySet = new Set(keys)
  const withConflictsDisabled = disableCeilingConflictingAlternatives(lines, keys)

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
  kind: CeilingWorkKind | undefined,
  fallback: CeilingQuantityField | undefined,
): CeilingQuantityField {
  if (kind === 'finish-paint') return 'finishArea'
  return fallback ?? 'manual'
}

function resolveScenarioQuantity(field: CeilingQuantityField, input: CeilingEstimateInput): number {
  switch (field) {
    case 'plasterArea':
      return resolveCeilingPlasterQuantity(input)
    case 'puttyArea':
      return resolveCeilingPuttyQuantity(input)
    case 'finishArea':
      return resolveCeilingFinishQuantity(input)
    case 'totalCeilingArea':
    case 'demolitionArea':
    case 'manual':
      return resolveCeilingDefaultQuantity(field, input)
  }
}

export function isCeilingFinishPriceKey(priceKey: string): boolean {
  const item = MAPPING_BY_ID.get(priceKey)
  return item?.kind === 'finish-paint'
}

export function ceilingScenarioIncludesFinish(application: CeilingScenarioApplication): boolean {
  return application.finishTarget === 'paint'
}
