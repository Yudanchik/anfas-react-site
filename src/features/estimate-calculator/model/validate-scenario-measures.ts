import type {
  CeilingEstimateInput,
  CeilingScenarioApplication,
  ElectricEstimateInput,
  ElectricScenarioApplication,
  EstimateZone,
  FloorEstimateInput,
  FloorPresetApplication,
  PlumbingEstimateInput,
  PlumbingScenarioApplication,
  TileEstimateInput,
  TileScenarioApplication,
  WallEstimateInput,
  WallScenarioApplication,
} from '@/entities/estimate'
import {
  formatElectricScenarioZoneMismatchMessage,
  formatPlumbingScenarioZoneMismatchMessage,
  formatTileScenarioZoneMismatchMessage,
  isElectricScenarioAllowedForZone,
  isPlumbingScenarioAllowedForZone,
  isTileScenarioAllowedForZone,
  resolveMeasuredElectricScenarioKeys,
  resolveElectricScenarioPlan,
  resolveCeilingScenarioPlan,
  resolveMeasuredPlumbingScenarioKeys,
  resolvePlumbingScenarioPlan,
  resolveFloorRoomPlan,
  tilePreparationIssue,
  electricInputFromZone,
  plumbingInputFromZone,
} from '@/entities/estimate'

export type ScenarioMeasureCheck = { ok: true } | { ok: false; message: string }

/** Короткая подсказка у disabled-кнопки «Применить» (без громкой ошибки). */
export const SCENARIO_MEASURES_HINT_GENERAL = 'Заполните замеры раздела'
export const SCENARIO_MEASURES_HINT_ZONE = 'В выбранной зоне нет нужных замеров'

const FLOOR_GENERAL = 'Заполните замеры раздела перед применением сценария'
const FLOOR_ZONE = 'В выбранной зоне нет нужных замеров для этого сценария'
const WALL_GENERAL = 'Заполните замеры раздела перед применением сценария'
const WALL_ZONE = 'В выбранной зоне нет нужных замеров для этого сценария'

export function getScenarioMeasuresDisabledHint(forZone: boolean): string {
  return forZone ? SCENARIO_MEASURES_HINT_ZONE : SCENARIO_MEASURES_HINT_GENERAL
}

function positive(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

function anyPositive(values: readonly number[]): boolean {
  return values.some(positive)
}

/** Полы: проверка замеров перед пресетом (waste всегда ок). */
export function validateFloorPresetMeasures(params: {
  application: FloorPresetApplication
  input: FloorEstimateInput
  zone?: EstimateZone
}): ScenarioMeasureCheck {
  const { application, input, zone } = params
  const forZone = Boolean(zone)
  const fail = (): ScenarioMeasureCheck => ({
    ok: false,
    message: forZone ? FLOOR_ZONE : FLOOR_GENERAL,
  })

  if (application.presetId === 'room-plan') {
    const measured: FloorEstimateInput = zone
      ? {
          totalFloorArea: zone.floorArea,
          demolitionArea: zone.demolitionFloorArea,
          screedArea: zone.screedArea,
          wetZonesArea: zone.wetArea,
          avgDeltaMm: 0,
        }
      : input
    const plan = resolveFloorRoomPlan(application, measured)
    return plan.issues.length ? { ok: false, message: plan.issues.join(' ') } : { ok: true }
  }

  if (application.presetId === 'waste') return { ok: true }

  if (application.presetId === 'demolition-covering') {
    const area = zone ? zone.demolitionFloorArea : input.demolitionArea
    return positive(area) ? { ok: true } : fail()
  }

  if (application.presetId === 'wet-zones') {
    const area = zone ? zone.wetArea : input.wetZonesArea
    return positive(area) ? { ok: true } : fail()
  }

  // screed-on-slab / self-leveling
  if (zone) {
    return anyPositive([zone.screedArea, zone.floorArea]) ? { ok: true } : fail()
  }
  return anyPositive([input.screedArea, input.totalFloorArea]) ? { ok: true } : fail()
}

/** Стены: проверка замеров перед сценарием. */
export function validateWallScenarioMeasures(params: {
  application: WallScenarioApplication
  input: WallEstimateInput
  zone?: EstimateZone
}): ScenarioMeasureCheck {
  const { application, input, zone } = params
  const forZone = Boolean(zone)
  const fail = (): ScenarioMeasureCheck => ({
    ok: false,
    message: forZone ? WALL_ZONE : WALL_GENERAL,
  })

  const demolition = zone ? zone.demolitionWallArea : input.demolitionArea
  const total = zone ? zone.wallArea : input.totalWallArea
  const plaster = zone ? zone.plasterArea : input.plasterArea
  const putty = zone ? zone.puttyArea : input.puttyArea
  const finish = zone ? zone.finishArea : input.finishArea
  const slopes = zone ? zone.slopesLength : input.slopesLengthM
  if (application.substrate === 'drywall' && application.state !== 'finish-only' &&
    application.state !== 'demolition-only') {
    if (!positive(total)) return { ok: false, message: 'Укажите площадь стен ГКЛ, м².' }
    const seams = zone ? zone.gklWallSeamsLength : input.gklSeamsLengthM
    if ((application.gklConstruction !== 'existing' || !application.gklSeamsReady) &&
      !positive(seams ?? 0)) return {
      ok: false, message: 'Укажите длину стыков листов ГКЛ на стенах, м. пог., либо подтвердите, что швы уже готовы.',
    }
  }
  if (application.slopesWork && application.slopesWork !== 'none' && !positive(slopes))
    return fail()

  switch (application.state) {
    case 'demolition-only':
      return anyPositive([demolition, total]) ? { ok: true } : fail()
    case 'local-leveling':
      return anyPositive([putty, plaster, total]) ? { ok: true } : fail()
    case 'finish-only':
      return anyPositive([finish, putty, total]) ? { ok: true } : fail()
    case 'after-demolition':
      return anyPositive([total, plaster, putty]) ? { ok: true } : fail()
    case 'from-scratch':
    case 'prefinish':
      return anyPositive([total, plaster, putty]) ? { ok: true } : fail()
  }
}

/** Потолки: проверка замеров перед сценарием. */
export function validateCeilingScenarioMeasures(params: {
  application: CeilingScenarioApplication
  input: CeilingEstimateInput
  zone?: EstimateZone
}): ScenarioMeasureCheck {
  const { application, input, zone } = params
  const fail = (): ScenarioMeasureCheck => ({
    ok: false,
    message:
      application.state === 'demolition-only'
        ? 'Укажите «Демонтаж потолков», м².'
        : 'Укажите «Площадь потолков», м², или отдельную площадь выбранной работы.',
  })

  const plan = resolveCeilingScenarioPlan(application)
  if (plan.issues.length) return { ok: false, message: plan.issues.join(' ') }

  const demolition = zone ? zone.demolitionCeilingArea : input.demolitionArea
  const total = zone ? zone.ceilingArea : input.totalCeilingArea
  const plaster = zone ? zone.plasterCeilingArea : input.plasterArea
  const putty = zone ? zone.puttyCeilingArea : input.puttyArea
  const finish = zone ? zone.finishCeilingArea : input.finishArea
  if (application.substrate === 'drywall' && application.state !== 'finish-only' &&
    application.state !== 'demolition-only') {
    if (!positive(total)) return { ok: false, message: 'Укажите площадь потолка ГКЛ, м².' }
    const seams = zone ? zone.gklCeilingSeamsLength : input.gklSeamsLengthM
    if ((application.gklConstruction !== 'existing' || !application.gklSeamsReady) &&
      !positive(seams ?? 0)) return {
      ok: false, message: 'Укажите длину стыков листов ГКЛ на потолке, м. пог., либо подтвердите, что швы уже готовы.',
    }
  }

  switch (application.state) {
    case 'demolition-only':
      return positive(demolition) ? { ok: true } : fail()
    case 'local-leveling':
      return anyPositive([putty, total]) ? { ok: true } : fail()
    case 'finish-only':
      return anyPositive([finish, putty, total]) ? { ok: true } : fail()
    case 'after-demolition':
      return anyPositive([total, plaster, putty]) ? { ok: true } : fail()
    case 'from-scratch':
    case 'prefinish':
      return anyPositive([total, plaster, putty]) ? { ok: true } : fail()
  }
}

/** Плитка: проверка замеров и совместимости сценария с типом зоны. */
export function validateTileScenarioMeasures(params: {
  application: TileScenarioApplication
  input: TileEstimateInput
  zone?: EstimateZone
}): ScenarioMeasureCheck {
  const { application, input, zone } = params

  const preparationIssue = tilePreparationIssue(application)
  if (preparationIssue) return { ok: false, message: preparationIssue }

  const zoneType = zone ? zone.zoneType : null
  if (!isTileScenarioAllowedForZone(application.state, zoneType)) {
    return {
      ok: false,
      message: formatTileScenarioZoneMismatchMessage(application.state),
    }
  }

  const fail = (): ScenarioMeasureCheck => ({
    ok: false,
    message:
      application.state === 'floor-only'
        ? 'Укажите «Плитка пола», м².'
        : application.state === 'walls-only'
          ? 'Укажите «Плитка стен», м².'
          : application.state === 'kitchen-backsplash'
            ? 'Укажите «Фартук», м².'
            : application.state === 'grout-repair-only' && application.grout === 'none'
              ? 'Укажите «Замена плитки», шт.'
              : application.state === 'demolition-only' &&
                  application.demolitionSurfaces === 'floor'
                ? 'Укажите площадь демонтируемой плитки в «Плитка пола», м².'
                : application.state === 'demolition-only' &&
                    application.demolitionSurfaces === 'walls'
                  ? 'Укажите площадь демонтируемой плитки в «Плитка стен», м².'
                  : 'Укажите площадь нужной поверхности: «Плитка пола», «Плитка стен» или «Фартук», м²; для ремонта — количество плиток.',
  })

  const floor = zone ? zone.tileFloorArea : input.floorTileArea
  const wall = zone ? zone.tileWallArea : input.wallTileArea
  const backsplash = zone ? zone.tileBacksplashArea : input.backsplashArea
  const cutting = zone ? zone.tileCuttingLength : input.cuttingLength
  const corner = zone ? zone.tileCornerLength : input.cornerLength
  const holes = zone ? zone.tileHolesCount : input.holesCount
  const repair = zone ? zone.tileRepairCount : input.repairCount
  const clad = [floor, wall, backsplash]

  switch (application.state) {
    case 'demolition-only': {
      const surfaces = application.demolitionSurfaces ?? 'both'
      if (surfaces === 'floor') return positive(floor) ? { ok: true } : fail()
      if (surfaces === 'walls') return positive(wall) ? { ok: true } : fail()
      return anyPositive([floor, wall]) ? { ok: true } : fail()
    }
    case 'kitchen-backsplash':
      return positive(backsplash) ? { ok: true } : fail()
    case 'floor-only':
      return positive(floor) ? { ok: true } : fail()
    case 'walls-only':
      return positive(wall) ? { ok: true } : fail()
    case 'grout-repair-only': {
      const grout = application.grout ?? 'cement'
      if (grout === 'none') return positive(repair) ? { ok: true } : fail()
      return anyPositive([...clad, corner]) ? { ok: true } : fail()
    }
    case 'large-format':
      return anyPositive([...clad, cutting, holes]) ? { ok: true } : fail()
    case 'bathroom-from-scratch':
    case 'bathroom-replacement':
      return anyPositive([floor, wall]) ? { ok: true } : fail()
  }
}

/** Электрика: проверка счётчиков и совместимости сценария с типом зоны. */
export function validateElectricScenarioMeasures(params: {
  application: ElectricScenarioApplication
  input: ElectricEstimateInput
  zone?: EstimateZone
}): ScenarioMeasureCheck {
  const { application, input, zone } = params

  const zoneType = zone ? zone.zoneType : null
  if (!isElectricScenarioAllowedForZone(application.state, zoneType)) {
    return {
      ok: false,
      message: formatElectricScenarioZoneMismatchMessage(application.state),
    }
  }

  const fail = (): ScenarioMeasureCheck => ({
    ok: false,
    message:
      application.state === 'demolition-only'
        ? 'Заполните «Демонтаж старой электрики»: старые розетки/выключатели, светильники (шт.) или кабель (м).'
        : application.state === 'outlets-switches'
          ? 'Укажите новые «Розетки» или «Выключатели», шт.; для установочных мест — «Подрозетники».'
          : application.state === 'lighting-only'
            ? 'Укажите «Световые точки», шт., или «Кабель», м.'
            : application.state === 'panel-only'
              ? 'Укажите «Модули щита» по схеме электрощита.'
              : application.state === 'low-current'
                ? 'Укажите «Слаботочка», шт., или «Кабель», м.'
                : 'Заполните объёмы выбранной электрики: новые розетки/выключатели/световые точки (шт.), кабель/штробы (м), либо модули щита по составу работ.',
  })

  const measuredInput = zone ? electricInputFromZone(zone) : input
  if (
    application.cableRoute === 'mixed' &&
    !(
      (measuredInput.electricCableOpenLength ?? 0) > 0 ||
      (measuredInput.electricCableChaseLength ?? 0) > 0
    )
  )
    return {
      ok: false,
      message:
        'Заполните «Разделить кабель по способам прокладки»: кабель открыто и/или в штробе, м. Общий метраж не определяет доли маршрута.',
    }

  const plan = resolveElectricScenarioPlan(application)
  if (plan.issues.length) return { ok: false, message: plan.issues.join(' ') }

  const measured = resolveMeasuredElectricScenarioKeys(
    application,
    zone ? electricInputFromZone(zone) : input,
  )
  return measured.length > 0 ? { ok: true } : fail()
}

/** Сантехника: проверка счётчиков и совместимости сценария с типом зоны. */
export function validatePlumbingScenarioMeasures(params: {
  application: PlumbingScenarioApplication
  input: PlumbingEstimateInput
  zone?: EstimateZone
}): ScenarioMeasureCheck {
  const { application, input, zone } = params

  const zoneType = zone ? zone.zoneType : null
  if (!isPlumbingScenarioAllowedForZone(application.state, zoneType)) {
    return {
      ok: false,
      message: formatPlumbingScenarioZoneMismatchMessage(application.state),
    }
  }

  const fail = (): ScenarioMeasureCheck => ({
    ok: false,
    message:
      application.state === 'manifold'
        ? 'Укажите «Коллекторы», шт.'
        : application.state === 'water-supply-only'
          ? 'Укажите «Водорозетки», шт., или длину водопроводных труб, м.'
          : application.state === 'drainage-only'
            ? 'Укажите «Выводы канализации», шт., или длину канализационных труб, м.'
            : application.state === 'toilet-zone'
              ? 'Укажите «Унитазы», шт., и тип унитаза; новые рамы — в «Инсталляции».'
              : application.state === 'bath-zone'
                ? 'Укажите «Ванны» или «Души», шт., и их тип.'
                : application.state === 'fixtures-only'
                  ? 'Укажите приборы, которые нужно подключить: унитазы, раковины, ванны, души, стиральные/посудомоечные машины, шт.'
                  : 'Укажите относящиеся к этому сценарию приборы (шт.), выводы воды/канализации (шт.) или длины труб (м).',
  })

  const plan = resolvePlumbingScenarioPlan(application, zone ? plumbingInputFromZone(zone) : input)
  if (plan.issues.length) return { ok: false, message: plan.issues.join(' ') }

  const measured = resolveMeasuredPlumbingScenarioKeys(
    application,
    zone ? plumbingInputFromZone(zone) : input,
  )
  return measured.length > 0 ? { ok: true } : fail()
}

/** Lightweight wrappers for UI disabled-state (reuse validate*). */
export function canApplyFloorPreset(params: {
  application: FloorPresetApplication
  input: FloorEstimateInput
  zone?: EstimateZone
}): boolean {
  return validateFloorPresetMeasures(params).ok
}

export function canApplyWallScenario(params: {
  application: WallScenarioApplication
  input: WallEstimateInput
  zone?: EstimateZone
}): boolean {
  return validateWallScenarioMeasures(params).ok
}

export function canApplyCeilingScenario(params: {
  application: CeilingScenarioApplication
  input: CeilingEstimateInput
  zone?: EstimateZone
}): boolean {
  return validateCeilingScenarioMeasures(params).ok
}

export function canApplyTileScenario(params: {
  application: TileScenarioApplication
  input: TileEstimateInput
  zone?: EstimateZone
}): boolean {
  return validateTileScenarioMeasures(params).ok
}

export function canApplyElectricScenario(params: {
  application: ElectricScenarioApplication
  input: ElectricEstimateInput
  zone?: EstimateZone
}): boolean {
  return validateElectricScenarioMeasures(params).ok
}

export function canApplyPlumbingScenario(params: {
  application: PlumbingScenarioApplication
  input: PlumbingEstimateInput
  zone?: EstimateZone
}): boolean {
  return validatePlumbingScenarioMeasures(params).ok
}
