import { useId } from 'react'

import { resolveRoomFootprintSketch, type WallMeasurements } from '@/entities/estimate'

import styles from './WallMeasurementEditor.module.scss'

const format = (value: number) => value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })

export function FloorShapePreview({ measurements }: { measurements: WallMeasurements }) {
  const maskId = `floor-${useId().replace(/:/g, '')}`
  const sketch = resolveRoomFootprintSketch(measurements)
  const contour = measurements.footprintVertices?.map((point) => ({ x: point.xM, y: point.yM }))
  const base = contour?.length ? contour : sketch.base
  const parts = contour?.length ? [] : sketch.parts
  const points = [...base, ...parts.flatMap((part) => part.points)]
  const drawable =
    measurements.footprintKnownArea === undefined &&
    points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y)) &&
    (contour?.length || (measurements.roomLengthM > 0 && measurements.roomWidthM > 0))
  if (!drawable)
    return (
      <p className={styles.hint}>
        {measurements.footprintKnownArea !== undefined
          ? 'По одной площади форму определить нельзя. Для схемы выберите расчёт по размерам и частям.'
          : 'Введите длину и ширину комнаты выше — здесь появится вид сверху.'}
      </p>
    )
  const minX = Math.min(...points.map((point) => point.x))
  const minY = Math.min(...points.map((point) => point.y))
  const rangeX = Math.max(...points.map((point) => point.x)) - minX
  const rangeY = Math.max(...points.map((point) => point.y)) - minY
  const scale = Math.min(400 / Math.max(rangeX, 0.001), 220 / Math.max(rangeY, 0.001))
  const left = (480 - rangeX * scale) / 2,
    top = (300 - rangeY * scale) / 2
  const x = (value: number) => left + (value - minX) * scale
  const y = (value: number) => top + (value - minY) * scale
  const polygon = (vertices: typeof base) =>
    vertices.map((point) => `${x(point.x)},${y(point.y)}`).join(' ')
  return (
    <div className={styles.floorPreview}>
      <strong>Вид сверху · схема по вашим размерам</strong>
      <svg
        viewBox="0 0 480 300"
        role="img"
        aria-label="Форма пола: основная часть с вычетами и выступами"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="480" height="300">
            <polygon points={polygon(base)} fill="white" />
            {parts
              .filter(({ part }) => part.operation === 'add')
              .map(({ part, points: vertices }) => (
                <polygon key={part.id} points={polygon(vertices)} fill="white" />
              ))}
            {parts
              .filter(({ part }) => part.operation === 'subtract')
              .map(({ part, points: vertices }) => (
                <polygon key={part.id} points={polygon(vertices)} fill="black" />
              ))}
          </mask>
        </defs>
        <rect width="480" height="300" mask={`url(#${maskId})`} className={styles.previewFill} />
        <polygon points={polygon(base)} className={styles.previewBase} />
        {parts.map(({ index, part, points: vertices }) => (
          <g key={part.id}>
            <polygon
              points={polygon(vertices)}
              className={
                part.operation === 'subtract' ? styles.previewCutout : styles.previewAddition
              }
            />
            <text
              x={x(vertices.reduce((sum, point) => sum + point.x, 0) / vertices.length)}
              y={y(vertices.reduce((sum, point) => sum + point.y, 0) / vertices.length)}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {part.operation === 'subtract' ? '−' : '+'}
              {index + 1}
            </text>
          </g>
        ))}
        {!contour?.length ? (
          <>
            <text x={x(measurements.roomLengthM / 2)} y={y(0) - 12} textAnchor="middle">
              {format(measurements.roomLengthM)} м
            </text>
            <text x={x(0) - 8} y={y(measurements.roomWidthM / 2)} textAnchor="end">
              {format(measurements.roomWidthM)} м
            </text>
          </>
        ) : null}
      </svg>
      <p className={styles.hint}>
        Закрашено — пол. Пунктир — исходный прямоугольник; номера соответствуют частям в списке
        ниже.
      </p>
      {!contour?.length && sketch.pending.length ? (
        <p className={styles.pending} role="status">
          Схема пока неполная: {sketch.pending.join(' ')}
        </p>
      ) : null}
      {!contour?.length && sketch.errors.length ? (
        <ul className={styles.errors} role="alert">
          {sketch.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
