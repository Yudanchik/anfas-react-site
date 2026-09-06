import type {
  CeilingEstimateInput,
  CeilingScenarioApplication,
  EstimateZone,
  FloorEstimateInput,
  FloorPresetApplication,
  TileEstimateInput,
  TileScenarioApplication,
  WallEstimateInput,
  WallScenarioApplication,
} from '@/entities/estimate'
import {
  formatTileScenarioZoneMismatchMessage,
  isTileScenarioAllowedForZone,
} from '@/entities/estimate'

export type ScenarioMeasureCheck = { ok: true } | { ok: false; message: string }

/** Короткая подсказка у disabled-кнопки «Применить» (без громкой ошибки). */
export const SCENARIO_MEASURES_HINT_GENERAL = 'Заполните замеры раздела'
export const SCENARIO_MEASURES_HINT_ZONE = 'В выбранной зоне нет нужных замеров'

const FLOOR_GENERAL =
  'Заполните замеры раздела перед применением сценария'
const FLOOR_ZONE = 'В выбранной зоне нет нужных замеров для этого сценария'
const WALL_GENERAL =
  'Заполните замеры раздела перед применением сценария'
const WALL_ZONE = 'В выбранной зоне нет нужных замеров для этого сценария'
const CEILING_GENERAL =
  'Заполните замеры раздела перед применением сценария'
const CEILING_ZONE = 'В выбранной зоне нет нужных замеров для этого сценария'
const TILE_GENERAL =
  'Заполните замеры раздела перед применением сценария'
const TILE_ZONE = 'В выбранной зоне нет нужных замеров для этого сценария'

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

  switch (application.state) {
    case 'demolition-only':
      return positive(demolition) ? { ok: true } : fail()
    case 'local-leveling':
      return anyPositive([putty, plaster, total]) ? { ok: true } : fail()
    case 'finish-only':
      return anyPositive([finish, putty, total]) ? { ok: true } : fail()
    case 'after-demolition':
      return positive(demolition) && anyPositive([total, plaster, putty])
        ? { ok: true }
        : fail()
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
  const forZone = Boolean(zone)
  const fail = (): ScenarioMeasureCheck => ({
    ok: false,
    message: forZone ? CEILING_ZONE : CEILING_GENERAL,
  })

  const demolition = zone ? zone.demolitionCeilingArea : input.demolitionArea
  const total = zone ? zone.ceilingArea : input.totalCeilingArea
  const plaster = zone ? zone.plasterCeilingArea : input.plasterArea
  const putty = zone ? zone.puttyCeilingArea : input.puttyArea
  const finish = zone ? zone.finishCeilingArea : input.finishArea

  switch (application.state) {
    case 'demolition-only':
      return positive(demolition) ? { ok: true } : fail()
    case 'local-leveling':
      return anyPositive([putty, total]) ? { ok: true } : fail()
    case 'finish-only':
      return anyPositive([finish, putty, total]) ? { ok: true } : fail()
    case 'after-demolition':
      return positive(demolition) && anyPositive([total, plaster, putty])
        ? { ok: true }
        : fail()
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
  const forZone = Boolean(zone)

  const zoneType = zone ? zone.zoneType : null
  if (!isTileScenarioAllowedForZone(application.state, zoneType)) {
    return {
      ok: false,
      message: formatTileScenarioZoneMismatchMessage(application.state),
    }
  }

  const fail = (): ScenarioMeasureCheck => ({
    ok: false,
    message: forZone ? TILE_ZONE : TILE_GENERAL,
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
