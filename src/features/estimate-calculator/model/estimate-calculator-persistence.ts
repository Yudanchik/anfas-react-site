import {
  buildCeilingEstimateLines,
  buildElectricEstimateLines,
  buildFloorEstimateLines,
  buildPlumbingEstimateLines,
  buildTileEstimateLines,
  buildWallEstimateLines,
  findCeilingMappingItem,
  findElectricMappingItem,
  findFloorMappingItem,
  findPlumbingMappingItem,
  findTileMappingItem,
  findWallMappingItem,
  isZonedEstimateLine,
  noteEstimateZoneIds,
  noteManualLineIds,
  noteZonedLineIds,
  resolveEstimateZoneType,
  type CeilingDemolitionCoveringOption,
  type CeilingEstimateInput,
  type CeilingFinishTargetOption,
  type CeilingPaintLayersOption,
  type CeilingPriceMappingItem,
  type CeilingStateOption,
  type DemolitionCoveringOption,
  type ElectricEstimateInput,
  type ElectricPriceMappingItem,
  type ElectricStateOption,
  type EstimateLine,
  type EstimateZone,
  type FloorEstimateInput,
  type FloorPriceMappingItem,
  type PlumbingEstimateInput,
  type PlumbingPriceMappingItem,
  type PlumbingStateOption,
  type ScreedTypeOption,
  type TileCladFormatOption,
  type TileDemolitionSurfacesOption,
  type TileEstimateInput,
  type TileGroutOption,
  type TilePriceMappingItem,
  type TileStateOption,
  type WallDemolitionCoveringOption,
  type WallEstimateInput,
  type WallFinishTargetOption,
  type WallPaintLayersOption,
  type WallPriceMappingItem,
  type WallStateOption,
  type WallWallpaperTypeOption,
  type WasteTripOption,
  type WaterproofingLayersOption,
} from '@/entities/estimate'

import type { EstimateTabId } from '../ui/EstimateTabs'

export const ESTIMATE_CALCULATOR_STORAGE_KEY = 'anfas:estimate-calculator:v1'

/** Версия схемы снимка в localStorage. */
const SNAPSHOT_VERSION = 2 as const
const LEGACY_SNAPSHOT_VERSION = 1 as const

export type PersistedEstimateLine = {
  id: string
  priceKey: string
  enabled: boolean
  quantity: number
  unitPrice: number
  coefficient: number
  comment?: string
  zoneId?: string
  zoneName?: string
  source?: EstimateLine['source']
  title?: string
  unit?: string
  kind?: EstimateLine['kind']
  sectionId?: string
  /** Явная ручная правка цены/названия прайс-строки. У старых снимков может отсутствовать. */
  priceEdited?: boolean
}

export type PersistedPriceProfileRef = {
  id: string
  name: string
  source: 'builtin-anfas' | 'user-xlsx'
  contentHash: string
}

export type FloorPresetDraftState = {
  covering: DemolitionCoveringOption
  screedType: ScreedTypeOption
  layers: WaterproofingLayersOption
  wasteTrip: WasteTripOption
}

export type WallScenarioDraftState = {
  state: WallStateOption
  finishTarget: WallFinishTargetOption
  demolitionCovering: WallDemolitionCoveringOption
  wallpaperType: WallWallpaperTypeOption
  paintLayers: WallPaintLayersOption
}

export type CeilingScenarioDraftState = {
  state: CeilingStateOption
  finishTarget: CeilingFinishTargetOption
  demolitionCovering: CeilingDemolitionCoveringOption
  paintLayers: CeilingPaintLayersOption
}

export type TileScenarioDraftState = {
  state: TileStateOption
  cladFormat: TileCladFormatOption
  grout: TileGroutOption
  demolitionSurfaces: TileDemolitionSurfacesOption
}

export type ElectricScenarioDraftState = {
  state: ElectricStateOption
}

export type PlumbingScenarioDraftState = {
  state: PlumbingStateOption
}

export type EstimateCalculatorSnapshot = {
  version: typeof SNAPSHOT_VERSION
  activeTab: EstimateTabId
  zones: EstimateZone[]
  /** Какой прайс был активен при сохранении сметы (суммы строк от него не зависят). */
  priceProfileRef?: PersistedPriceProfileRef
  floors: {
    input: FloorEstimateInput
    lines: PersistedEstimateLine[]
  }
  walls: {
    input: WallEstimateInput
    lines: PersistedEstimateLine[]
  }
  ceilings?: {
    input: CeilingEstimateInput
    lines: PersistedEstimateLine[]
  }
  tile?: {
    input: TileEstimateInput
    lines: PersistedEstimateLine[]
  }
  electrics?: {
    input: ElectricEstimateInput
    lines: PersistedEstimateLine[]
  }
  plumbing?: {
    input: PlumbingEstimateInput
    lines: PersistedEstimateLine[]
  }
  floorPresets?: FloorPresetDraftState
  wallScenarios?: WallScenarioDraftState
  ceilingScenarios?: CeilingScenarioDraftState
  tileScenarios?: TileScenarioDraftState
  electricScenarios?: ElectricScenarioDraftState
  plumbingScenarios?: PlumbingScenarioDraftState
}

const EMPTY_FLOOR_INPUT: FloorEstimateInput = {
  totalFloorArea: 0,
  demolitionArea: 0,
  screedArea: 0,
  wetZonesArea: 0,
  avgDeltaMm: 0,
  surveyorComment: '',
}

const EMPTY_WALL_INPUT: WallEstimateInput = {
  totalWallArea: 0,
  demolitionArea: 0,
  plasterArea: 0,
  puttyArea: 0,
  finishArea: 0,
  wallHeightM: 0,
  slopesLengthM: 0,
  cornersLengthM: 0,
  surveyorComment: '',
}

const EMPTY_CEILING_INPUT: CeilingEstimateInput = {
  totalCeilingArea: 0,
  demolitionArea: 0,
  plasterArea: 0,
  puttyArea: 0,
  finishArea: 0,
  surveyorComment: '',
}

const EMPTY_TILE_INPUT: TileEstimateInput = {
  floorTileArea: 0,
  wallTileArea: 0,
  backsplashArea: 0,
  cuttingLength: 0,
  cornerLength: 0,
  holesCount: 0,
  repairCount: 0,
  surveyorComment: '',
}

const EMPTY_ELECTRIC_INPUT: ElectricEstimateInput = {
  electricSocketsCount: 0,
  electricSwitchesCount: 0,
  electricLightPointsCount: 0,
  electricDataPointsCount: 0,
  electricStrobeLength: 0,
  electricCableLength: 0,
  electricSocketBoxesCount: 0,
  electricJunctionBoxesCount: 0,
  electricPanelModulesCount: 0,
  electricWarmFloorArea: 0,
  electricApplianceConnectionsCount: 0,
  surveyorComment: '',
}

const EMPTY_PLUMBING_INPUT: PlumbingEstimateInput = {
  plumbingWaterPointsCount: 0,
  plumbingSewerPointsCount: 0,
  plumbingWaterPipeLength: 0,
  plumbingSewerPipeLength: 0,
  plumbingCollectorsCount: 0,
  plumbingToiletsCount: 0,
  plumbingSinksCount: 0,
  plumbingBathtubsCount: 0,
  plumbingShowersCount: 0,
  plumbingMixersCount: 0,
  plumbingInstallationsCount: 0,
  plumbingDrainsCount: 0,
  plumbingWasherConnectionsCount: 0,
  plumbingDishwasherConnectionsCount: 0,
  plumbingWaterHeatersCount: 0,
  plumbingTowelWarmersCount: 0,
  plumbingWarmFloorArea: 0,
  surveyorComment: '',
}

const DEFAULT_FLOOR_PRESETS: FloorPresetDraftState = {
  covering: 'laminate',
  screedType: 'semidry-up-to-80',
  layers: 'acrylic-2',
  wasteTrip: 'gazelle-6',
}

const DEFAULT_WALL_SCENARIOS: WallScenarioDraftState = {
  state: 'from-scratch',
  finishTarget: 'none',
  demolitionCovering: 'wallpaper',
  wallpaperType: 'flizelin',
  paintLayers: 'paint-2',
}

const DEFAULT_CEILING_SCENARIOS: CeilingScenarioDraftState = {
  state: 'from-scratch',
  finishTarget: 'none',
  demolitionCovering: 'paint',
  paintLayers: 'paint-ceiling-2',
}

const DEFAULT_TILE_SCENARIOS: TileScenarioDraftState = {
  state: 'bathroom-from-scratch',
  cladFormat: '301-1300',
  grout: 'cement',
  demolitionSurfaces: 'both',
}

const DEFAULT_ELECTRIC_SCENARIOS: ElectricScenarioDraftState = {
  state: 'apartment-from-scratch',
}

const DEFAULT_PLUMBING_SCENARIOS: PlumbingScenarioDraftState = {
  state: 'bathroom-from-scratch',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function asNonNegative(value: unknown, fallback = 0): number {
  if (!isFiniteNumber(value)) return fallback
  return value < 0 ? 0 : value
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function parseFloorInput(raw: unknown): FloorEstimateInput {
  if (!isRecord(raw)) return { ...EMPTY_FLOOR_INPUT }
  return {
    totalFloorArea: asNonNegative(raw.totalFloorArea),
    demolitionArea: asNonNegative(raw.demolitionArea),
    screedArea: asNonNegative(raw.screedArea),
    wetZonesArea: asNonNegative(raw.wetZonesArea),
    avgDeltaMm: asNonNegative(raw.avgDeltaMm),
    surveyorComment: asString(raw.surveyorComment, ''),
  }
}

function parseWallInput(raw: unknown): WallEstimateInput {
  if (!isRecord(raw)) return { ...EMPTY_WALL_INPUT }
  return {
    totalWallArea: asNonNegative(raw.totalWallArea),
    demolitionArea: asNonNegative(raw.demolitionArea),
    plasterArea: asNonNegative(raw.plasterArea),
    puttyArea: asNonNegative(raw.puttyArea),
    finishArea: asNonNegative(raw.finishArea),
    wallHeightM: asNonNegative(raw.wallHeightM),
    slopesLengthM: asNonNegative(raw.slopesLengthM),
    cornersLengthM: asNonNegative(raw.cornersLengthM),
    surveyorComment: asString(raw.surveyorComment, ''),
  }
}

function parseCeilingInput(raw: unknown): CeilingEstimateInput {
  if (!isRecord(raw)) return { ...EMPTY_CEILING_INPUT }
  return {
    totalCeilingArea: asNonNegative(raw.totalCeilingArea),
    demolitionArea: asNonNegative(raw.demolitionArea),
    plasterArea: asNonNegative(raw.plasterArea),
    puttyArea: asNonNegative(raw.puttyArea),
    finishArea: asNonNegative(raw.finishArea),
    surveyorComment: asString(raw.surveyorComment, ''),
  }
}

function parseTileInput(raw: unknown): TileEstimateInput {
  if (!isRecord(raw)) return { ...EMPTY_TILE_INPUT }
  return {
    floorTileArea: asNonNegative(raw.floorTileArea),
    wallTileArea: asNonNegative(raw.wallTileArea),
    backsplashArea: asNonNegative(raw.backsplashArea),
    cuttingLength: asNonNegative(raw.cuttingLength),
    cornerLength: asNonNegative(raw.cornerLength),
    holesCount: asNonNegative(raw.holesCount),
    repairCount: asNonNegative(raw.repairCount),
    surveyorComment: asString(raw.surveyorComment, ''),
  }
}

function parseElectricInput(raw: unknown): ElectricEstimateInput {
  if (!isRecord(raw)) return { ...EMPTY_ELECTRIC_INPUT }
  return {
    electricSocketsCount: asNonNegative(raw.electricSocketsCount),
    electricSwitchesCount: asNonNegative(raw.electricSwitchesCount),
    electricLightPointsCount: asNonNegative(raw.electricLightPointsCount),
    electricDataPointsCount: asNonNegative(raw.electricDataPointsCount),
    electricStrobeLength: asNonNegative(raw.electricStrobeLength),
    electricCableLength: asNonNegative(raw.electricCableLength),
    electricSocketBoxesCount: asNonNegative(raw.electricSocketBoxesCount),
    electricJunctionBoxesCount: asNonNegative(raw.electricJunctionBoxesCount),
    electricPanelModulesCount: asNonNegative(raw.electricPanelModulesCount),
    electricWarmFloorArea: asNonNegative(raw.electricWarmFloorArea),
    electricApplianceConnectionsCount: asNonNegative(raw.electricApplianceConnectionsCount),
    surveyorComment: asString(raw.surveyorComment, ''),
  }
}

function parsePlumbingInput(raw: unknown): PlumbingEstimateInput {
  if (!isRecord(raw)) return { ...EMPTY_PLUMBING_INPUT }
  return {
    plumbingWaterPointsCount: asNonNegative(raw.plumbingWaterPointsCount),
    plumbingSewerPointsCount: asNonNegative(raw.plumbingSewerPointsCount),
    plumbingWaterPipeLength: asNonNegative(raw.plumbingWaterPipeLength),
    plumbingSewerPipeLength: asNonNegative(raw.plumbingSewerPipeLength),
    plumbingCollectorsCount: asNonNegative(raw.plumbingCollectorsCount),
    plumbingToiletsCount: asNonNegative(raw.plumbingToiletsCount),
    plumbingSinksCount: asNonNegative(raw.plumbingSinksCount),
    plumbingBathtubsCount: asNonNegative(raw.plumbingBathtubsCount),
    plumbingShowersCount: asNonNegative(raw.plumbingShowersCount),
    plumbingMixersCount: asNonNegative(raw.plumbingMixersCount),
    plumbingInstallationsCount: asNonNegative(raw.plumbingInstallationsCount),
    plumbingDrainsCount: asNonNegative(raw.plumbingDrainsCount),
    plumbingWasherConnectionsCount: asNonNegative(raw.plumbingWasherConnectionsCount),
    plumbingDishwasherConnectionsCount: asNonNegative(raw.plumbingDishwasherConnectionsCount),
    plumbingWaterHeatersCount: asNonNegative(raw.plumbingWaterHeatersCount),
    plumbingTowelWarmersCount: asNonNegative(raw.plumbingTowelWarmersCount),
    plumbingWarmFloorArea: asNonNegative(raw.plumbingWarmFloorArea),
    surveyorComment: asString(raw.surveyorComment, ''),
  }
}

function parsePersistedZone(raw: unknown): EstimateZone | null {
  if (!isRecord(raw)) return null
  const id = asString(raw.id).trim()
  const name = asString(raw.name).trim()
  if (!id || !name) return null
  return {
    id,
    name,
    zoneType: resolveEstimateZoneType({ name, zoneType: raw.zoneType }),
    floorArea: asNonNegative(raw.floorArea),
    demolitionFloorArea: asNonNegative(raw.demolitionFloorArea ?? raw.demolitionArea),
    screedArea: asNonNegative(raw.screedArea),
    wetArea: asNonNegative(raw.wetArea),
    wallArea: asNonNegative(raw.wallArea),
    demolitionWallArea: asNonNegative(raw.demolitionWallArea),
    plasterArea: asNonNegative(raw.plasterArea),
    puttyArea: asNonNegative(raw.puttyArea),
    finishArea: asNonNegative(raw.finishArea),
    slopesLength: asNonNegative(raw.slopesLength),
    cornersLength: asNonNegative(raw.cornersLength),
    ceilingArea: asNonNegative(raw.ceilingArea),
    demolitionCeilingArea: asNonNegative(raw.demolitionCeilingArea),
    plasterCeilingArea: asNonNegative(raw.plasterCeilingArea),
    puttyCeilingArea: asNonNegative(raw.puttyCeilingArea),
    finishCeilingArea: asNonNegative(raw.finishCeilingArea),
    tileFloorArea: asNonNegative(raw.tileFloorArea),
    tileWallArea: asNonNegative(raw.tileWallArea),
    tileBacksplashArea: asNonNegative(raw.tileBacksplashArea),
    tileCuttingLength: asNonNegative(raw.tileCuttingLength),
    tileCornerLength: asNonNegative(raw.tileCornerLength),
    tileHolesCount: asNonNegative(raw.tileHolesCount),
    tileRepairCount: asNonNegative(raw.tileRepairCount),
    electricSocketsCount: asNonNegative(raw.electricSocketsCount),
    electricSwitchesCount: asNonNegative(raw.electricSwitchesCount),
    electricLightPointsCount: asNonNegative(raw.electricLightPointsCount),
    electricDataPointsCount: asNonNegative(raw.electricDataPointsCount),
    electricStrobeLength: asNonNegative(raw.electricStrobeLength),
    electricCableLength: asNonNegative(raw.electricCableLength),
    electricSocketBoxesCount: asNonNegative(raw.electricSocketBoxesCount),
    electricJunctionBoxesCount: asNonNegative(raw.electricJunctionBoxesCount),
    electricPanelModulesCount: asNonNegative(raw.electricPanelModulesCount),
    electricWarmFloorArea: asNonNegative(raw.electricWarmFloorArea),
    electricApplianceConnectionsCount: asNonNegative(raw.electricApplianceConnectionsCount),
    plumbingWaterPointsCount: asNonNegative(raw.plumbingWaterPointsCount),
    plumbingSewerPointsCount: asNonNegative(raw.plumbingSewerPointsCount),
    plumbingWaterPipeLength: asNonNegative(raw.plumbingWaterPipeLength),
    plumbingSewerPipeLength: asNonNegative(raw.plumbingSewerPipeLength),
    plumbingCollectorsCount: asNonNegative(raw.plumbingCollectorsCount),
    plumbingToiletsCount: asNonNegative(raw.plumbingToiletsCount),
    plumbingSinksCount: asNonNegative(raw.plumbingSinksCount),
    plumbingBathtubsCount: asNonNegative(raw.plumbingBathtubsCount),
    plumbingShowersCount: asNonNegative(raw.plumbingShowersCount),
    plumbingMixersCount: asNonNegative(raw.plumbingMixersCount),
    plumbingInstallationsCount: asNonNegative(raw.plumbingInstallationsCount),
    plumbingDrainsCount: asNonNegative(raw.plumbingDrainsCount),
    plumbingWasherConnectionsCount: asNonNegative(raw.plumbingWasherConnectionsCount),
    plumbingDishwasherConnectionsCount: asNonNegative(raw.plumbingDishwasherConnectionsCount),
    plumbingWaterHeatersCount: asNonNegative(raw.plumbingWaterHeatersCount),
    plumbingTowelWarmersCount: asNonNegative(raw.plumbingTowelWarmersCount),
    plumbingWarmFloorArea: asNonNegative(raw.plumbingWarmFloorArea),
    comment: asString(raw.comment).trim() || undefined,
  }
}

function parsePersistedZones(raw: unknown): EstimateZone[] {
  if (!Array.isArray(raw)) return []
  const zones: EstimateZone[] = []
  for (const entry of raw) {
    const zone = parsePersistedZone(entry)
    if (zone) zones.push(zone)
  }
  return zones
}

function parsePersistedLine(raw: unknown): PersistedEstimateLine | null {
  if (!isRecord(raw)) return null
  const id = asString(raw.id)
  const priceKey = asString(raw.priceKey)
  if (!id || !priceKey) return null

  const line: PersistedEstimateLine = {
    id,
    priceKey,
    enabled: asBoolean(raw.enabled),
    quantity: asNonNegative(raw.quantity),
    unitPrice: asNonNegative(raw.unitPrice),
    coefficient: asNonNegative(raw.coefficient, 1) || 1,
  }

  const comment = asString(raw.comment)
  if (comment) line.comment = comment
  const zoneId = asString(raw.zoneId).trim()
  if (zoneId) line.zoneId = zoneId
  const zoneName = asString(raw.zoneName)
  if (zoneName) line.zoneName = zoneName

  if (typeof raw.source === 'string') {
    line.source = raw.source as EstimateLine['source']
  }
  if (typeof raw.title === 'string') line.title = raw.title
  if (typeof raw.unit === 'string') line.unit = raw.unit
  if (typeof raw.kind === 'string') line.kind = raw.kind as EstimateLine['kind']
  if (typeof raw.sectionId === 'string') line.sectionId = raw.sectionId
  if (raw.priceEdited === true) line.priceEdited = true

  return line
}

function parsePersistedLines(raw: unknown): PersistedEstimateLine[] {
  if (!Array.isArray(raw)) return []
  const lines: PersistedEstimateLine[] = []
  for (const entry of raw) {
    const line = parsePersistedLine(entry)
    if (line) lines.push(line)
  }
  return lines
}

function isTabId(value: unknown): value is EstimateTabId {
  return (
    value === 'floors' ||
    value === 'walls' ||
    value === 'ceilings' ||
    value === 'tile' ||
    value === 'electrics' ||
    value === 'plumbing'
  )
}

function isSupportedSnapshotVersion(value: unknown): value is 1 | 2 {
  return value === SNAPSHOT_VERSION || value === LEGACY_SNAPSHOT_VERSION
}

function parsePersistedPriceProfileRef(raw: unknown): PersistedPriceProfileRef | undefined {
  if (!isRecord(raw)) return undefined
  const id = asString(raw.id)
  const name = asString(raw.name)
  const contentHash = asString(raw.contentHash)
  const source = raw.source
  if (!id || !name || !contentHash) return undefined
  if (source !== 'builtin-anfas' && source !== 'user-xlsx') return undefined
  return { id, name, source, contentHash }
}

/** Разбор снимка калькулятора; `null`, если payload отсутствует или повреждён. v1 → v2. */
export function parseEstimateCalculatorSnapshot(raw: unknown): EstimateCalculatorSnapshot | null {
  if (!isRecord(raw)) return null
  if (!isSupportedSnapshotVersion(raw.version)) return null
  if (!isTabId(raw.activeTab)) return null
  if (!isRecord(raw.floors) || !isRecord(raw.walls)) return null

  const zones = raw.version === LEGACY_SNAPSHOT_VERSION ? [] : parsePersistedZones(raw.zones)

  const snapshot: EstimateCalculatorSnapshot = {
    version: SNAPSHOT_VERSION,
    activeTab: raw.activeTab,
    zones,
    floors: {
      input: parseFloorInput(raw.floors.input),
      lines: parsePersistedLines(raw.floors.lines),
    },
    walls: {
      input: parseWallInput(raw.walls.input),
      lines: parsePersistedLines(raw.walls.lines),
    },
    ceilings: isRecord(raw.ceilings)
      ? {
          input: parseCeilingInput(raw.ceilings.input),
          lines: parsePersistedLines(raw.ceilings.lines),
        }
      : { input: { ...EMPTY_CEILING_INPUT }, lines: [] },
    tile: isRecord(raw.tile)
      ? {
          input: parseTileInput(raw.tile.input),
          lines: parsePersistedLines(raw.tile.lines),
        }
      : { input: { ...EMPTY_TILE_INPUT }, lines: [] },
    electrics: isRecord(raw.electrics)
      ? {
          input: parseElectricInput(raw.electrics.input),
          lines: parsePersistedLines(raw.electrics.lines),
        }
      : { input: { ...EMPTY_ELECTRIC_INPUT }, lines: [] },
    plumbing: isRecord(raw.plumbing)
      ? {
          input: parsePlumbingInput(raw.plumbing.input),
          lines: parsePersistedLines(raw.plumbing.lines),
        }
      : { input: { ...EMPTY_PLUMBING_INPUT }, lines: [] },
  }

  const priceProfileRef = parsePersistedPriceProfileRef(raw.priceProfileRef)
  if (priceProfileRef) snapshot.priceProfileRef = priceProfileRef

  if (isRecord(raw.floorPresets)) {
    snapshot.floorPresets = {
      covering: asString(
        raw.floorPresets.covering,
        DEFAULT_FLOOR_PRESETS.covering,
      ) as DemolitionCoveringOption,
      screedType: asString(
        raw.floorPresets.screedType,
        DEFAULT_FLOOR_PRESETS.screedType,
      ) as ScreedTypeOption,
      layers: asString(
        raw.floorPresets.layers,
        DEFAULT_FLOOR_PRESETS.layers,
      ) as WaterproofingLayersOption,
      wasteTrip: asString(
        raw.floorPresets.wasteTrip,
        DEFAULT_FLOOR_PRESETS.wasteTrip,
      ) as WasteTripOption,
    }
  }

  if (isRecord(raw.wallScenarios)) {
    snapshot.wallScenarios = {
      state: asString(raw.wallScenarios.state, DEFAULT_WALL_SCENARIOS.state) as WallStateOption,
      finishTarget: asString(
        raw.wallScenarios.finishTarget,
        DEFAULT_WALL_SCENARIOS.finishTarget,
      ) as WallFinishTargetOption,
      demolitionCovering: asString(
        raw.wallScenarios.demolitionCovering,
        DEFAULT_WALL_SCENARIOS.demolitionCovering,
      ) as WallDemolitionCoveringOption,
      wallpaperType: asString(
        raw.wallScenarios.wallpaperType,
        DEFAULT_WALL_SCENARIOS.wallpaperType,
      ) as WallWallpaperTypeOption,
      paintLayers: asString(
        raw.wallScenarios.paintLayers,
        DEFAULT_WALL_SCENARIOS.paintLayers,
      ) as WallPaintLayersOption,
    }
  }

  if (isRecord(raw.ceilingScenarios)) {
    snapshot.ceilingScenarios = {
      state: asString(
        raw.ceilingScenarios.state,
        DEFAULT_CEILING_SCENARIOS.state,
      ) as CeilingStateOption,
      finishTarget: asString(
        raw.ceilingScenarios.finishTarget,
        DEFAULT_CEILING_SCENARIOS.finishTarget,
      ) as CeilingFinishTargetOption,
      demolitionCovering: asString(
        raw.ceilingScenarios.demolitionCovering,
        DEFAULT_CEILING_SCENARIOS.demolitionCovering,
      ) as CeilingDemolitionCoveringOption,
      paintLayers: asString(
        raw.ceilingScenarios.paintLayers,
        DEFAULT_CEILING_SCENARIOS.paintLayers,
      ) as CeilingPaintLayersOption,
    }
  }

  if (isRecord(raw.tileScenarios)) {
    snapshot.tileScenarios = {
      state: asString(raw.tileScenarios.state, DEFAULT_TILE_SCENARIOS.state) as TileStateOption,
      cladFormat: asString(
        raw.tileScenarios.cladFormat,
        DEFAULT_TILE_SCENARIOS.cladFormat,
      ) as TileCladFormatOption,
      grout: asString(raw.tileScenarios.grout, DEFAULT_TILE_SCENARIOS.grout) as TileGroutOption,
      demolitionSurfaces: asString(
        raw.tileScenarios.demolitionSurfaces,
        DEFAULT_TILE_SCENARIOS.demolitionSurfaces,
      ) as TileDemolitionSurfacesOption,
    }
  }

  if (isRecord(raw.electricScenarios)) {
    snapshot.electricScenarios = {
      state: asString(
        raw.electricScenarios.state,
        DEFAULT_ELECTRIC_SCENARIOS.state,
      ) as ElectricStateOption,
    }
  }

  if (isRecord(raw.plumbingScenarios)) {
    snapshot.plumbingScenarios = {
      state: asString(
        raw.plumbingScenarios.state,
        DEFAULT_PLUMBING_SCENARIOS.state,
      ) as PlumbingStateOption,
    }
  }

  return snapshot
}

export function serializeEstimateLine(line: EstimateLine): PersistedEstimateLine {
  const persisted: PersistedEstimateLine = {
    id: line.id,
    priceKey: line.priceKey,
    enabled: line.enabled,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    coefficient: line.coefficient,
    source: line.source,
    title: line.title,
    unit: line.unit,
    kind: line.kind,
    sectionId: line.sectionId,
  }
  if (line.comment) persisted.comment = line.comment
  if (line.zoneId) persisted.zoneId = line.zoneId
  if (line.zoneName) persisted.zoneName = line.zoneName
  if (line.priceEdited) persisted.priceEdited = true
  return persisted
}

export function serializeEstimateZone(zone: EstimateZone): EstimateZone {
  return {
    id: zone.id,
    name: zone.name,
    zoneType: zone.zoneType,
    floorArea: zone.floorArea,
    demolitionFloorArea: zone.demolitionFloorArea,
    screedArea: zone.screedArea,
    wetArea: zone.wetArea,
    wallArea: zone.wallArea,
    demolitionWallArea: zone.demolitionWallArea,
    plasterArea: zone.plasterArea,
    puttyArea: zone.puttyArea,
    finishArea: zone.finishArea,
    slopesLength: zone.slopesLength,
    cornersLength: zone.cornersLength,
    ceilingArea: zone.ceilingArea,
    demolitionCeilingArea: zone.demolitionCeilingArea,
    plasterCeilingArea: zone.plasterCeilingArea,
    puttyCeilingArea: zone.puttyCeilingArea,
    finishCeilingArea: zone.finishCeilingArea,
    tileFloorArea: zone.tileFloorArea,
    tileWallArea: zone.tileWallArea,
    tileBacksplashArea: zone.tileBacksplashArea,
    tileCuttingLength: zone.tileCuttingLength,
    tileCornerLength: zone.tileCornerLength,
    tileHolesCount: zone.tileHolesCount,
    tileRepairCount: zone.tileRepairCount,
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
    comment: zone.comment,
  }
}

export function buildEstimateCalculatorSnapshot(params: {
  activeTab: EstimateTabId
  zones?: readonly EstimateZone[]
  priceProfileRef?: PersistedPriceProfileRef
  floorsInput: FloorEstimateInput
  floorsLines: readonly EstimateLine[]
  wallsInput: WallEstimateInput
  wallsLines: readonly EstimateLine[]
  ceilingsInput?: CeilingEstimateInput
  ceilingsLines?: readonly EstimateLine[]
  tileInput?: TileEstimateInput
  tileLines?: readonly EstimateLine[]
  electricInput?: ElectricEstimateInput
  electricLines?: readonly EstimateLine[]
  plumbingInput?: PlumbingEstimateInput
  plumbingLines?: readonly EstimateLine[]
  floorPresets?: FloorPresetDraftState
  wallScenarios?: WallScenarioDraftState
  ceilingScenarios?: CeilingScenarioDraftState
  tileScenarios?: TileScenarioDraftState
  electricScenarios?: ElectricScenarioDraftState
  plumbingScenarios?: PlumbingScenarioDraftState
}): EstimateCalculatorSnapshot {
  return {
    version: SNAPSHOT_VERSION,
    activeTab: params.activeTab,
    zones: (params.zones ?? []).map(serializeEstimateZone),
    priceProfileRef: params.priceProfileRef,
    floors: {
      input: { ...params.floorsInput },
      lines: params.floorsLines.map(serializeEstimateLine),
    },
    walls: {
      input: { ...params.wallsInput },
      lines: params.wallsLines.map(serializeEstimateLine),
    },
    ceilings: {
      input: { ...(params.ceilingsInput ?? EMPTY_CEILING_INPUT) },
      lines: (params.ceilingsLines ?? []).map(serializeEstimateLine),
    },
    tile: {
      input: { ...(params.tileInput ?? EMPTY_TILE_INPUT) },
      lines: (params.tileLines ?? []).map(serializeEstimateLine),
    },
    electrics: {
      input: { ...(params.electricInput ?? EMPTY_ELECTRIC_INPUT) },
      lines: (params.electricLines ?? []).map(serializeEstimateLine),
    },
    plumbing: {
      input: { ...(params.plumbingInput ?? EMPTY_PLUMBING_INPUT) },
      lines: (params.plumbingLines ?? []).map(serializeEstimateLine),
    },
    floorPresets: params.floorPresets,
    wallScenarios: params.wallScenarios,
    ceilingScenarios: params.ceilingScenarios,
    tileScenarios: params.tileScenarios,
    electricScenarios: params.electricScenarios,
    plumbingScenarios: params.plumbingScenarios,
  }
}

/**
 * Накладывает сохранённые патчи на строки из mapping.
 * Zoned clones и manual не мержатся в canonical по `priceKey` — восстанавливаются отдельными extras.
 */
function applyPersistedPatches(
  baseLines: readonly EstimateLine[],
  persisted: readonly PersistedEstimateLine[],
  sectionFallback: 'floors' | 'walls' | 'ceilings' | 'tile' | 'electrics' | 'plumbing',
): EstimateLine[] {
  if (persisted.length === 0) return [...baseLines]

  const byId = new Map(persisted.map((line) => [line.id, line]))
  const byPriceKey = new Map<string, PersistedEstimateLine>()
  for (const line of persisted) {
    if (line.source === 'manual') continue
    if (isZonedEstimateLine(line)) continue
    if (!byPriceKey.has(line.priceKey)) byPriceKey.set(line.priceKey, line)
  }

  const usedPersistedIds = new Set<string>()
  const restored = baseLines.map((line) => {
    const patch = byId.get(line.id) ?? byPriceKey.get(line.priceKey)
    if (!patch || patch.source === 'manual' || isZonedEstimateLine(patch)) return line
    usedPersistedIds.add(patch.id)
    const title = asString(patch.title).trim() || line.title
    const unit = asString(patch.unit).trim() || line.unit
    const unitPrice = asNonNegative(patch.unitPrice)
    // Старые снимки без priceEdited: если цена/название отличаются от базы mapping — считаем ручной правкой.
    const unknownOriginEdit =
      patch.priceEdited !== true && (title !== line.title || unitPrice !== line.unitPrice)
    return {
      ...line,
      enabled: patch.enabled,
      quantity: asNonNegative(patch.quantity),
      unitPrice,
      coefficient: asNonNegative(patch.coefficient, 1) || 1,
      comment: patch.comment?.trim() || undefined,
      zoneId: patch.zoneId?.trim() || undefined,
      zoneName: patch.zoneName?.trim() || undefined,
      title,
      unit,
      priceEdited: patch.priceEdited === true || unknownOriginEdit ? true : undefined,
    }
  })

  const extras: EstimateLine[] = []
  for (const patch of persisted) {
    if (usedPersistedIds.has(patch.id)) continue

    if (isZonedEstimateLine(patch)) {
      const sectionId = asString(patch.sectionId, sectionFallback)
      const mapping =
        sectionId === 'walls'
          ? findWallMappingItem(patch.priceKey)
          : sectionId === 'ceilings'
            ? findCeilingMappingItem(patch.priceKey)
            : sectionId === 'tile'
              ? findTileMappingItem(patch.priceKey)
              : sectionId === 'electrics'
                ? findElectricMappingItem(patch.priceKey)
                : sectionId === 'plumbing'
                  ? findPlumbingMappingItem(patch.priceKey)
                  : findFloorMappingItem(patch.priceKey)
      const title = asString(patch.title).trim() || mapping?.title || ''
      const unit = asString(patch.unit).trim() || mapping?.unit || 'м²'
      const unitPrice = asNonNegative(patch.unitPrice, mapping?.unitPrice ?? 0)
      if (!title) continue
      const unknownOriginEdit =
        patch.priceEdited !== true &&
        mapping != null &&
        (title !== mapping.title || unitPrice !== mapping.unitPrice)
      extras.push({
        id: patch.id,
        priceKey: patch.priceKey,
        sectionId,
        kind: (patch.kind ??
          mapping?.kind ??
          (sectionFallback === 'floors' ? 'other-rough' : 'other')) as EstimateLine['kind'],
        title,
        unit,
        unitPrice,
        quantity: asNonNegative(patch.quantity),
        coefficient: asNonNegative(patch.coefficient, 1) || 1,
        enabled: asBoolean(patch.enabled, true),
        comment: patch.comment?.trim() || undefined,
        zoneId: patch.zoneId?.trim() || undefined,
        zoneName: patch.zoneName?.trim() || undefined,
        source: (patch.source as EstimateLine['source']) ?? mapping?.source ?? 'pdf',
        frontendCategorySlug: mapping?.frontendCategorySlug,
        note: mapping?.note,
        priceEdited: patch.priceEdited === true || unknownOriginEdit ? true : undefined,
      })
      continue
    }

    if (patch.source !== 'manual' && !patch.priceKey.startsWith('manual')) continue
    const title = asString(patch.title).trim()
    const unit = asString(patch.unit).trim() || 'м²'
    if (!title) continue

    extras.push({
      id: patch.id,
      priceKey: patch.priceKey,
      sectionId: asString(patch.sectionId, sectionFallback),
      kind: (patch.kind ?? 'other') as EstimateLine['kind'],
      title,
      unit,
      unitPrice: asNonNegative(patch.unitPrice),
      quantity: asNonNegative(patch.quantity),
      coefficient: asNonNegative(patch.coefficient, 1) || 1,
      enabled: asBoolean(patch.enabled, true),
      comment: patch.comment?.trim() || undefined,
      source: 'manual',
    })
  }

  const lines = [...restored, ...extras]
  noteManualLineIds(lines)
  noteZonedLineIds(lines)
  return lines
}

/**
 * Восстанавливает полы: параметры замера + строки из mapping с патчами и zoned clones из снимка.
 * Без снимка — чистый build из пустого ввода.
 * Патчи снимка сохраняют цены/названия документа; `mapping` задаёт базу для ещё не сохранённых строк каталога.
 */
export function restoreFloorEstimateState(
  snapshot: EstimateCalculatorSnapshot | null,
  mapping?: readonly FloorPriceMappingItem[],
): {
  input: FloorEstimateInput
  lines: EstimateLine[]
} {
  const input = snapshot ? snapshot.floors.input : { ...EMPTY_FLOOR_INPUT }
  const base = buildFloorEstimateLines(input, mapping ? { mapping } : undefined)
  return {
    input,
    lines: snapshot ? applyPersistedPatches(base, snapshot.floors.lines, 'floors') : base,
  }
}

/** То же для стен, включая zoned clones. */
export function restoreWallEstimateState(
  snapshot: EstimateCalculatorSnapshot | null,
  mapping?: readonly WallPriceMappingItem[],
): {
  input: WallEstimateInput
  lines: EstimateLine[]
} {
  const input = snapshot ? snapshot.walls.input : { ...EMPTY_WALL_INPUT }
  const base = buildWallEstimateLines(input, mapping ? { mapping } : undefined)
  return {
    input,
    lines: snapshot ? applyPersistedPatches(base, snapshot.walls.lines, 'walls') : base,
  }
}

/**
 * То же для потолков, включая zoned clones.
 * Толерантно к снимкам без секции `ceilings` — тогда пустой ввод и чистый build.
 */
export function restoreCeilingEstimateState(
  snapshot: EstimateCalculatorSnapshot | null,
  mapping?: readonly CeilingPriceMappingItem[],
): {
  input: CeilingEstimateInput
  lines: EstimateLine[]
} {
  const ceilings = snapshot?.ceilings
  const input = ceilings ? ceilings.input : { ...EMPTY_CEILING_INPUT }
  const base = buildCeilingEstimateLines(input, mapping ? { mapping } : undefined)
  return {
    input,
    lines: ceilings ? applyPersistedPatches(base, ceilings.lines, 'ceilings') : base,
  }
}

/**
 * То же для плитки, включая zoned clones.
 * Толерантно к снимкам без секции `tile` — тогда пустой ввод и чистый build.
 */
export function restoreTileEstimateState(
  snapshot: EstimateCalculatorSnapshot | null,
  mapping?: readonly TilePriceMappingItem[],
): {
  input: TileEstimateInput
  lines: EstimateLine[]
} {
  const tile = snapshot?.tile
  const input = tile ? tile.input : { ...EMPTY_TILE_INPUT }
  const base = buildTileEstimateLines(input, mapping ? { mapping } : undefined)
  return {
    input,
    lines: tile ? applyPersistedPatches(base, tile.lines, 'tile') : base,
  }
}

/**
 * То же для электрики, включая zoned clones.
 * Толерантно к снимкам без секции `electrics` — тогда пустой ввод и чистый build.
 */
export function restoreElectricEstimateState(
  snapshot: EstimateCalculatorSnapshot | null,
  mapping?: readonly ElectricPriceMappingItem[],
): {
  input: ElectricEstimateInput
  lines: EstimateLine[]
} {
  const electrics = snapshot?.electrics
  const input = electrics ? electrics.input : { ...EMPTY_ELECTRIC_INPUT }
  const base = buildElectricEstimateLines(input, mapping ? { mapping } : undefined)
  return {
    input,
    lines: electrics ? applyPersistedPatches(base, electrics.lines, 'electrics') : base,
  }
}

/**
 * То же для сантехники, включая zoned clones.
 * Толерантно к снимкам без секции `plumbing` — тогда пустой ввод и чистый build.
 */
export function restorePlumbingEstimateState(
  snapshot: EstimateCalculatorSnapshot | null,
  mapping?: readonly PlumbingPriceMappingItem[],
): {
  input: PlumbingEstimateInput
  lines: EstimateLine[]
} {
  const plumbing = snapshot?.plumbing
  const input = plumbing ? plumbing.input : { ...EMPTY_PLUMBING_INPUT }
  const base = buildPlumbingEstimateLines(input, mapping ? { mapping } : undefined)
  return {
    input,
    lines: plumbing ? applyPersistedPatches(base, plumbing.lines, 'plumbing') : base,
  }
}

export function restoreEstimateZones(snapshot: EstimateCalculatorSnapshot | null): EstimateZone[] {
  const zones = snapshot?.zones ? snapshot.zones.map(serializeEstimateZone) : []
  noteEstimateZoneIds(zones)
  return zones
}

export function restoreFloorPresetDraft(
  snapshot: EstimateCalculatorSnapshot | null,
): FloorPresetDraftState {
  return snapshot?.floorPresets ? { ...snapshot.floorPresets } : { ...DEFAULT_FLOOR_PRESETS }
}

export function restoreWallScenarioDraft(
  snapshot: EstimateCalculatorSnapshot | null,
): WallScenarioDraftState {
  return snapshot?.wallScenarios
    ? { ...snapshot.wallScenarios }
    : { ...DEFAULT_WALL_SCENARIOS }
}

export function restoreCeilingScenarioDraft(
  snapshot: EstimateCalculatorSnapshot | null,
): CeilingScenarioDraftState {
  return snapshot?.ceilingScenarios
    ? { ...snapshot.ceilingScenarios }
    : { ...DEFAULT_CEILING_SCENARIOS }
}

export function restoreTileScenarioDraft(
  snapshot: EstimateCalculatorSnapshot | null,
): TileScenarioDraftState {
  return snapshot?.tileScenarios ? { ...snapshot.tileScenarios } : { ...DEFAULT_TILE_SCENARIOS }
}

export function restoreElectricScenarioDraft(
  snapshot: EstimateCalculatorSnapshot | null,
): ElectricScenarioDraftState {
  return snapshot?.electricScenarios
    ? { ...snapshot.electricScenarios }
    : { ...DEFAULT_ELECTRIC_SCENARIOS }
}

export function restorePlumbingScenarioDraft(
  snapshot: EstimateCalculatorSnapshot | null,
): PlumbingScenarioDraftState {
  return snapshot?.plumbingScenarios
    ? { ...snapshot.plumbingScenarios }
    : { ...DEFAULT_PLUMBING_SCENARIOS }
}

export function readEstimateCalculatorSnapshot(): EstimateCalculatorSnapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(ESTIMATE_CALCULATOR_STORAGE_KEY)
    if (!raw) return null
    return parseEstimateCalculatorSnapshot(JSON.parse(raw) as unknown)
  } catch {
    return null
  }
}

/** Возвращает false при ошибке хранилища, чтобы UI предложил сохранить копию. */
export function writeEstimateCalculatorSnapshot(snapshot: EstimateCalculatorSnapshot): boolean {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(ESTIMATE_CALCULATOR_STORAGE_KEY, JSON.stringify(snapshot))
    return true
  } catch {
    return false
  }
}

export function clearEstimateCalculatorSnapshot(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(ESTIMATE_CALCULATOR_STORAGE_KEY)
  } catch {
    // игнорируем
  }
}

export {
  EMPTY_FLOOR_INPUT,
  EMPTY_WALL_INPUT,
  EMPTY_CEILING_INPUT,
  EMPTY_TILE_INPUT,
  EMPTY_ELECTRIC_INPUT,
  EMPTY_PLUMBING_INPUT,
  DEFAULT_FLOOR_PRESETS,
  DEFAULT_WALL_SCENARIOS,
  DEFAULT_CEILING_SCENARIOS,
  DEFAULT_TILE_SCENARIOS,
  DEFAULT_ELECTRIC_SCENARIOS,
  DEFAULT_PLUMBING_SCENARIOS,
}
