import type {
  CeilingEstimateInput,
  CeilingScenarioApplication,
  EstimateZone,
  FloorEstimateInput,
  FloorPresetApplication,
  WallEstimateInput,
  WallScenarioApplication,
} from '@/entities/estimate'

export type ScenarioMeasureCheck = { ok: true } | { ok: false; message: string }

const FLOOR_GENERAL =
  'Заполните замеры раздела перед применением сценария'
const FLOOR_ZONE = 'В выбранной зоне нет нужных замеров для этого сценария'
const WALL_GENERAL =
  'Заполните замеры раздела перед применением сценария'
const WALL_ZONE = 'В выбранной зоне нет нужных замеров для этого сценария'
const CEILING_GENERAL =
  'Заполните замеры раздела перед применением сценария'
const CEILING_ZONE = 'В выбранной зоне нет нужных замеров для этого сценария'

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
