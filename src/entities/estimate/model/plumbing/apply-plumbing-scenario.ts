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
  /** Несколько маршрутов для одного помещения объединяются до создания строк. */
  states?: PlumbingStateOption[]
  toiletKind?: 'unknown' | 'floor' | 'installation'
  bathKind?: 'unknown' | 'acrylic' | 'cast-iron' | 'quaryl'
  showerKind?: 'unknown' | 'tray' | 'cabin'
  sinkKind?: 'unknown' | 'ordinary' | 'wall' | 'countertop' | 'inset'
}

export type PlumbingScenarioPlan = {
  keys: readonly string[]
  issues: readonly string[]
  notes: readonly string[]
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
const FIXTURE_VARIANTS = new Set([
  'finish-toilet-soft',
  'finish-toilet-floor',
  'finish-bath-acrylic',
  'finish-bath-cast-iron',
  'finish-bath-quaryl',
  'finish-shower-tray',
  'finish-shower-cabin',
  'finish-sink-ordinary',
  'finish-sink-wall',
  'finish-sink-countertop',
  'finish-sink-inset',
  'finish-sink-mixer',
  'finish-bath-mixer',
  'install-frame',
  'install-water-connect',
  'install-sewer-connect',
])

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
  const keys = resolveMeasuredPlumbingScenarioKeys(application, input)
  const next = enablePlumbingScenarioKeys(lines, keys, input, application)

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
  const keys = resolveMeasuredPlumbingScenarioKeys(application, input)
  let next = disablePlumbingConflictingAlternativesInZone(lines, keys, zone.id)

  for (const priceKey of keys) {
    const mappingItem = MAPPING_BY_ID.get(priceKey)
    const field = mappingItem?.defaultQuantityFrom ?? 'manual'
    const qty = resolvePlumbingScenarioQuantity(priceKey, field, input, application)

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
  if (application.states?.length) return [...new Set(application.states.flatMap((state) =>
    resolvePlumbingScenarioKeys({ ...application, state, states: undefined }),
  ))]
  return [...new Set(STATE_KEYS[application.state] ?? [])].filter((key) => MAPPING_BY_ID.has(key))
}

export function formatPlumbingScenarioLabel(application: PlumbingScenarioApplication): string {
  if (application.states?.length) return [...new Set(application.states)]
    .map((state) => STATE_LABELS[state] ?? state).join(' + ')
  return STATE_LABELS[application.state] ?? application.state
}

export function resolveMeasuredPlumbingScenarioKeys(
  application: PlumbingScenarioApplication,
  input: PlumbingEstimateInput,
): readonly string[] {
  return resolvePlumbingScenarioPlan(application, input).keys.filter((key) => {
    const field = MAPPING_BY_ID.get(key)?.defaultQuantityFrom ?? 'manual'
    return resolvePlumbingScenarioQuantity(key, field, input, application) > 0
  })
}

/** Новый вопросный маршрут не угадывает тип прибора по одному счётчику.
 * Старые сохранённые сценарии без ответов оставляют прежний состав. */
export function resolvePlumbingScenarioPlan(
  application: PlumbingScenarioApplication,
  input: PlumbingEstimateInput,
): PlumbingScenarioPlan {
  if (application.states?.length) {
    const states = [...new Set(application.states)]
    if (states.includes('bathroom-from-scratch') && states.includes('bathroom-replacement'))
      return { keys: [], issues: ['Выберите один из двух маршрутов санузла: с нуля или замена.'], notes: [] }
    if (states.includes('kitchen') && states.some((state) =>
      ['bathroom-from-scratch', 'bathroom-replacement', 'bath-zone', 'toilet-zone'].includes(state)))
      return { keys: [], issues: ['Маршруты кухни и санузла нельзя объединять в одном помещении.'], notes: [] }
    const plans = states.map((state) => resolvePlumbingScenarioPlan({
      ...application, state, states: undefined,
    }, state === 'fixtures-only' && states.includes('kitchen')
      ? { ...input, plumbingSinksCount: 0 } : input))
    const keys = [...new Set(plans.flatMap((plan) => plan.keys))]
    const conflictingVariants = Object.values({
      toilet: ['finish-toilet-soft', 'finish-toilet-floor'],
      bath: ['finish-bath-acrylic', 'finish-bath-cast-iron', 'finish-bath-quaryl'],
    }).some((variants) => keys.filter((key) => variants.includes(key)).length > 1)
    return {
      keys,
      issues: [
        ...new Set([
          ...plans.flatMap((plan) => plan.issues),
          ...(conflictingVariants ? ['Выбранные маршруты предлагают несовместимые варианты прибора.'] : []),
        ]),
      ],
      notes: [...new Set(plans.flatMap((plan) => plan.notes))],
    }
  }
  const initial = resolvePlumbingScenarioKeys(application)
  if (
    application.toiletKind === undefined &&
    application.bathKind === undefined &&
    application.showerKind === undefined &&
    application.sinkKind === undefined
  ) {
    return { keys: initial, issues: [], notes: [] }
  }
  const issues: string[] = []
  const notes: string[] = []
  const keys = initial.filter((key) => !FIXTURE_VARIANTS.has(key))
  const bathroom =
    application.state === 'bathroom-from-scratch' || application.state === 'bathroom-replacement'
  const fixtures = bathroom || application.state === 'fixtures-only'
  const toilet = fixtures || application.state === 'toilet-zone'
  const bath = fixtures || application.state === 'bath-zone'
  const sink = fixtures
  if (toilet && input.plumbingToiletsCount > 0) {
    if (!application.toiletKind || application.toiletKind === 'unknown')
      issues.push('Укажите тип унитаза.')
    else if (application.toiletKind === 'floor') keys.push('finish-toilet-floor')
    else {
      keys.push('finish-toilet-soft')
      if (input.plumbingInstallationsCount > 0)
        keys.push('install-frame', 'install-water-connect', 'install-sewer-connect')
    }
  }
  if (bath && input.plumbingBathtubsCount > 0) {
    const selected = {
      acrylic: 'finish-bath-acrylic',
      'cast-iron': 'finish-bath-cast-iron',
      quaryl: 'finish-bath-quaryl',
    }
    if (!application.bathKind || application.bathKind === 'unknown')
      issues.push('Укажите тип ванны.')
    else keys.push(selected[application.bathKind])
  }
  if (bath && input.plumbingShowersCount > 0) {
    if (!application.showerKind || application.showerKind === 'unknown')
      issues.push('Укажите тип душа.')
    else keys.push(application.showerKind === 'tray' ? 'finish-shower-tray' : 'finish-shower-cabin')
  }
  if (sink && input.plumbingSinksCount > 0) {
    const selected = {
      ordinary: 'finish-sink-ordinary',
      wall: 'finish-sink-wall',
      countertop: 'finish-sink-countertop',
      inset: 'finish-sink-inset',
    }
    if (!application.sinkKind || application.sinkKind === 'unknown')
      issues.push('Укажите тип раковины.')
    else keys.push(selected[application.sinkKind])
  }
  if (input.plumbingMixersCount > 0 && (bathroom || fixtures || application.state === 'bath-zone'))
    notes.push(
      'Виды смесителей и их количества уточните в строках прайса: общий счётчик не позволяет разделить смеситель ванны, душа и раковины.',
    )
  return { keys: [...new Set(keys)], issues, notes }
}

export function formatPlumbingScenarioFeedback(label: string, addedCount: number): string {
  return `Сценарий «${label}» применён, строк с объёмом: ${addedCount}`
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
    plumbingOldToiletsCount: zone.plumbingOldToiletsCount,
    plumbingOldSinksCount: zone.plumbingOldSinksCount,
    plumbingOldBathtubsCount: zone.plumbingOldBathtubsCount,
    plumbingOldMixersCount: zone.plumbingOldMixersCount,
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
  application: PlumbingScenarioApplication,
): EstimateLine[] {
  const keySet = new Set(keys)
  const withConflictsDisabled = disablePlumbingConflictingAlternatives(lines, keys)

  return withConflictsDisabled.map((line) => {
    if (line.source === 'manual') return line
    if (isZonedEstimateLine(line)) return line
    if (!keySet.has(line.priceKey)) return line

    const mappingItem = MAPPING_BY_ID.get(line.priceKey)
    const field: PlumbingQuantityField = mappingItem?.defaultQuantityFrom ?? 'manual'
    const qty = resolvePlumbingScenarioQuantity(line.priceKey, field, input, application)

    return {
      ...line,
      enabled: true,
      quantity: qty > 0 ? qty : line.quantity,
    }
  })
}

/** Старый прибор при замене не определяется количеством новых приборов. */
export function resolvePlumbingScenarioQuantity(
  key: string,
  field: PlumbingQuantityField,
  input: PlumbingEstimateInput,
  application?: PlumbingScenarioApplication,
): number {
  const legacy = application?.state === 'demolition-only' || !application
  const values: Record<string, number> = {
    'demolition-toilet': input.plumbingOldToiletsCount ?? (legacy ? input.plumbingToiletsCount : 0),
    'demolition-sink': input.plumbingOldSinksCount ?? (legacy ? input.plumbingSinksCount : 0),
    'demolition-bath': input.plumbingOldBathtubsCount ?? (legacy ? input.plumbingBathtubsCount : 0),
    'demolition-mixer': input.plumbingOldMixersCount ?? (legacy ? input.plumbingMixersCount : 0),
  }
  return key in values ? Math.max(0, values[key]) : resolvePlumbingDefaultQuantity(field, input)
}
