import { resolveRoomFootprintSketch } from './room-footprint-sketch'

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
  /** Точки контура пола по порядку обхода; последняя соединяется с первой. */
  footprintVertices?: { id: string; xM: number; yM: number }[]
  /** Один прямоугольный вырез или выступ относительно габаритов комнаты. */
  footprintAdjustment?: { kind: 'cutout' | 'extension'; widthM: number; depthM: number }
  footprintParts?: {
    id: string; shape: 'rectangle' | 'triangle'; operation: 'add' | 'subtract'; widthM: number; heightM: number
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'bottom' | 'left' | 'right'
    offsetM?: number
  }[]
  footprintKnownArea?: number
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
  if (measurements.footprintKnownArea !== undefined)
    return valid(measurements.footprintKnownArea) ? roundArea(measurements.footprintKnownArea) : null
  if (measurements.footprintVertices?.length) {
    const points = measurements.footprintVertices
    if (points.length < 3 || points.some((point) => !Number.isFinite(point.xM) || !Number.isFinite(point.yM))) return null
    if (footprintHasIntersections(points)) return null
    const twiceArea = points.reduce((sum, point, index) => {
      const next = points[(index + 1) % points.length]
      return sum + point.xM * next.yM - next.xM * point.yM
    }, 0)
    return Math.abs(twiceArea) > 0.000001 ? roundArea(Math.abs(twiceArea) / 2) : null
  }
  if (!valid(measurements.roomLengthM) || !valid(measurements.roomWidthM)) return null
  const base = measurements.roomLengthM * measurements.roomWidthM
  if (measurements.footprintParts?.length) {
    if (measurements.footprintParts.some((part) => !valid(part.widthM) || !valid(part.heightM))) return null
    if (resolveRoomFootprintSketch(measurements).errors.length) return null
    const area = measurements.footprintParts.reduce((sum, part) => sum +
      (part.operation === 'add' ? 1 : -1) * part.widthM * part.heightM /
      (part.shape === 'triangle' ? 2 : 1), base)
    return area > 0 ? roundArea(area) : null
  }
  const adjustment = measurements.footprintAdjustment
  if (!adjustment) return roundArea(base)
  if (!valid(adjustment.widthM) || !valid(adjustment.depthM) ||
      (adjustment.kind === 'cutout' &&
        (adjustment.widthM >= measurements.roomLengthM || adjustment.depthM >= measurements.roomWidthM)))
    return null
  const area = base + (adjustment.kind === 'extension' ? 1 : -1) * adjustment.widthM * adjustment.depthM
  return area > 0 ? roundArea(area) : null
}

export function roomFootprintPerimeter(measurements: WallMeasurements): number | null {
  const points = measurements.footprintVertices
  if (points?.length) {
    if (roomFootprintArea(measurements) === null) return null
    return roundArea(points.reduce((sum, point, index) => {
      const next = points[(index + 1) % points.length]
      return sum + Math.hypot(next.xM - point.xM, next.yM - point.yM)
    }, 0))
  }
  if (roomFootprintArea(measurements) === null) return null
  if (measurements.footprintKnownArea !== undefined || measurements.footprintParts?.length || measurements.footprintAdjustment) {
    return measurements.walls.length >= 3 && measurements.walls.every((wall) => valid(wall.lengthM))
      ? roundArea(measurements.walls.reduce((sum, wall) => sum + wall.lengthM, 0)) : null
  }
  return roundArea(2 * (measurements.roomLengthM + measurements.roomWidthM))
}

function footprintHasIntersections(points: NonNullable<WallMeasurements['footprintVertices']>): boolean {
  const turn = (a: typeof points[number], b: typeof points[number], c: typeof points[number]) =>
    (b.xM - a.xM) * (c.yM - a.yM) - (b.yM - a.yM) * (c.xM - a.xM)
  const onSegment = (a: typeof points[number], b: typeof points[number], c: typeof points[number]) =>
    Math.min(a.xM, b.xM) <= c.xM && c.xM <= Math.max(a.xM, b.xM) &&
    Math.min(a.yM, b.yM) <= c.yM && c.yM <= Math.max(a.yM, b.yM)
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length]
    if (Math.hypot(b.xM - a.xM, b.yM - a.yM) < 0.000001) return true
    for (let j = i + 1; j < points.length; j++) {
      if (j === i + 1 || (i === 0 && j === points.length - 1)) continue
      const c = points[j], d = points[(j + 1) % points.length]
      const abC = turn(a, b, c), abD = turn(a, b, d)
      const cdA = turn(c, d, a), cdB = turn(c, d, b)
      if ((abC * abD < 0 && cdA * cdB < 0) ||
        (abC === 0 && onSegment(a, b, c)) || (abD === 0 && onSegment(a, b, d)) ||
        (cdA === 0 && onSegment(c, d, a)) || (cdB === 0 && onSegment(c, d, b))) return true
    }
  }
  return false
}

/** Заполняет пол и потолок из габаритов комнаты, но не перезаписывает их ручную правку. */
export function syncRoomFootprintAreas(
  previous: WallMeasurements,
  next: WallMeasurements,
  floorArea: number,
  ceilingArea: number,
): { measurements: WallMeasurements; floorArea?: number; ceilingArea?: number } {
  const area = roomFootprintArea(next)
  const lastAuto = previous.autoFootprintArea ?? roomFootprintArea(previous) ?? 0
  if (area === null) {
    if (next.footprintKnownArea !== undefined || next.footprintAdjustment || next.footprintVertices?.length || next.footprintParts?.length) return {
      measurements: { ...next, autoFootprintArea: undefined },
      ...(floorArea === lastAuto ? { floorArea: 0 } : {}),
      ...(ceilingArea === lastAuto ? { ceilingArea: 0 } : {}),
    }
    return { measurements: next }
  }
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
