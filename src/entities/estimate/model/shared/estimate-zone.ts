import { normalizeNonNegative } from './calculate-line-total'

/**
 * Зона объекта: именованное помещение с площадями для сценариев floors/walls/ceilings/tile/electrics.
 * Не путать с id zoned clone lines (`floors:zone-N`) — здесь сущность `zone-N`.
 */
export type EstimateZoneId = string

/** Тип помещения для мягкой фильтрации сценариев (не блокирует ручной выбор). */
export type EstimateZoneType = 'kitchen' | 'bathroom' | 'room' | 'corridor' | 'other'

export type EstimateZone = {
  id: EstimateZoneId
  name: string
  zoneType: EstimateZoneType
  floorArea: number
  demolitionFloorArea: number
  screedArea: number
  wetArea: number
  wallArea: number
  demolitionWallArea: number
  plasterArea: number
  puttyArea: number
  finishArea: number
  slopesLength: number
  cornersLength: number
  ceilingArea: number
  demolitionCeilingArea: number
  plasterCeilingArea: number
  puttyCeilingArea: number
  finishCeilingArea: number
  tileFloorArea: number
  tileWallArea: number
  tileBacksplashArea: number
  tileCuttingLength: number
  tileCornerLength: number
  tileHolesCount: number
  tileRepairCount: number
  electricSocketsCount: number
  electricSwitchesCount: number
  electricLightPointsCount: number
  electricDataPointsCount: number
  electricStrobeLength: number
  electricCableLength: number
  electricSocketBoxesCount: number
  electricJunctionBoxesCount: number
  electricPanelModulesCount: number
  electricWarmFloorArea: number
  electricApplianceConnectionsCount: number
  comment?: string
}

export const ESTIMATE_ZONE_TYPE_LABELS: Readonly<Record<EstimateZoneType, string>> = {
  kitchen: 'Кухня',
  bathroom: 'Санузел',
  room: 'Комната',
  corridor: 'Коридор',
  other: 'Другое',
}

export const ESTIMATE_ZONE_TYPE_OPTIONS: ReadonlyArray<{
  value: EstimateZoneType
  label: string
}> = [
  { value: 'kitchen', label: ESTIMATE_ZONE_TYPE_LABELS.kitchen },
  { value: 'bathroom', label: ESTIMATE_ZONE_TYPE_LABELS.bathroom },
  { value: 'room', label: ESTIMATE_ZONE_TYPE_LABELS.room },
  { value: 'corridor', label: ESTIMATE_ZONE_TYPE_LABELS.corridor },
  { value: 'other', label: ESTIMATE_ZONE_TYPE_LABELS.other },
]

/** Быстрые шаблоны зон: имя + тип. */
export const ESTIMATE_ZONE_TEMPLATES: ReadonlyArray<{
  name: string
  zoneType: EstimateZoneType
}> = [
  { name: 'Кухня', zoneType: 'kitchen' },
  { name: 'Коридор', zoneType: 'corridor' },
  { name: 'Санузел', zoneType: 'bathroom' },
  { name: 'Комната', zoneType: 'room' },
] as const

/** @deprecated Используйте `ESTIMATE_ZONE_TEMPLATES`. */
export const ESTIMATE_ZONE_NAME_TEMPLATES = ESTIMATE_ZONE_TEMPLATES.map(
  (template) => template.name,
) as readonly string[]

export const EMPTY_ESTIMATE_ZONE_FIELDS: Omit<EstimateZone, 'id' | 'name'> = {
  zoneType: 'other',
  floorArea: 0,
  demolitionFloorArea: 0,
  screedArea: 0,
  wetArea: 0,
  wallArea: 0,
  demolitionWallArea: 0,
  plasterArea: 0,
  puttyArea: 0,
  finishArea: 0,
  slopesLength: 0,
  cornersLength: 0,
  ceilingArea: 0,
  demolitionCeilingArea: 0,
  plasterCeilingArea: 0,
  puttyCeilingArea: 0,
  finishCeilingArea: 0,
  tileFloorArea: 0,
  tileWallArea: 0,
  tileBacksplashArea: 0,
  tileCuttingLength: 0,
  tileCornerLength: 0,
  tileHolesCount: 0,
  tileRepairCount: 0,
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
  comment: undefined,
}

const ZONE_ENTITY_ID_PATTERN = /^zone-(\d+)$/
const ZONE_TYPES = new Set<EstimateZoneType>([
  'kitchen',
  'bathroom',
  'room',
  'corridor',
  'other',
])

let zoneEntityCounter = 0

export function isEstimateZoneId(value: string): boolean {
  return ZONE_ENTITY_ID_PATTERN.test(value)
}

export function isEstimateZoneType(value: unknown): value is EstimateZoneType {
  return typeof value === 'string' && ZONE_TYPES.has(value as EstimateZoneType)
}

export function normalizeEstimateZoneType(value: unknown): EstimateZoneType {
  return isEstimateZoneType(value) ? value : 'other'
}

/**
 * Лёгкий inference типа по названию.
 * Не перезаписывает явный тип, отличный от `other`.
 */
export function inferEstimateZoneTypeFromName(name: string): EstimateZoneType | undefined {
  const normalized = name.trim().toLocaleLowerCase('ru-RU')
  if (!normalized) return undefined

  if (
    normalized.includes('санузел') ||
    normalized.includes('ванн') ||
    normalized === 'с/у' ||
    normalized === 'су' ||
    normalized.includes('с/у') ||
    normalized.includes('туалет') ||
    normalized.includes('wc')
  ) {
    return 'bathroom'
  }

  if (normalized.includes('кухн')) return 'kitchen'
  if (normalized.includes('коридор') || normalized.includes('прихож')) return 'corridor'
  if (
    normalized.includes('комнат') ||
    normalized.includes('спальн') ||
    normalized.includes('гостиная') ||
    normalized.includes('кабинет') ||
    normalized.includes('детск')
  ) {
    return 'room'
  }

  return undefined
}

/**
 * Итоговый тип зоны: явный non-other сохраняется;
 * для missing/`other` — безопасный inference по имени.
 */
export function resolveEstimateZoneType(params: {
  name: string
  zoneType?: unknown
}): EstimateZoneType {
  const explicit = normalizeEstimateZoneType(params.zoneType)
  if (explicit !== 'other') return explicit
  return inferEstimateZoneTypeFromName(params.name) ?? 'other'
}

/** Сдвигает счётчик после hydrate из localStorage. */
export function noteEstimateZoneIds(zones: readonly EstimateZone[]): void {
  for (const zone of zones) {
    const match = ZONE_ENTITY_ID_PATTERN.exec(zone.id)
    if (!match) continue
    const value = Number(match[1])
    if (Number.isFinite(value) && value > zoneEntityCounter) {
      zoneEntityCounter = value
    }
  }
}

export function createEstimateZone(params: {
  name: string
  fields?: Partial<Omit<EstimateZone, 'id' | 'name'>>
}): EstimateZone {
  zoneEntityCounter += 1
  const fields = params.fields ?? {}
  const name = params.name.trim()
  return {
    id: `zone-${zoneEntityCounter}`,
    name,
    zoneType: resolveEstimateZoneType({ name, zoneType: fields.zoneType }),
    floorArea: normalizeNonNegative(fields.floorArea ?? 0),
    demolitionFloorArea: normalizeNonNegative(fields.demolitionFloorArea ?? 0),
    screedArea: normalizeNonNegative(fields.screedArea ?? 0),
    wetArea: normalizeNonNegative(fields.wetArea ?? 0),
    wallArea: normalizeNonNegative(fields.wallArea ?? 0),
    demolitionWallArea: normalizeNonNegative(fields.demolitionWallArea ?? 0),
    plasterArea: normalizeNonNegative(fields.plasterArea ?? 0),
    puttyArea: normalizeNonNegative(fields.puttyArea ?? 0),
    finishArea: normalizeNonNegative(fields.finishArea ?? 0),
    slopesLength: normalizeNonNegative(fields.slopesLength ?? 0),
    cornersLength: normalizeNonNegative(fields.cornersLength ?? 0),
    ceilingArea: normalizeNonNegative(fields.ceilingArea ?? 0),
    demolitionCeilingArea: normalizeNonNegative(fields.demolitionCeilingArea ?? 0),
    plasterCeilingArea: normalizeNonNegative(fields.plasterCeilingArea ?? 0),
    puttyCeilingArea: normalizeNonNegative(fields.puttyCeilingArea ?? 0),
    finishCeilingArea: normalizeNonNegative(fields.finishCeilingArea ?? 0),
    tileFloorArea: normalizeNonNegative(fields.tileFloorArea ?? 0),
    tileWallArea: normalizeNonNegative(fields.tileWallArea ?? 0),
    tileBacksplashArea: normalizeNonNegative(fields.tileBacksplashArea ?? 0),
    tileCuttingLength: normalizeNonNegative(fields.tileCuttingLength ?? 0),
    tileCornerLength: normalizeNonNegative(fields.tileCornerLength ?? 0),
    tileHolesCount: normalizeNonNegative(fields.tileHolesCount ?? 0),
    tileRepairCount: normalizeNonNegative(fields.tileRepairCount ?? 0),
    electricSocketsCount: normalizeNonNegative(fields.electricSocketsCount ?? 0),
    electricSwitchesCount: normalizeNonNegative(fields.electricSwitchesCount ?? 0),
    electricLightPointsCount: normalizeNonNegative(fields.electricLightPointsCount ?? 0),
    electricDataPointsCount: normalizeNonNegative(fields.electricDataPointsCount ?? 0),
    electricStrobeLength: normalizeNonNegative(fields.electricStrobeLength ?? 0),
    electricCableLength: normalizeNonNegative(fields.electricCableLength ?? 0),
    electricSocketBoxesCount: normalizeNonNegative(fields.electricSocketBoxesCount ?? 0),
    electricJunctionBoxesCount: normalizeNonNegative(fields.electricJunctionBoxesCount ?? 0),
    electricPanelModulesCount: normalizeNonNegative(fields.electricPanelModulesCount ?? 0),
    electricWarmFloorArea: normalizeNonNegative(fields.electricWarmFloorArea ?? 0),
    electricApplianceConnectionsCount: normalizeNonNegative(
      fields.electricApplianceConnectionsCount ?? 0,
    ),
    comment: fields.comment?.trim() || undefined,
  }
}

export function updateEstimateZone(
  zones: readonly EstimateZone[],
  zoneId: string,
  patch: Partial<Omit<EstimateZone, 'id'>>,
): EstimateZone[] {
  return zones.map((zone) => {
    if (zone.id !== zoneId) return zone
    const nextName = patch.name === undefined ? zone.name : patch.name.trim() || zone.name
    const nextType =
      patch.zoneType === undefined
        ? // Rename с типом other → можно уточнить по новому имени
          zone.zoneType === 'other'
            ? resolveEstimateZoneType({ name: nextName, zoneType: 'other' })
            : zone.zoneType
        : normalizeEstimateZoneType(patch.zoneType)
    return {
      ...zone,
      name: nextName,
      zoneType: nextType,
      floorArea:
        patch.floorArea === undefined ? zone.floorArea : normalizeNonNegative(patch.floorArea),
      demolitionFloorArea:
        patch.demolitionFloorArea === undefined
          ? zone.demolitionFloorArea
          : normalizeNonNegative(patch.demolitionFloorArea),
      screedArea:
        patch.screedArea === undefined ? zone.screedArea : normalizeNonNegative(patch.screedArea),
      wetArea: patch.wetArea === undefined ? zone.wetArea : normalizeNonNegative(patch.wetArea),
      wallArea: patch.wallArea === undefined ? zone.wallArea : normalizeNonNegative(patch.wallArea),
      demolitionWallArea:
        patch.demolitionWallArea === undefined
          ? zone.demolitionWallArea
          : normalizeNonNegative(patch.demolitionWallArea),
      plasterArea:
        patch.plasterArea === undefined
          ? zone.plasterArea
          : normalizeNonNegative(patch.plasterArea),
      puttyArea:
        patch.puttyArea === undefined ? zone.puttyArea : normalizeNonNegative(patch.puttyArea),
      finishArea:
        patch.finishArea === undefined ? zone.finishArea : normalizeNonNegative(patch.finishArea),
      slopesLength:
        patch.slopesLength === undefined
          ? zone.slopesLength
          : normalizeNonNegative(patch.slopesLength),
      cornersLength:
        patch.cornersLength === undefined
          ? zone.cornersLength
          : normalizeNonNegative(patch.cornersLength),
      ceilingArea:
        patch.ceilingArea === undefined
          ? zone.ceilingArea
          : normalizeNonNegative(patch.ceilingArea),
      demolitionCeilingArea:
        patch.demolitionCeilingArea === undefined
          ? zone.demolitionCeilingArea
          : normalizeNonNegative(patch.demolitionCeilingArea),
      plasterCeilingArea:
        patch.plasterCeilingArea === undefined
          ? zone.plasterCeilingArea
          : normalizeNonNegative(patch.plasterCeilingArea),
      puttyCeilingArea:
        patch.puttyCeilingArea === undefined
          ? zone.puttyCeilingArea
          : normalizeNonNegative(patch.puttyCeilingArea),
      finishCeilingArea:
        patch.finishCeilingArea === undefined
          ? zone.finishCeilingArea
          : normalizeNonNegative(patch.finishCeilingArea),
      tileFloorArea:
        patch.tileFloorArea === undefined
          ? zone.tileFloorArea
          : normalizeNonNegative(patch.tileFloorArea),
      tileWallArea:
        patch.tileWallArea === undefined
          ? zone.tileWallArea
          : normalizeNonNegative(patch.tileWallArea),
      tileBacksplashArea:
        patch.tileBacksplashArea === undefined
          ? zone.tileBacksplashArea
          : normalizeNonNegative(patch.tileBacksplashArea),
      tileCuttingLength:
        patch.tileCuttingLength === undefined
          ? zone.tileCuttingLength
          : normalizeNonNegative(patch.tileCuttingLength),
      tileCornerLength:
        patch.tileCornerLength === undefined
          ? zone.tileCornerLength
          : normalizeNonNegative(patch.tileCornerLength),
      tileHolesCount:
        patch.tileHolesCount === undefined
          ? zone.tileHolesCount
          : normalizeNonNegative(patch.tileHolesCount),
      tileRepairCount:
        patch.tileRepairCount === undefined
          ? zone.tileRepairCount
          : normalizeNonNegative(patch.tileRepairCount),
      electricSocketsCount:
        patch.electricSocketsCount === undefined
          ? zone.electricSocketsCount
          : normalizeNonNegative(patch.electricSocketsCount),
      electricSwitchesCount:
        patch.electricSwitchesCount === undefined
          ? zone.electricSwitchesCount
          : normalizeNonNegative(patch.electricSwitchesCount),
      electricLightPointsCount:
        patch.electricLightPointsCount === undefined
          ? zone.electricLightPointsCount
          : normalizeNonNegative(patch.electricLightPointsCount),
      electricDataPointsCount:
        patch.electricDataPointsCount === undefined
          ? zone.electricDataPointsCount
          : normalizeNonNegative(patch.electricDataPointsCount),
      electricStrobeLength:
        patch.electricStrobeLength === undefined
          ? zone.electricStrobeLength
          : normalizeNonNegative(patch.electricStrobeLength),
      electricCableLength:
        patch.electricCableLength === undefined
          ? zone.electricCableLength
          : normalizeNonNegative(patch.electricCableLength),
      electricSocketBoxesCount:
        patch.electricSocketBoxesCount === undefined
          ? zone.electricSocketBoxesCount
          : normalizeNonNegative(patch.electricSocketBoxesCount),
      electricJunctionBoxesCount:
        patch.electricJunctionBoxesCount === undefined
          ? zone.electricJunctionBoxesCount
          : normalizeNonNegative(patch.electricJunctionBoxesCount),
      electricPanelModulesCount:
        patch.electricPanelModulesCount === undefined
          ? zone.electricPanelModulesCount
          : normalizeNonNegative(patch.electricPanelModulesCount),
      electricWarmFloorArea:
        patch.electricWarmFloorArea === undefined
          ? zone.electricWarmFloorArea
          : normalizeNonNegative(patch.electricWarmFloorArea),
      electricApplianceConnectionsCount:
        patch.electricApplianceConnectionsCount === undefined
          ? zone.electricApplianceConnectionsCount
          : normalizeNonNegative(patch.electricApplianceConnectionsCount),
      comment:
        patch.comment === undefined ? zone.comment : patch.comment.trim() || undefined,
    }
  })
}

export function removeEstimateZone(
  zones: readonly EstimateZone[],
  zoneId: string,
): EstimateZone[] {
  return zones.filter((zone) => zone.id !== zoneId)
}

/** Строки без zoneId — «Общие работы»; с zoneId — зональные. */
export function lineBelongsToZone(
  line: { zoneId?: string },
  zoneId: string | null,
): boolean {
  if (zoneId === null) return !line.zoneId
  return line.zoneId === zoneId
}

/** Удаляет строки сметы, привязанные к зоне (canonical не трогает). */
export function removeEstimateLinesByZoneId<T extends { zoneId?: string }>(
  lines: readonly T[],
  zoneId: string,
): T[] {
  return lines.filter((line) => line.zoneId !== zoneId)
}

/** Синхронизирует snapshot `zoneName` на строках после rename зоны. */
export function syncEstimateLineZoneNames<T extends { zoneId?: string; zoneName?: string }>(
  lines: readonly T[],
  zoneId: string,
  zoneName: string,
): T[] {
  const name = zoneName.trim()
  if (!name) return [...lines]
  return lines.map((line) => (line.zoneId === zoneId ? { ...line, zoneName: name } : line))
}
