import type { WallMeasurements } from './wall-measurements'

export type FootprintPoint = { x: number; y: number }
type Part = NonNullable<WallMeasurements['footprintParts']>[number]
const EPS = 0.000001

const cross = (a: FootprintPoint, b: FootprintPoint, c: FootprintPoint) =>
  (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
const polygonArea = (points: FootprintPoint[]) =>
  Math.abs(
    points.reduce((sum, point, i) => {
      const next = points[(i + 1) % points.length]
      return sum + point.x * next.y - next.x * point.y
    }, 0),
  ) / 2

/** Пересечение выпуклых частей: касание границ не считается двойной площадью. */
function intersectionArea(subject: FootprintPoint[], clip: FootprintPoint[]): number {
  let output = subject
  const orientation = Math.sign(
    clip.reduce((sum, point, i) => {
      const next = clip[(i + 1) % clip.length]
      return sum + point.x * next.y - next.x * point.y
    }, 0),
  )
  for (let i = 0; i < clip.length && output.length; i++) {
    const a = clip[i],
      b = clip[(i + 1) % clip.length]
    const input = output
    output = []
    let start = input[input.length - 1]
    for (const end of input) {
      const ds = cross(a, b, start) * orientation
      const de = cross(a, b, end) * orientation
      if (de >= -EPS !== ds >= -EPS) {
        const t = ds / (ds - de)
        output.push({ x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t })
      }
      if (de >= -EPS) output.push(end)
      start = end
    }
  }
  return output.length >= 3 ? polygonArea(output) : 0
}

function partPolygon(part: Part, length: number, width: number): FootprintPoint[] | null {
  const w = part.widthM,
    h = part.heightM,
    offset = part.offsetM ?? 0
  const corner = part.position?.includes('-')
  if (
    !part.position ||
    (part.operation === 'add' && corner) ||
    (part.operation === 'subtract' && part.shape === 'triangle' && !corner)
  )
    return null
  let x = 0,
    y = 0
  if (corner) {
    x = part.position?.endsWith('right') ? length - w : 0
    y = part.position?.startsWith('bottom') ? width - h : 0
    if (part.shape === 'triangle') {
      const cx = part.position?.endsWith('right') ? length : 0
      const cy = part.position?.startsWith('bottom') ? width : 0
      return [
        { x: cx, y: cy },
        { x: cx === 0 ? w : length - w, y: cy },
        { x: cx, y: cy === 0 ? h : width - h },
      ]
    }
  } else {
    switch (part.position) {
      case 'top':
        x = offset
        y = part.operation === 'add' ? -h : 0
        break
      case 'bottom':
        x = offset
        y = part.operation === 'add' ? width : width - h
        break
      case 'left':
        x = part.operation === 'add' ? -w : 0
        y = offset
        break
      case 'right':
        x = part.operation === 'add' ? length : length - w
        y = offset
        break
    }
    if (part.shape === 'triangle') {
      switch (part.position) {
        case 'top':
          return [
            { x, y: 0 },
            { x: x + w, y: 0 },
            { x, y: -h },
          ]
        case 'bottom':
          return [
            { x, y: width },
            { x: x + w, y: width },
            { x, y: width + h },
          ]
        case 'left':
          return [
            { x: 0, y },
            { x: 0, y: y + h },
            { x: -w, y },
          ]
        case 'right':
          return [
            { x: length, y },
            { x: length, y: y + h },
            { x: length + w, y },
          ]
      }
    }
  }
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ]
}

/** Вид сверху: размеры частей и их положение задают проверяемую схему. */
export function resolveRoomFootprintSketch(measurements: WallMeasurements) {
  const length = measurements.roomLengthM,
    width = measurements.roomWidthM
  const errors: string[] = []
  const pending: string[] = []
  const base = [
    { x: 0, y: 0 },
    { x: length, y: 0 },
    { x: length, y: width },
    { x: 0, y: width },
  ]
  const parts: { index: number; part: Part; points: FootprintPoint[] }[] = []
  if (!(Number.isFinite(length) && Number.isFinite(width) && length > 0 && width > 0))
    return { base, parts, errors, pending: ['Введите длину и ширину комнаты.'] }
  for (const [index, part] of (measurements.footprintParts ?? []).entries()) {
    const label = `Часть ${index + 1}`
    if (!(part.widthM > 0 && part.heightM > 0)) {
      pending.push(`${label}: заполните оба размера.`)
      continue
    }
    const points = partPolygon(part, length, width)
    if (!points) {
      pending.push(`${label}: выберите расположение.`)
      continue
    }
    if (
      (part.offsetM ?? 0) < 0 ||
      !points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
    ) {
      errors.push(`${label}: проверьте отступ и размеры.`)
      continue
    }
    const ownArea = polygonArea(points)
    const insideArea = intersectionArea(points, base)
    if (part.operation === 'subtract' && Math.abs(ownArea - insideArea) > EPS) {
      errors.push(`${label}: вырез выходит за габариты комнаты.`)
      continue
    }
    const vertical = part.position === 'left' || part.position === 'right'
    if (
      part.operation === 'add' &&
      (part.offsetM ?? 0) + (vertical ? part.heightM : part.widthM) >
        (vertical ? width : length) + EPS
    ) {
      errors.push(`${label}: выступ должен примыкать целиком к выбранной стороне.`)
      continue
    }
    for (const previous of parts) {
      if (intersectionArea(points, previous.points) > EPS)
        errors.push(
          `Части ${previous.index + 1} и ${index + 1} перекрываются: измените положение или размеры.`,
        )
    }
    parts.push({ index, part, points })
  }
  return { base, parts, errors, pending }
}
