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
export type WallSlopesWorkOption = 'none' | 'putty-paint' | 'sandwich'
export type WallSubstrateOption = 'absorbent' | 'dense' | 'plastered' | 'drywall' | 'unknown'
export type WallLevelingOption = 'full' | 'local' | 'none'
export type WallMoistureOption = 'normal' | 'wet'
export type WallQualityOption = 'q2' | 'q3' | 'q4'
export type WallBaseConditionOption = 'unknown' | 'sound' | 'loose'
export type WallScenarioApplyMode = 'replace' | 'add'

export type WallScenarioApplication = {
  state: WallStateOption
  finishTarget: WallFinishTargetOption
  demolitionCovering?: WallDemolitionCoveringOption
  /** Снять старое покрытие до полного цикла подготовки. */
  demolitionBeforeWork?: boolean
  wallpaperType?: WallWallpaperTypeOption
  paintLayers?: WallPaintLayersOption
  slopesWork?: WallSlopesWorkOption
  substrate?: WallSubstrateOption
  leveling?: WallLevelingOption
  moisture?: WallMoistureOption
  quality?: WallQualityOption
  reinforce?: boolean
  baseCondition?: WallBaseConditionOption
}

export type WallScenarioPlan = {
  /** Работы, которые можно определить по уже данным ответам. */
  keys: readonly string[]
  /** Пока эти вопросы не решены, черновик нельзя считать готовым к применению. */
  issues: readonly string[]
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
const SCENARIO_SLOPE_KEYS = new Set([
  'putty-slopes-2', 'putty-sanding-slopes', 'paint-slopes-roller-2', 'slopes-sandwich',
])

function disableOtherSlopeWorks(lines: readonly EstimateLine[], keys: readonly string[], zoneId: string | null): EstimateLine[] {
  const selected = new Set(keys)
  return lines.map((line) => {
    const belongsToZone = zoneId === null ? !isZonedEstimateLine(line) :
      isZonedEstimateLine(line) && line.zoneId === zoneId
    return belongsToZone && line.source !== 'manual' && SCENARIO_SLOPE_KEYS.has(line.priceKey) && !selected.has(line.priceKey)
      ? { ...line, enabled: false }
      : line
  })
}

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
  mode: WallScenarioApplyMode = 'add',
): ApplyWallScenarioResult {
  const input = wallInputFromZone(zone)
  const keys = resolveWallScenarioKeys(application)
  const previous = zone.wallScenario?.applications ?? (zone.wallScenario ? [zone.wallScenario.application] : [])
  const previousKeys = new Set(previous.flatMap((item) => resolveWallScenarioKeys(item)))
  const legacyKeysRemoved = new Set<string>()
  const base = mode === 'replace' ? lines.filter((line) => {
    if (line.zoneId !== zone.id || line.source === 'manual') return true
    if (line.scenarioManaged) return false
    // Снимки, созданные до признака scenarioManaged: удаляем не более одной
    // совпавшей строки на работу. Дополнительные строки из прайса сохраняем.
    if (previousKeys.has(line.priceKey) && !legacyKeysRemoved.has(line.priceKey) &&
      !line.comment && !line.priceEdited) {
      legacyKeysRemoved.add(line.priceKey)
      return false
    }
    return true
  }) : [...lines]
  const protectedLines = new Map(base.filter((line) => line.zoneId === zone.id &&
    !line.scenarioManaged && !previousKeys.has(line.priceKey)).map((line) => [line.id, line]))
  let next = disableWallConflictingAlternativesInZone(
    disableOtherSlopeWorks(base, keys, zone.id), keys, zone.id,
  ).map((line) => protectedLines.has(line.id)
    ? { ...line, enabled: protectedLines.get(line.id)!.enabled } : line)

  for (const priceKey of keys) {
    const mappingItem = MAPPING_BY_ID.get(priceKey)
    const field = resolveScenarioQuantityField(mappingItem?.kind, mappingItem?.defaultQuantityFrom)
    const qty = resolveScenarioQuantity(field, input)

    const existingIndex = next.findIndex(
      (line) =>
        isZonedEstimateLine(line) &&
        line.zoneId === zone.id &&
        line.priceKey === priceKey &&
        line.scenarioManaged === true,
    )
    const legacyIndex = existingIndex < 0 && mode === 'add' && previousKeys.has(priceKey)
      ? next.findIndex((line) => line.zoneId === zone.id && line.priceKey === priceKey &&
        line.source !== 'manual' && !line.comment && !line.priceEdited)
      : -1
    const matchIndex = existingIndex >= 0 ? existingIndex : legacyIndex

    if (matchIndex >= 0) {
      const existing = next[matchIndex]
      next = next.map((line, index) =>
        index === matchIndex
          ? {
              ...existing,
              enabled: true,
              quantity: qty > 0 ? qty : existing.quantity,
              zoneName: zone.name,
              zoneId: zone.id,
              scenarioManaged: true,
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
    if (created) next = [...next, { ...created, scenarioManaged: true }]
  }

  return {
    lines: next,
    addedCount: keys.length,
    scenarioLabel: formatWallScenarioLabel(application),
    enabledPriceKeys: keys,
  }
}

/** В общем сценарии откосы добавляются только там, где для них есть объём. */
export function wallScenarioForZone(
  application: WallScenarioApplication,
  zone: EstimateZone,
): WallScenarioApplication {
  return application.slopesWork && application.slopesWork !== 'none' && zone.slopesLength <= 0
    ? { ...application, slopesWork: 'none' }
    : application
}

export function resolveWallScenarioKeys(
  application: WallScenarioApplication,
): readonly string[] {
  if (application.substrate !== undefined) return resolveWallScenarioPlan(application).keys
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
      if (application.demolitionBeforeWork) {
        keys.push(DEMOLITION_KEYS[application.demolitionCovering ?? 'wallpaper'], 'prep-dust-removal')
      }
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

  if (state !== 'demolition-only') {
    if (application.slopesWork === 'putty-paint') {
      keys.push('putty-slopes-2', 'putty-sanding-slopes', 'paint-slopes-roller-2')
    }
    if (application.slopesWork === 'sandwich') keys.push('slopes-sandwich')
  }

  // Без дублей, порядок включения сохраняем
  return [...new Set(keys)]
}

/** Новый маршрут: частичный предпросмотр остаётся видимым даже при вопросах к основанию.
 * Старые сметы без substrate продолжают использовать прежний состав. */
export function resolveWallScenarioPlan(application: WallScenarioApplication): WallScenarioPlan {
  const { state, finishTarget, substrate, moisture = 'normal', quality = 'q2' } = application
  const keys: string[] = []
  const issues: string[] = []
  if (state === 'demolition-only') return {
    keys: [DEMOLITION_KEYS[application.demolitionCovering ?? 'wallpaper']], issues,
  }
  if (state === 'finish-only' && finishTarget === 'none') issues.push(
    'Для маршрута «только финиш» выберите обои или окраску.',
  )

  if (state === 'from-scratch' && application.demolitionBeforeWork) {
    keys.push(DEMOLITION_KEYS[application.demolitionCovering ?? 'wallpaper'])
  }
  // Обеспыливание остаётся видимым как определившаяся операция,
  // даже если последующая технология требует уточнения на объекте.
  if (state !== 'finish-only') keys.push('prep-dust-removal')
  if (substrate === 'unknown') issues.push('Осмотрите материал стены: до этого нельзя выбрать грунт и способ выравнивания.')
  if (application.baseCondition !== 'sound') issues.push(application.baseCondition === 'loose'
    ? 'Сначала определите причину сырости и объём удаления рыхлых участков; типовая отделка по ним ненадёжна.'
    : 'Проверьте прочность и сухость основания на объекте.')
  if (substrate === 'drywall' && state !== 'finish-only') issues.push(
    'Для ГКЛ нужны заделка швов с лентой и проверка крепления. В прайсе есть только расшивка незаводских швов без измеренной длины; полную систему автоматически оценить нельзя.',
  )
  if (state === 'prefinish' && substrate !== 'plastered') issues.push(
    'Маршрут «стены уже оштукатурены» подходит только для готовой прочной штукатурки.',
  )
  if (moisture === 'wet' && (substrate === 'plastered' || substrate === 'drywall' ||
    application.leveling !== 'full' || (state !== 'from-scratch' && state !== 'after-demolition'))) issues.push(
    'Для этого основания в зоне прямой воды нужна отдельно согласованная влагостойкая система.',
  )
  if (moisture === 'wet' && finishTarget !== 'none') issues.push(
    'В зоне прямой воды этот сценарий считает только черновую основу. Гидроизоляцию и покрытие подберите отдельно.',
  )
  if (finishTarget === 'paint' && quality === 'q2' && state !== 'finish-only') issues.push(
    'Q2 подходит для фактурной краски; для гладкой матовой выберите Q3, для глянцевой — Q4.',
  )
  if (finishTarget === 'wallpaper' && quality === 'q2' &&
    (application.wallpaperType === 'photo' || application.wallpaperType === 'textile-match')) issues.push(
    'Для тонких фото- или тканевых обоев уточните более гладкую подготовку, обычно не ниже Q3.',
  )
  if ((state === 'from-scratch' || state === 'after-demolition') && application.leveling === 'none' &&
    substrate !== 'plastered' && substrate !== 'drywall') issues.push(
    'Без выравнивания на необработанном основании сначала подтвердите плоскость и совместимость шпаклёвки.',
  )
  const readyForPreparation = substrate !== 'unknown' && application.baseCondition === 'sound' &&
    !(substrate === 'drywall' && state !== 'finish-only') &&
    !(state === 'prefinish' && substrate !== 'plastered')
  const needsReinforcement = application.reinforce === true && finishTarget === 'paint'
  if (state === 'local-leveling') {
    if (readyForPreparation && moisture === 'normal') keys.push('putty-local-3mm', 'putty-sanding')
  } else if (state !== 'finish-only' && readyForPreparation) {
    if (application.leveling === 'full' && state !== 'prefinish') {
      keys.push(moisture === 'wet' ? 'primer-one-layer' : 'primer-gypsum-plaster')
      keys.push(moisture === 'wet' ? 'plaster-cement-beacons' : 'plaster-gypsum-beacons')
      keys.push(moisture === 'wet' ? 'plaster-cement-main' : 'plaster-gypsum-main')
    } else if (application.leveling === 'local') {
      keys.push(substrate === 'plastered' ? 'primer-deep-penetration' : 'primer-gypsum-plaster')
      keys.push(substrate === 'plastered' ? 'plaster-local-fix' : 'plaster-gypsum-main')
    }
    if (moisture === 'normal') {
      if (application.leveling === 'none' || state === 'prefinish') keys.push('primer-deep-penetration')
      keys.push(quality === 'q2' ? 'putty-base-1' : 'putty-base-2')
      if (needsReinforcement) keys.push('reinforce-glassfiber')
      if (quality === 'q3' || quality === 'q4' || needsReinforcement) {
        keys.push(quality === 'q4' ? 'putty-finish-2' : 'putty-finish-1')
      }
      keys.push('putty-sanding')
    }
  }

  if (finishTarget !== 'none' && state !== 'local-leveling' && moisture === 'normal' &&
    (readyForPreparation || state === 'finish-only')) {
    if (state !== 'finish-only') keys.push('primer-one-layer')
    keys.push(finishTarget === 'wallpaper'
      ? WALLPAPER_KEYS[application.wallpaperType ?? 'flizelin']
      : PAINT_KEYS[application.paintLayers ?? 'paint-2'])
  }
  if (application.slopesWork === 'putty-paint' && moisture === 'normal') {
    keys.push('putty-slopes-2', 'putty-sanding-slopes', 'paint-slopes-roller-2')
  } else if (application.slopesWork === 'sandwich' && moisture === 'normal') keys.push('slopes-sandwich')
  return { keys: [...new Set(keys)], issues }
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
  let base = application.demolitionBeforeWork && state === 'from-scratch'
    ? 'Демонтаж и стены с нуля'
    : STATE_LABELS[state]
  if (application.substrate !== undefined) {
    if (application.leveling === 'local' && (state === 'from-scratch' || state === 'after-demolition')) base += ' · локальное выравнивание'
    if (application.leveling === 'none' && (state === 'from-scratch' || state === 'after-demolition')) base += ' · без штукатурки'
    if (application.moisture === 'wet') base += ' · мокрая зона'
  }
  if (finishTarget === 'none') return `${base} (${FINISH_LABELS.none})`
  return `${base} ${FINISH_LABELS[finishTarget]}`
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
    demolitionArea: zone.demolitionWallArea > 0 ? zone.demolitionWallArea : zone.wallArea,
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
  const withConflictsDisabled = disableWallConflictingAlternatives(
    disableOtherSlopeWorks(lines, keys, null), keys,
  )

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
    case 'demolitionArea':
      return input.demolitionArea > 0 ? input.demolitionArea : input.totalWallArea
    case 'totalWallArea':
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
