import { normalizeNonNegative } from '../shared/calculate-line-total'
import { isZonedEstimateLine } from '../shared/estimate-zoned-line'
import type { EstimateLine, FloorEstimateInput } from '../shared/estimate.types'
import type { EstimateZone } from '../shared/estimate-zone'
import { roomFootprintPerimeter } from '../shared/wall-measurements'
import { createZonedFloorEstimateLine } from './create-zoned-floor-estimate-line'
import {
  disableConflictingAlternatives,
  disableConflictingAlternativesInZone,
} from './floor-conflict-groups'

export type DemolitionCoveringOption = 'laminate' | 'linoleum' | 'tile' | 'parquet' | 'screed'

export type ScreedTypeOption =
  'semidry-up-to-80' | 'semidry-over-80' | 'wet-up-to-50' | 'wet-50-to-80' | 'wet-over-80'

export type WaterproofingLayersOption = 'acrylic-1' | 'acrylic-2'

export type WasteTripOption = 'gazelle-6' | 'gazelle-12' | 'carry-out'
export type FloorFinishOption =
  'none' | 'laminate-floating' | 'quartz-floating' | 'quartz-glue' |
  'parquet-glue' | 'carpet-glue'
export type FloorPlinthOption = 'none' | 'plastic' | 'mdf' | 'duropolymer' | 'shadow'

export type FloorPresetId =
  'room-plan' | 'demolition-covering' | 'screed-on-slab' | 'self-leveling' | 'wet-zones' | 'waste'

export type FloorPresetApplication =
  | {
      presetId: 'room-plan'
      oldCovering: DemolitionCoveringOption | 'none'
      leveling: ScreedTypeOption | 'self-leveling' | 'none'
      selfLevelingBase?: 'inspect' | 'ready' | 'grind' | 'other'
      screedBase?: 'inspect' | 'bonded' | 'film' | 'floating'
      waterproofing: WaterproofingLayersOption | 'none'
      finish?: FloorFinishOption
      plinth?: FloorPlinthOption
    }
  | { presetId: 'demolition-covering'; covering: DemolitionCoveringOption }
  | { presetId: 'screed-on-slab'; screedType: ScreedTypeOption }
  | { presetId: 'self-leveling' }
  | { presetId: 'wet-zones'; layers: WaterproofingLayersOption }
  | { presetId: 'waste'; trip: WasteTripOption }

export type ApplyFloorPresetResult = {
  lines: EstimateLine[]
  /** Сколько строк включил этот сценарий (размер пакета). */
  addedCount: number
  presetLabel: string
}

const PRESET_LABELS: Record<FloorPresetId, string> = {
  'room-plan': 'Подготовка пола по ответам',
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

const SCREED_FILM_KEY: Record<'semidry' | 'wet', string> = {
  semidry: 'semidry-pe-film',
  wet: 'wet-pe-film',
}

function screedKeysOnFilm(type: ScreedTypeOption): string[] {
  const prefix = type.startsWith('semidry') ? 'semidry' : 'wet'
  const keys = SCREED_PRESET_KEYS[type].filter((key) => key !== `${prefix}-primer`)
  keys.splice(keys.length - 1, 0, SCREED_FILM_KEY[prefix])
  return keys
}

const WASTE_KEYS: Record<WasteTripOption, readonly string[]> = {
  'gazelle-6': ['waste-gazelle-6'],
  'gazelle-12': ['waste-gazelle-12'],
  'carry-out': ['waste-carry-out'],
}

const FINISH_KEYS: Record<Exclude<FloorFinishOption, 'none'>, readonly string[]> = {
  'laminate-floating': ['finish-underlay-laminate-lock-quartz', 'finish-laminate-quartz-floating'],
  'quartz-floating': ['finish-underlay-laminate-lock-quartz', 'finish-laminate-quartz-floating'],
  'quartz-glue': ['finish-quartz-glue'],
  'parquet-glue': ['finish-engineered-parquet-glue'],
  'carpet-glue': ['finish-carpet-glue'],
}

const PLINTH_KEYS: Record<Exclude<FloorPlinthOption, 'none'>, string> = {
  plastic: 'finish-plinth-plastic',
  mdf: 'finish-plinth-mdf-glue',
  duropolymer: 'finish-plinth-duropolymer-up-to-100',
  shadow: 'finish-plinth-shadow',
}

/** Длина вдоль контура минус дверные проёмы до пола; окна не вычитаются. */
export function resolveFloorPlinthLength(zone: EstimateZone): number | null {
  const measurements = zone.wallMeasurements
  if (!measurements) return null
  const perimeter = roomFootprintPerimeter(measurements)
  if (perimeter === null) return null
  const doors = measurements.walls.flatMap((wall) => wall.openings)
    .filter((opening) => opening.kind === 'door')
    .reduce((sum, opening) => sum + opening.widthM * opening.count, 0)
  return Math.round(Math.max(0, perimeter - doors) * 100) / 100
}

export type FloorRoomPlan = {
  works: readonly { key: string; quantity: number }[]
  issues: readonly string[]
}

const ROOM_PLAN_KEYS = new Set([
  ...Object.values(DEMOLITION_COVERING_KEYS).flat(),
  ...Object.values(SCREED_PRESET_KEYS).flat(),
  ...Object.values(SCREED_FILM_KEY),
  ...SELF_LEVELING_KEYS,
  'self-leveling-grind',
  'waterproofing-acrylic-1',
  'waterproofing-acrylic-2',
  ...Object.values(FINISH_KEYS).flat(),
  ...Object.values(PLINTH_KEYS),
])

/** Один маршрут помещения: отдельный объём для демонтажа, основания и гидроизоляции. */
export function resolveFloorRoomPlan(
  application: Extract<FloorPresetApplication, { presetId: 'room-plan' }>,
  input: FloorEstimateInput,
): FloorRoomPlan {
  const works: { key: string; quantity: number }[] = []
  const issues: string[] = []
  const add = (keys: readonly string[], quantity: number) => {
    for (const key of keys) works.push({ key, quantity: normalizeNonNegative(quantity) })
  }
  if (application.oldCovering !== 'none') {
    if (input.demolitionArea <= 0) issues.push('Укажите площадь демонтажа старого покрытия.')
    else add(DEMOLITION_COVERING_KEYS[application.oldCovering], input.demolitionArea)
  }
  if (application.leveling !== 'none') {
    const area = resolveScreedQuantity(input)
    if (area <= 0) issues.push('Укажите площадь пола или выравнивания.')
    else if (application.leveling === 'self-leveling') {
      if (application.selfLevelingBase === 'inspect')
        issues.push('Осмотрите бетонное основание: требуется ли шлифование перед наливным полом?')
      else if (application.selfLevelingBase === 'other')
        issues.push('Этот маршрут и позиции прайса рассчитаны для прочного бетонного основания. Уточните систему пола и добавьте подходящие работы вручную.')
      else {
        if (application.selfLevelingBase === 'grind') add(['self-leveling-grind'], area)
        add(SELF_LEVELING_KEYS, area)
      }
    } else if (application.screedBase === 'inspect')
      issues.push('Уточните конструкцию стяжки: связанная с основанием или на полиэтиленовой плёнке?')
    else if (application.screedBase === 'floating')
      issues.push('Для плавающей стяжки уточните изоляционный слой, толщину и состав работ; этот маршрут пока не создаёт полный набор.')
    else add(
      application.screedBase === 'film'
        ? screedKeysOnFilm(application.leveling)
        : SCREED_PRESET_KEYS[application.leveling],
      area,
    )
  }
  if (application.waterproofing !== 'none' && input.wetZonesArea > 0) {
    add(
      [
        application.waterproofing === 'acrylic-1'
          ? 'waterproofing-acrylic-1'
          : 'waterproofing-acrylic-2',
      ],
      input.wetZonesArea,
    )
  }
  if (application.finish && application.finish !== 'none') {
    if (input.totalFloorArea <= 0) issues.push('Укажите площадь пола для финишного покрытия.')
    else add(FINISH_KEYS[application.finish], input.totalFloorArea)
  }
  if (application.plinth && application.plinth !== 'none') {
    if (!input.plinthLength || input.plinthLength <= 0)
      issues.push('Для плинтуса задайте контур комнаты или длину и ширину; дверные проёмы отметьте в стенах.')
    else add([PLINTH_KEYS[application.plinth]], input.plinthLength)
  }
  if (!works.length && !issues.length)
    issues.push(
      application.waterproofing !== 'none' && input.wetZonesArea <= 0
        ? 'В помещении нет площади гидроизоляции; выберите другие работы или укажите мокрую площадь.'
        : 'Выберите хотя бы один вид работ.',
    )
  return { works, issues }
}

/**
 * Явный сценарий сметчика: включает набор ключей, подставляет объёмы, гасит конфликты.
 * Быстрый черновик, не финальная истина. Ручные строки и zoned clones не затирает;
 * несвязанные включённые строки вне conflict groups оставляет. Сам по площади/рекомендации не запускается.
 */
export function applyFloorPreset(
  lines: readonly EstimateLine[],
  input: FloorEstimateInput,
  application: FloorPresetApplication,
): ApplyFloorPresetResult {
  if (application.presetId === 'room-plan') {
    const plan = resolveFloorRoomPlan(application, input)
    const chosen = new Set(plan.works.map((work) => work.key))
    const quantities = new Map(plan.works.map((work) => [work.key, work.quantity]))
    const next = lines.map((line) => {
      if (
        line.source === 'manual' ||
        isZonedEstimateLine(line) ||
        !ROOM_PLAN_KEYS.has(line.priceKey)
      )
        return line
      return {
        ...line,
        enabled: chosen.has(line.priceKey),
        quantity: quantities.get(line.priceKey) ?? line.quantity,
      }
    })
    return { lines: next, addedCount: plan.works.length, presetLabel: PRESET_LABELS['room-plan'] }
  }
  const { keys, quantity, presetId } = resolvePresetPlan(application, input)
  const next = enablePresetKeys(lines, keys, quantity)

  return {
    lines: next,
    addedCount: keys.length,
    presetLabel: PRESET_LABELS[presetId],
  }
}

/**
 * Сценарий полов для зоны: upsert zoned clones с `zoneId`, qty из полей зоны.
 * Canonical и другие зоны не трогает; conflicts только внутри зоны.
 */
export function applyFloorPresetToZone(
  lines: readonly EstimateLine[],
  zone: EstimateZone,
  application: FloorPresetApplication,
): ApplyFloorPresetResult {
  const input = floorInputFromZone(zone)
  if (application.presetId === 'room-plan') {
    const plan = resolveFloorRoomPlan(application, input)
    const chosen = new Set(plan.works.map((work) => work.key))
    let next = lines.map((line) =>
      line.zoneId === zone.id && line.source !== 'manual' && ROOM_PLAN_KEYS.has(line.priceKey)
        ? { ...line, enabled: chosen.has(line.priceKey) }
        : line,
    )
    for (const work of plan.works) {
      const existing = next.findIndex(
        (line) => line.zoneId === zone.id && line.priceKey === work.key && line.source !== 'manual',
      )
      if (existing >= 0) {
        next = next.map((line, index) =>
          index === existing
            ? { ...line, enabled: true, quantity: work.quantity, zoneName: zone.name }
            : line,
        )
      } else {
        const created = createZonedFloorEstimateLine({
          priceKey: work.key,
          quantity: work.quantity,
          zoneName: zone.name,
          zoneId: zone.id,
        })
        if (created) next = [...next, created]
      }
    }
    return { lines: next, addedCount: plan.works.length, presetLabel: PRESET_LABELS['room-plan'] }
  }
  const { keys, quantity, presetId } = resolvePresetPlan(application, input)
  const qty = normalizeNonNegative(quantity)
  let next = disableConflictingAlternativesInZone(lines, keys, zone.id)

  for (const priceKey of keys) {
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

    const created = createZonedFloorEstimateLine({
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
    presetLabel: PRESET_LABELS[presetId],
  }
}

export function formatFloorPresetFeedback(label: string, addedCount: number): string {
  return `Выбран сценарий «${label}», добавлено ${addedCount} строк`
}

export function formatFloorPresetZoneFeedback(
  label: string,
  zoneName: string,
  addedCount: number,
): string {
  return `Сценарий «${label}» применён к зоне «${zoneName}», строк: ${addedCount}`
}

function floorInputFromZone(zone: EstimateZone): FloorEstimateInput {
  return {
    totalFloorArea: zone.floorArea,
    plinthLength: resolveFloorPlinthLength(zone) ?? 0,
    demolitionArea: zone.demolitionFloorArea,
    screedArea: zone.screedArea,
    wetZonesArea: zone.wetArea,
    avgDeltaMm: 0,
  }
}

export function resolveFloorPresetKeys(application: FloorPresetApplication): readonly string[] {
  if (application.presetId === 'room-plan')
    return resolveFloorRoomPlan(application, {
      totalFloorArea: 1,
      plinthLength: 1,
      demolitionArea: 1,
      screedArea: 1,
      wetZonesArea: 1,
      avgDeltaMm: 0,
    }).works.map((work) => work.key)
  return resolvePresetPlan(application, {
    totalFloorArea: 0,
    demolitionArea: 0,
    screedArea: 0,
    wetZonesArea: 0,
    avgDeltaMm: 0,
  }).keys
}

function resolvePresetPlan(
  application: Exclude<FloorPresetApplication, { presetId: 'room-plan' }>,
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
    if (isZonedEstimateLine(line)) return line
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
