import { normalizeNonNegative } from './calculate-line-total'

/**
 * Зона объекта: именованное помещение с площадями для сценариев floors/walls.
 * Не путать с id zoned clone lines (`floors:zone-N`) — здесь сущность `zone-N`.
 */
export type EstimateZoneId = string

export type EstimateZone = {
  id: EstimateZoneId
  name: string
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
  comment?: string
}

export const ESTIMATE_ZONE_NAME_TEMPLATES = [
  'Кухня',
  'Коридор',
  'Санузел',
  'Комната',
] as const

export const EMPTY_ESTIMATE_ZONE_FIELDS: Omit<EstimateZone, 'id' | 'name'> = {
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
  comment: undefined,
}

const ZONE_ENTITY_ID_PATTERN = /^zone-(\d+)$/

let zoneEntityCounter = 0

export function isEstimateZoneId(value: string): boolean {
  return ZONE_ENTITY_ID_PATTERN.test(value)
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
  return {
    id: `zone-${zoneEntityCounter}`,
    name: params.name.trim(),
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
    return {
      ...zone,
      name: patch.name === undefined ? zone.name : patch.name.trim() || zone.name,
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
