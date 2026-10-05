import { useId, useState } from 'react'

import { roomFootprintArea, type WallMeasurements } from '@/entities/estimate'

import { EstimateNumberInput } from './EstimateNumberInput'
import { FloorShapePreview } from './FloorShapePreview'
import styles from './WallMeasurementEditor.module.scss'

type Props = { measurements: WallMeasurements; onChange: (next: WallMeasurements) => void }
type Part = NonNullable<WallMeasurements['footprintParts']>[number]
const format = (value: number) => value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })
const positions: { value: NonNullable<Part['position']>; label: string }[] = [
  { value: 'top-left', label: 'Верхний левый угол' },
  { value: 'top-right', label: 'Верхний правый угол' },
  { value: 'bottom-left', label: 'Нижний левый угол' },
  { value: 'bottom-right', label: 'Нижний правый угол' },
  { value: 'top', label: 'Верхняя сторона' },
  { value: 'bottom', label: 'Нижняя сторона' },
  { value: 'left', label: 'Левая сторона' },
  { value: 'right', label: 'Правая сторона' },
]

export function FloorShapeEditor({ measurements, onChange }: Props) {
  const knownAreaId = useId()
  const partContentId = useId()
  const [expandedPartId, setExpandedPartId] = useState<string | null>(null)
  const area = roomFootprintArea(measurements)
  const manual = measurements.footprintKnownArea !== undefined
  const oldContour = Boolean(measurements.footprintVertices?.length)
  const adjustment = measurements.footprintAdjustment
  const parts: Part[] =
    measurements.footprintParts ??
    (adjustment
      ? [
          {
            id: 'previous-adjustment',
            shape: 'rectangle',
            operation: adjustment.kind === 'cutout' ? 'subtract' : 'add',
            widthM: adjustment.widthM,
            heightM: adjustment.depthM,
          },
        ]
      : [])
  function saveParts(next: Part[]) {
    onChange({
      ...measurements,
      footprintParts: next.length ? next : undefined,
      footprintAdjustment: undefined,
      footprintVertices: undefined,
      footprintKnownArea: undefined,
    })
  }
  function add(shape: Part['shape'], operation: Part['operation']) {
    const id = globalThis.crypto.randomUUID()
    saveParts([
      ...parts,
      {
        id,
        shape,
        operation,
        widthM: 0,
        heightM: 0,
        position: operation === 'add' ? 'right' : 'top-left',
        offsetM: 0,
      },
    ])
    setExpandedPartId(id)
  }
  function updatePart(id: string, patch: Partial<Part>) {
    saveParts(parts.map((part) => (part.id === id ? { ...part, ...patch } : part)))
  }
  return (
    <details className={styles.floorShape}>
      <summary>
        Площадь пола и потолка · {area === null ? 'нужны замеры' : `${format(area)} м²`}
      </summary>
      <div className={styles.floorShapeContent}>
        <label className={styles.kind}>
          Как удобнее указать площадь?
          <select
            value={oldContour ? 'saved' : manual ? 'manual' : 'parts'}
            onChange={(event) => {
              if (event.target.value === 'manual')
                onChange({
                  ...measurements,
                  footprintKnownArea: area ?? 0,
                  footprintVertices: undefined,
                  footprintAdjustment: undefined,
                  footprintParts: undefined,
                })
              else saveParts([])
            }}
          >
            <option value="parts">Посчитать по размерам и простым частям</option>
            <option value="manual">Уже знаю площадь — ввести м²</option>
            {oldContour ? <option value="saved">Сохранённый точный план</option> : null}
          </select>
        </label>
        {manual ? (
          <label className={styles.measure} htmlFor={knownAreaId}>
            Площадь пола, м²
            <EstimateNumberInput
              id={knownAreaId}
              value={measurements.footprintKnownArea ?? 0}
              aria-label="Известная площадь пола, м²"
              onValueChange={(footprintKnownArea) =>
                onChange({ ...measurements, footprintKnownArea })
              }
            />
            <small>Эту же площадь подставим в потолок, если его объём не исправлен вручную.</small>
          </label>
        ) : oldContour ? (
          <p className={styles.hint}>
            Площадь из ранее сохранённого плана сохранена. Чтобы пересчитать без координат, выберите
            «Посчитать по размерам и простым частям» — прежний план будет заменён.
          </p>
        ) : (
          <>
            <p className={styles.hint}>
              Смотрите на комнату сверху. Для прямоугольной комнаты достаточно длины и ширины выше.
              Для сложной формы мысленно достройте её до прямоугольника и укажите его размеры выше.
              Затем вычтите отсутствующие части или прибавьте выступы.
            </p>
            <div className={styles.shapeExample}>
              <svg
                viewBox="0 0 160 105"
                role="img"
                aria-label="Скошенный угол: измерьте горизонтальный отступ A и вертикальный отступ B"
              >
                <path
                  d="M20 90 H140 V20 H70 L20 55 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M20 55 V20 H70" fill="none" stroke="currentColor" strokeDasharray="4 3" />
                <text x="40" y="15">
                  A
                </text>
                <text x="5" y="40">
                  B
                </text>
              </svg>
              <p className={styles.hint}>
                Для комнаты со скосом добавьте «Скошенный угол». A — отступ по горизонтали, B — по
                вертикали, от угла достроенного прямоугольника до концов скоса. Длину самой
                наклонной стены сюда вводить не нужно. Вычтем A × B ÷ 2.
              </p>
            </div>
            <div className={styles.floorShapeWorkspace}>
              <div className={styles.floorParts}>
                {parts.map((part, index) => {
                  const expanded = expandedPartId === part.id
                  const side = part.position && !part.position.includes('-')
                  const horizontal = part.position === 'top' || part.position === 'bottom'
                  return (
                    <div className={styles.wall} data-open={expanded} key={part.id}>
                      <div className={styles.wallRow}>
                        <button
                          type="button"
                          className={styles.wallSummary}
                          aria-expanded={expanded}
                          aria-controls={`${partContentId}-${part.id}`}
                          onClick={() => setExpandedPartId(expanded ? null : part.id)}
                        >
                          <span className={styles.wallSummaryName}>
                            Часть {index + 1}:{' '}
                            {part.shape === 'triangle' ? 'треугольник' : 'прямоугольник'}
                          </span>
                          <span className={styles.wallSummaryMeta}>
                            {part.operation === 'subtract' ? 'Вычесть' : 'Прибавить'} ·{' '}
                            {format(part.widthM)} × {format(part.heightM)} м ·{' '}
                            {positions.find((position) => position.value === part.position)
                              ?.label ?? 'место не задано'}
                          </span>
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          aria-label={`Удалить часть ${index + 1}`}
                          onClick={() => saveParts(parts.filter((entry) => entry.id !== part.id))}
                        >
                          Удалить
                        </button>
                      </div>
                      {expanded ? (
                        <div className={styles.wallContent} id={`${partContentId}-${part.id}`}>
                          <label className={styles.kind}>
                            Что сделать с этой частью?
                            <select
                              value={part.operation}
                              onChange={(event) =>
                                updatePart(part.id, {
                                  operation: event.target.value as Part['operation'],
                                  position: undefined,
                                  offsetM: 0,
                                })
                              }
                            >
                              <option value="subtract">Вычесть — этой части пола нет</option>
                              <option value="add">Прибавить — дополнительная часть пола</option>
                            </select>
                          </label>
                          <label className={styles.kind}>
                            Где находится часть на схеме?
                            <select
                              value={part.position ?? ''}
                              onChange={(event) =>
                                updatePart(part.id, {
                                  position: event.target.value as Part['position'],
                                  offsetM: 0,
                                })
                              }
                            >
                              <option value="" disabled>
                                Выберите место
                              </option>
                              {positions
                                .filter((position) =>
                                  part.operation === 'add'
                                    ? !position.value.includes('-')
                                    : part.shape === 'triangle'
                                      ? position.value.includes('-')
                                      : true,
                                )
                                .map((position) => (
                                  <option key={position.value} value={position.value}>
                                    {position.label}
                                  </option>
                                ))}
                            </select>
                          </label>
                          <div className={styles.adjustmentFields}>
                            <label
                              className={styles.measure}
                              htmlFor={`${partContentId}-${index}-width`}
                            >
                              A — по горизонтали, м
                              <EstimateNumberInput
                                id={`${partContentId}-${index}-width`}
                                value={part.widthM}
                                aria-label={`Часть ${index + 1}, длина или основание`}
                                onValueChange={(widthM) => updatePart(part.id, { widthM })}
                              />
                            </label>
                            <label
                              className={styles.measure}
                              htmlFor={`${partContentId}-${index}-height`}
                            >
                              B — по вертикали, м
                              <EstimateNumberInput
                                id={`${partContentId}-${index}-height`}
                                value={part.heightM}
                                aria-label={`Часть ${index + 1}, ширина или высота`}
                                onValueChange={(heightM) => updatePart(part.id, { heightM })}
                              />
                            </label>
                          </div>
                          {side ? (
                            <label
                              className={styles.measure}
                              htmlFor={`${partContentId}-${index}-offset`}
                            >
                              {horizontal
                                ? 'Отступ от левого края, м'
                                : 'Отступ от верхнего края, м'}
                              <EstimateNumberInput
                                id={`${partContentId}-${index}-offset`}
                                value={part.offsetM ?? 0}
                                aria-label={`Часть ${index + 1}, отступ`}
                                onValueChange={(offsetM) => updatePart(part.id, { offsetM })}
                              />
                              <small>
                                0 — часть начинается от края. Увеличьте отступ, чтобы сдвинуть её
                                вдоль выбранной стороны.
                              </small>
                            </label>
                          ) : null}
                          <p className={styles.hint}>
                            {part.widthM > 0 && part.heightM > 0
                              ? `${part.operation === 'subtract' ? 'Вычтем' : 'Прибавим'} ${format((part.widthM * part.heightM) / (part.shape === 'triangle' ? 2 : 1))} м².`
                              : 'Введите оба размера этой части.'}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
                <div className={styles.commands}>
                  <button
                    type="button"
                    className={styles.secondary}
                    disabled={parts.length >= 20}
                    onClick={() => add('rectangle', 'subtract')}
                  >
                    + Прямоугольный вырез
                  </button>
                  <button
                    type="button"
                    className={styles.secondary}
                    disabled={parts.length >= 20}
                    onClick={() => add('triangle', 'subtract')}
                  >
                    + Скошенный угол
                  </button>
                  <button
                    type="button"
                    className={styles.secondary}
                    disabled={parts.length >= 20}
                    onClick={() => add('rectangle', 'add')}
                  >
                    + Выступ
                  </button>
                </div>
                <p className={styles.hint}>
                  Части не должны перекрываться. Одну и ту же площадь учитывайте только один раз.
                </p>
              </div>
              <FloorShapePreview measurements={{ ...measurements, footprintParts: parts }} />
            </div>
          </>
        )}
        {manual || oldContour ? <FloorShapePreview measurements={measurements} /> : null}
        <p className={styles.hint} role="status">
          {area === null
            ? 'Площадь пока не определена: заполните размеры; сумма вычетов должна быть меньше площади комнаты.'
            : `Расчётная площадь: ${format(area)} м². Пол и потолок обновляются автоматически; их ручные правки сохраняются.`}
        </p>
        <p className={styles.hint}>
          Для плинтуса в сложной комнате замерьте все стены по границе пола ниже, включая наклонные.
          Длину плинтуса возьмём из этих стен и вычтем дверные проёмы. Площадь сама по себе не
          определяет периметр. В списке должны быть только реальные стены: уточните исходные четыре
          стены, если форма комнаты изменилась.
        </p>
      </div>
    </details>
  )
}
