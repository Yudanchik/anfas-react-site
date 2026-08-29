import {
  buildFloorEstimateLines,
  buildWallEstimateLines,
  findFloorMappingItem,
  findWallMappingItem,
  isZonedEstimateLine,
  noteEstimateZoneIds,
  noteManualLineIds,
  noteZonedLineIds,
  type DemolitionCoveringOption,
  type EstimateLine,
  type EstimateZone,
  type FloorEstimateInput,
  type ScreedTypeOption,
  type WallDemolitionCoveringOption,
  type WallEstimateInput,
  type WallFinishTargetOption,
  type WallPaintLayersOption,
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

export type EstimateCalculatorSnapshot = {
  version: typeof SNAPSHOT_VERSION
  activeTab: EstimateTabId
  zones: EstimateZone[]
  floors: {
    input: FloorEstimateInput
    lines: PersistedEstimateLine[]
  }
  walls: {
    input: WallEstimateInput
    lines: PersistedEstimateLine[]
  }
  floorPresets?: FloorPresetDraftState
  wallScenarios?: WallScenarioDraftState
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

function parsePersistedZone(raw: unknown): EstimateZone | null {
  if (!isRecord(raw)) return null
  const id = asString(raw.id).trim()
  const name = asString(raw.name).trim()
  if (!id || !name) return null
  return {
    id,
    name,
    floorArea: asNonNegative(raw.floorArea),
    demolitionFloorArea: asNonNegative(
      raw.demolitionFloorArea ?? raw.demolitionArea,
    ),
    screedArea: asNonNegative(raw.screedArea),
    wetArea: asNonNegative(raw.wetArea),
    wallArea: asNonNegative(raw.wallArea),
    demolitionWallArea: asNonNegative(raw.demolitionWallArea),
    plasterArea: asNonNegative(raw.plasterArea),
    puttyArea: asNonNegative(raw.puttyArea),
    finishArea: asNonNegative(raw.finishArea),
    slopesLength: asNonNegative(raw.slopesLength),
    cornersLength: asNonNegative(raw.cornersLength),
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
  return value === 'floors' || value === 'walls'
}

function isSupportedSnapshotVersion(value: unknown): value is 1 | 2 {
  return value === SNAPSHOT_VERSION || value === LEGACY_SNAPSHOT_VERSION
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
  }

  if (isRecord(raw.floorPresets)) {
    snapshot.floorPresets = {
      covering: asString(raw.floorPresets.covering, DEFAULT_FLOOR_PRESETS.covering) as DemolitionCoveringOption,
      screedType: asString(
        raw.floorPresets.screedType,
        DEFAULT_FLOOR_PRESETS.screedType,
      ) as ScreedTypeOption,
      layers: asString(raw.floorPresets.layers, DEFAULT_FLOOR_PRESETS.layers) as WaterproofingLayersOption,
      wasteTrip: asString(raw.floorPresets.wasteTrip, DEFAULT_FLOOR_PRESETS.wasteTrip) as WasteTripOption,
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
  }
  if (line.comment) persisted.comment = line.comment
  if (line.zoneId) persisted.zoneId = line.zoneId
  if (line.zoneName) persisted.zoneName = line.zoneName
  if (line.source === 'manual' || isZonedEstimateLine(line)) {
    persisted.title = line.title
    persisted.unit = line.unit
    persisted.kind = line.kind
    persisted.sectionId = line.sectionId
  }
  return persisted
}

export function serializeEstimateZone(zone: EstimateZone): EstimateZone {
  return {
    id: zone.id,
    name: zone.name,
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
    comment: zone.comment,
  }
}

export function buildEstimateCalculatorSnapshot(params: {
  activeTab: EstimateTabId
  zones?: readonly EstimateZone[]
  floorsInput: FloorEstimateInput
  floorsLines: readonly EstimateLine[]
  wallsInput: WallEstimateInput
  wallsLines: readonly EstimateLine[]
  floorPresets?: FloorPresetDraftState
  wallScenarios?: WallScenarioDraftState
}): EstimateCalculatorSnapshot {
  return {
    version: SNAPSHOT_VERSION,
    activeTab: params.activeTab,
    zones: (params.zones ?? []).map(serializeEstimateZone),
    floors: {
      input: { ...params.floorsInput },
      lines: params.floorsLines.map(serializeEstimateLine),
    },
    walls: {
      input: { ...params.wallsInput },
      lines: params.wallsLines.map(serializeEstimateLine),
    },
    floorPresets: params.floorPresets,
    wallScenarios: params.wallScenarios,
  }
}

/**
 * Накладывает сохранённые патчи на строки из mapping.
 * Zoned clones и manual не мержатся в canonical по `priceKey` — восстанавливаются отдельными extras.
 */
function applyPersistedPatches(
  baseLines: readonly EstimateLine[],
  persisted: readonly PersistedEstimateLine[],
  sectionFallback: 'floors' | 'walls',
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
    return {
      ...line,
      enabled: patch.enabled,
      quantity: asNonNegative(patch.quantity),
      unitPrice: asNonNegative(patch.unitPrice),
      coefficient: asNonNegative(patch.coefficient, 1) || 1,
      comment: patch.comment?.trim() || undefined,
      zoneId: patch.zoneId?.trim() || undefined,
      zoneName: patch.zoneName?.trim() || undefined,
    }
  })

  const extras: EstimateLine[] = []
  for (const patch of persisted) {
    if (usedPersistedIds.has(patch.id)) continue

    if (isZonedEstimateLine(patch)) {
      const sectionId = asString(patch.sectionId, sectionFallback)
      const floorMapping = sectionId === 'walls' ? undefined : findFloorMappingItem(patch.priceKey)
      const wallMapping = sectionId === 'walls' ? findWallMappingItem(patch.priceKey) : undefined
      const mapping = floorMapping ?? wallMapping
      const title = asString(patch.title).trim() || mapping?.title || ''
      const unit = asString(patch.unit).trim() || mapping?.unit || 'м²'
      if (!title) continue
      extras.push({
        id: patch.id,
        priceKey: patch.priceKey,
        sectionId,
        kind: (patch.kind ??
          mapping?.kind ??
          (sectionFallback === 'floors' ? 'other-rough' : 'other')) as EstimateLine['kind'],
        title,
        unit,
        unitPrice: asNonNegative(patch.unitPrice, mapping?.unitPrice ?? 0),
        quantity: asNonNegative(patch.quantity),
        coefficient: asNonNegative(patch.coefficient, 1) || 1,
        enabled: asBoolean(patch.enabled, true),
        comment: patch.comment?.trim() || undefined,
        zoneId: patch.zoneId?.trim() || undefined,
        zoneName: patch.zoneName?.trim() || undefined,
        source: (patch.source as EstimateLine['source']) ?? mapping?.source ?? 'pdf',
        frontendCategorySlug: mapping?.frontendCategorySlug,
        note: mapping?.note,
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
 */
export function restoreFloorEstimateState(
  snapshot: EstimateCalculatorSnapshot | null,
): { input: FloorEstimateInput; lines: EstimateLine[] } {
  const input = snapshot ? snapshot.floors.input : { ...EMPTY_FLOOR_INPUT }
  const base = buildFloorEstimateLines(input)
  return {
    input,
    lines: snapshot ? applyPersistedPatches(base, snapshot.floors.lines, 'floors') : base,
  }
}

/** То же для стен, включая zoned clones. */
export function restoreWallEstimateState(
  snapshot: EstimateCalculatorSnapshot | null,
): { input: WallEstimateInput; lines: EstimateLine[] } {
  const input = snapshot ? snapshot.walls.input : { ...EMPTY_WALL_INPUT }
  const base = buildWallEstimateLines(input)
  return {
    input,
    lines: snapshot ? applyPersistedPatches(base, snapshot.walls.lines, 'walls') : base,
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

/** Пишет снимок в localStorage; ошибки квоты / private mode молча игнорирует. */
export function writeEstimateCalculatorSnapshot(snapshot: EstimateCalculatorSnapshot): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ESTIMATE_CALCULATOR_STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Квота / private mode — игнорируем.
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
  DEFAULT_FLOOR_PRESETS,
  DEFAULT_WALL_SCENARIOS,
}
