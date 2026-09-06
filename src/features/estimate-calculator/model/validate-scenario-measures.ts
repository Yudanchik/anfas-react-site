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
const ELECTRIC_GENERAL =
  'Заполните замеры раздела перед применением сценария'
const ELECTRIC_ZONE = 'В выбранной зоне нет нужных замеров для этого сценария'
const PLUMBING_GENERAL =
  'Заполните замеры раздела перед применением сценария'
const PLUMBING_ZONE = 'В выбранной зоне нет нужных замеров для этого сценария'

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

/** Электрика: проверка счётчиков и совместимости сценария с типом зоны. */
export function validateElectricScenarioMeasures(params: {
  application: ElectricScenarioApplication
  input: ElectricEstimateInput
  zone?: EstimateZone
}): ScenarioMeasureCheck {
  const { application, input, zone } = params
  const forZone = Boolean(zone)

  const zoneType = zone ? zone.zoneType : null
  if (!isElectricScenarioAllowedForZone(application.state, zoneType)) {
    return {
      ok: false,
      message: formatElectricScenarioZoneMismatchMessage(application.state),
    }
  }

  const fail = (): ScenarioMeasureCheck => ({
    ok: false,
    message: forZone ? ELECTRIC_ZONE : ELECTRIC_GENERAL,
  })

  const sockets = zone ? zone.electricSocketsCount : input.electricSocketsCount
  const switches = zone ? zone.electricSwitchesCount : input.electricSwitchesCount
  const lights = zone ? zone.electricLightPointsCount : input.electricLightPointsCount
  const data = zone ? zone.electricDataPointsCount : input.electricDataPointsCount
  const strobe = zone ? zone.electricStrobeLength : input.electricStrobeLength
  const cable = zone ? zone.electricCableLength : input.electricCableLength
  const boxes = zone ? zone.electricSocketBoxesCount : input.electricSocketBoxesCount
  const junctions = zone ? zone.electricJunctionBoxesCount : input.electricJunctionBoxesCount
  const warmFloor = zone ? zone.electricWarmFloorArea : input.electricWarmFloorArea
  const appliances = zone
    ? zone.electricApplianceConnectionsCount
    : input.electricApplianceConnectionsCount

  const pointsAndRoutes = [sockets, switches, lights, data, strobe, cable, boxes, junctions]

  switch (application.state) {
    case 'demolition-only':
    case 'panel-only':
      return { ok: true }
    case 'lighting-only':
      return positive(lights) ? { ok: true } : fail()
    case 'outlets-switches':
      return anyPositive([sockets, switches]) ? { ok: true } : fail()
    case 'low-current':
      return anyPositive([data, cable]) ? { ok: true } : fail()
    case 'kitchen':
      return anyPositive([...pointsAndRoutes, appliances]) ? { ok: true } : fail()
    case 'bathroom':
      return anyPositive([...pointsAndRoutes, appliances, warmFloor]) ? { ok: true } : fail()
    case 'room-rewire':
    case 'apartment-from-scratch':
      return anyPositive(pointsAndRoutes) ? { ok: true } : fail()
  }
}

/** Сантехника: проверка счётчиков и совместимости сценария с типом зоны. */
export function validatePlumbingScenarioMeasures(params: {
  application: PlumbingScenarioApplication
  input: PlumbingEstimateInput
  zone?: EstimateZone
}): ScenarioMeasureCheck {
  const { application, input, zone } = params
  const forZone = Boolean(zone)

  const zoneType = zone ? zone.zoneType : null
  if (!isPlumbingScenarioAllowedForZone(application.state, zoneType)) {
    return {
      ok: false,
      message: formatPlumbingScenarioZoneMismatchMessage(application.state),
    }
  }

  const fail = (): ScenarioMeasureCheck => ({
    ok: false,
    message: forZone ? PLUMBING_ZONE : PLUMBING_GENERAL,
  })

  const waterPoints = zone ? zone.plumbingWaterPointsCount : input.plumbingWaterPointsCount
  const sewerPoints = zone ? zone.plumbingSewerPointsCount : input.plumbingSewerPointsCount
  const waterPipe = zone ? zone.plumbingWaterPipeLength : input.plumbingWaterPipeLength
  const sewerPipe = zone ? zone.plumbingSewerPipeLength : input.plumbingSewerPipeLength
  const collectors = zone ? zone.plumbingCollectorsCount : input.plumbingCollectorsCount
  const toilets = zone ? zone.plumbingToiletsCount : input.plumbingToiletsCount
  const sinks = zone ? zone.plumbingSinksCount : input.plumbingSinksCount
  const bathtubs = zone ? zone.plumbingBathtubsCount : input.plumbingBathtubsCount
  const showers = zone ? zone.plumbingShowersCount : input.plumbingShowersCount
  const mixers = zone ? zone.plumbingMixersCount : input.plumbingMixersCount
  const installations = zone ? zone.plumbingInstallationsCount : input.plumbingInstallationsCount
  const drains = zone ? zone.plumbingDrainsCount : input.plumbingDrainsCount
  const washer = zone
    ? zone.plumbingWasherConnectionsCount
    : input.plumbingWasherConnectionsCount
  const dishwasher = zone
    ? zone.plumbingDishwasherConnectionsCount
    : input.plumbingDishwasherConnectionsCount
  const heaters = zone ? zone.plumbingWaterHeatersCount : input.plumbingWaterHeatersCount
  const towelWarmers = zone ? zone.plumbingTowelWarmersCount : input.plumbingTowelWarmersCount
  const warmFloor = zone ? zone.plumbingWarmFloorArea : input.plumbingWarmFloorArea

  const points = [waterPoints, sewerPoints]
  const pipes = [waterPipe, sewerPipe]
  const fixtures = [
    toilets,
    sinks,
    bathtubs,
    showers,
    mixers,
    installations,
    drains,
    washer,
    dishwasher,
    heaters,
    towelWarmers,
  ]

  switch (application.state) {
    case 'demolition-only':
    case 'manifold':
      return { ok: true }
    case 'drainage-only':
      return anyPositive([sewerPipe, sewerPoints, drains]) ? { ok: true } : fail()
    case 'water-supply-only':
      return anyPositive([waterPipe, waterPoints, collectors]) ? { ok: true } : fail()
    case 'fixtures-only':
      return anyPositive(fixtures) ? { ok: true } : fail()
    case 'bath-zone':
      return anyPositive([bathtubs, showers, mixers, drains]) ? { ok: true } : fail()
    case 'toilet-zone':
      return anyPositive([toilets, installations, waterPoints, sewerPoints]) ? { ok: true } : fail()
    case 'kitchen':
      return anyPositive([sinks, dishwasher, washer, waterPoints, sewerPoints, ...pipes])
        ? { ok: true }
        : fail()
    case 'bathroom-replacement':
      return anyPositive([toilets, sinks, bathtubs, showers, mixers]) ? { ok: true } : fail()
    case 'bathroom-from-scratch':
      return anyPositive([...points, ...pipes, ...fixtures, warmFloor]) ? { ok: true } : fail()
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
