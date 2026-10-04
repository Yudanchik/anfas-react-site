/** Исходные замеры сохраняются отдельно от утверждённых объёмов работ. Размеры — метры. */
export type WallOpening = {
  id: string
  kind: 'window' | 'door'
  widthM: number
  heightM: number
  count: number
  deduct: boolean
  finishSlopes: boolean
  slopeSides: 3 | 4
}

export type MeasuredWall = {
  id: string
  name: string
  lengthM: number
  heightM: number
  lengthSource?: 'room-length' | 'room-width'
  heightSource?: 'room-height'
  openings: WallOpening[]
}

export type WallMeasurements = {
  roomLengthM: number
  roomWidthM: number
  roomHeightM: number
  /** Последняя площадь, автоматически переданная в полы и потолки. */
  autoFootprintArea?: number
  walls: MeasuredWall[]
}

export type WallMeasurementTotals = {
  grossArea: number
  deductedArea: number
  netArea: number
  slopesLength: number
  errors: string[]
}

export const EMPTY_WALL_MEASUREMENTS: WallMeasurements = {
  roomLengthM: 0,
  roomWidthM: 0,
  roomHeightM: 0,
  walls: [],
}

const roundArea = (value: number) => Math.round(value * 100) / 100
const valid = (value: number) => Number.isFinite(value) && value > 0

export function roomFootprintArea(measurements: WallMeasurements): number | null {
  return valid(measurements.roomLengthM) && valid(measurements.roomWidthM)
    ? roundArea(measurements.roomLengthM * measurements.roomWidthM) : null
}

/** Заполняет пол и потолок из габаритов комнаты, но не перезаписывает их ручную правку. */
export function syncRoomFootprintAreas(
  previous: WallMeasurements,
  next: WallMeasurements,
  floorArea: number,
  ceilingArea: number,
): { measurements: WallMeasurements; floorArea?: number; ceilingArea?: number } {
  const area = roomFootprintArea(next)
  if (area === null) return { measurements: next }
  const lastAuto = previous.autoFootprintArea ?? roomFootprintArea(previous) ?? 0
  return {
    measurements: { ...next, autoFootprintArea: area },
    ...(floorArea === 0 || floorArea === lastAuto ? { floorArea: area } : {}),
    ...(ceilingArea === 0 || ceilingArea === lastAuto ? { ceilingArea: area } : {}),
  }
}

/** Полный проём вычитается из стены; откосы считаются отдельно только по выбору. */
export function calculateWallMeasurements(measurements: WallMeasurements): WallMeasurementTotals {
  let grossArea = 0
  let deductedArea = 0
  let slopesLength = 0
  const errors: string[] = []

  if (measurements.walls.length === 0) errors.push('Добавьте хотя бы одну стену.')
  for (const [wallIndex, wall] of measurements.walls.entries()) {
    const label = wall.name.trim() || `Стена ${wallIndex + 1}`
    if (!valid(wall.lengthM) || !valid(wall.heightM)) {
      errors.push(`${label}: укажите длину и высоту.`)
      continue
    }
    const wallArea = wall.lengthM * wall.heightM
    let wallDeduction = 0
    grossArea += wallArea
    for (const [openingIndex, opening] of wall.openings.entries()) {
      const openingLabel = `${label}, проём ${openingIndex + 1}`
      if (!valid(opening.widthM) || !valid(opening.heightM) ||
          !Number.isInteger(opening.count) || opening.count < 1) {
        errors.push(`${openingLabel}: укажите ширину, высоту и количество.`)
        continue
      }
      if (opening.widthM > wall.lengthM || opening.heightM > wall.heightM) {
        errors.push(`${openingLabel}: размеры превышают размеры стены.`)
        continue
      }
      if (opening.deduct) wallDeduction += opening.widthM * opening.heightM * opening.count
      if (opening.finishSlopes) {
        slopesLength += ((opening.slopeSides === 4 ? 2 : 1) * opening.widthM
          + 2 * opening.heightM) * opening.count
      }
    }
    if (wallDeduction > wallArea + 0.000001) {
      errors.push(`${label}: суммарная площадь проёмов превышает площадь стены.`)
    }
    deductedArea += wallDeduction
  }

  return {
    grossArea: roundArea(grossArea),
    deductedArea: roundArea(deductedArea),
    netArea: roundArea(Math.max(0, grossArea - deductedArea)),
    slopesLength: roundArea(slopesLength),
    errors,
  }
}

/** Меняет связанные стены вместе с габаритами комнаты; ручные размеры сохраняет. */
export function updateRoomDimensions(
  measurements: WallMeasurements,
  patch: Partial<Pick<WallMeasurements, 'roomLengthM' | 'roomWidthM' | 'roomHeightM'>>,
): WallMeasurements {
  const next = { ...measurements, ...patch }
  return {
    ...next,
    walls: next.walls.map((wall) => ({
      ...wall,
      lengthM: wall.lengthSource === 'room-length' ? next.roomLengthM
        : wall.lengthSource === 'room-width' ? next.roomWidthM : wall.lengthM,
      heightM: wall.heightSource === 'room-height' ? next.roomHeightM : wall.heightM,
    })),
  }
}

/** Явно привязывает существующие четыре стены к комнате, не удаляя проёмы. */
export function relinkRectangularWalls(measurements: WallMeasurements): WallMeasurements {
  if (measurements.walls.length !== 4 ||
      ![measurements.roomLengthM, measurements.roomWidthM, measurements.roomHeightM].every(valid)) {
    return measurements
  }
  const sources = ['room-length', 'room-width', 'room-length', 'room-width'] as const
  return {
    ...measurements,
    walls: measurements.walls.map((wall, index) => ({
      ...wall,
      lengthSource: sources[index],
      lengthM: index % 2 === 0 ? measurements.roomLengthM : measurements.roomWidthM,
      heightSource: 'room-height',
      heightM: measurements.roomHeightM,
    })),
  }
}

/** Для прямоугольной комнаты — быстрый черновик; отдельные стены можно уточнить. */
export function createRectangularWalls(lengthM: number, widthM: number, heightM: number): MeasuredWall[] {
  if (![lengthM, widthM, heightM].every(valid)) return []
  return [lengthM, widthM, lengthM, widthM].map((wallLength, index) => ({
    id: globalThis.crypto.randomUUID(),
    name: `Стена ${index + 1}`,
    lengthM: wallLength,
    heightM,
    lengthSource: (index % 2 === 0 ? 'room-length' : 'room-width') as MeasuredWall['lengthSource'],
    heightSource: 'room-height' as const,
    openings: [],
  }))
}
