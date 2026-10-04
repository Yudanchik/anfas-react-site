import { useState } from 'react'

import {
  calculateWallMeasurements,
  createRectangularWalls,
  EMPTY_WALL_MEASUREMENTS,
  syncRoomFootprintAreas,
  updateRoomDimensions,
  type EstimateZone,
  type MeasuredWall,
  type WallMeasurements,
  type WallOpening,
} from '@/entities/estimate'

import { EstimateNumberInput } from './EstimateNumberInput'
import styles from './WallMeasurementEditor.module.scss'

type Props = {
  zone: EstimateZone
  onPatch: (patch: Partial<Omit<EstimateZone, 'id'>>) => void
}

const newId = () => globalThis.crypto.randomUUID()
const format = (value: number) => value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })

export function WallMeasurementEditor({ zone, onPatch }: Props) {
  const measurements = zone.wallMeasurements ?? EMPTY_WALL_MEASUREMENTS
  const totals = calculateWallMeasurements(measurements)
  const canCreateWalls = measurements.roomLengthM > 0 && measurements.roomWidthM > 0 && measurements.roomHeightM > 0
  const [expandedOpeningId, setExpandedOpeningId] = useState<string | null>(null)
  const [expandedWallId, setExpandedWallId] = useState<string | null>(null)
  function save(next: WallMeasurements) {
    const result = calculateWallMeasurements(next)
    const footprint = syncRoomFootprintAreas(measurements, next, zone.floorArea, zone.ceilingArea)
    const shared = { wallMeasurements: footprint.measurements, floorArea: footprint.floorArea ?? zone.floorArea, ceilingArea: footprint.ceilingArea ?? zone.ceilingArea }
    onPatch(result.errors.length === 0 && result.netArea > 0
      ? { ...shared, wallArea: result.netArea, slopesLength: result.slopesLength }
      : next.walls.length === 0 && measurements.walls.length > 0
        ? { ...shared, wallArea: 0, slopesLength: 0 }
        : shared)
  }

  function updateWall(wallId: string, patch: Partial<MeasuredWall>) {
    save({
      ...measurements,
      walls: measurements.walls.map((wall) => wall.id === wallId ? { ...wall, ...patch } : wall),
    })
  }

  function updateOpening(wall: MeasuredWall, openingId: string, patch: Partial<WallOpening>) {
    updateWall(wall.id, {
      openings: wall.openings.map((opening) => opening.id === openingId
        ? { ...opening, ...patch }
        : opening),
    })
  }

  function addOpening(wall: MeasuredWall) {
    const id = newId()
    setExpandedOpeningId(id)
    updateWall(wall.id, { openings: [...wall.openings, {
      id, kind: 'window', widthM: 0, heightM: 0, count: 1, deduct: true, finishSlopes: false, slopeSides: 3,
    }] })
  }

  return (
    <section className={styles.wrap} aria-label={`Замеры стен помещения ${zone.name}`}>
      <div className={styles.head}>
        <div>
          <h3 className={styles.title}>Замеры помещения</h3>
          <p className={styles.hint}>Можно замерить комнату и проёмы либо ввести уже известную общую площадь стен без подробного замера.</p>
        </div>
        <span className={styles.badge}>Замеры</span>
      </div>

      {measurements.walls.length === 0 ? <div className={styles.manualArea}>
        <span>Уже знаете общую площадь стен? Введите её здесь, м²</span>
        <EstimateNumberInput value={zone.wallArea} onValueChange={(wallArea) => onPatch({ wallArea })} aria-label="Готовая площадь стен помещения, м²" />
        <small>Можно сразу перейти к сценарию. Если позже создадите стены, их замер заменит эту площадь.</small>
      </div> : null}

      <div className={styles.dimensions}>
        <Measure label="Длина комнаты" value={measurements.roomLengthM}
          onChange={(roomLengthM) => save(updateRoomDimensions(measurements, { roomLengthM }))} />
        <Measure label="Ширина комнаты" value={measurements.roomWidthM}
          onChange={(roomWidthM) => save(updateRoomDimensions(measurements, { roomWidthM }))} />
        <Measure label="Высота" value={measurements.roomHeightM}
          onChange={(roomHeightM) => save(updateRoomDimensions(measurements, { roomHeightM }))} />
      </div>
      <div className={styles.commands}>
        <button type="button" className={styles.secondary} disabled={!canCreateWalls || measurements.walls.length > 0}
          onClick={() => save({ ...measurements, walls: createRectangularWalls(measurements.roomLengthM, measurements.roomWidthM, measurements.roomHeightM) })}>
          Создать 4 стены
        </button>
      </div>
      {measurements.walls.length > 0 ? <p className={styles.hint}>Размеры стен обновляются вместе с комнатой. Площадь пола и потолка тоже заполнится автоматически; при необходимости её можно уточнить в их разделах.</p> : null}

      <div className={styles.walls} aria-label="Список стен помещения">
        {measurements.walls.map((wall, index) => {
          const wallTotals = calculateWallMeasurements({ ...measurements, walls: [wall] })
          const wallLabel = wall.name.trim() || `Стена ${index + 1}`
          const expandedWall = expandedWallId === wall.id
          return <div className={styles.wall} key={wall.id} data-open={expandedWall ? 'true' : 'false'}>
            <div className={styles.wallRow}>
              <button type="button" className={styles.wallSummary} aria-expanded={expandedWall} onClick={() => setExpandedWallId(expandedWall ? null : wall.id)}>
                <span className={styles.wallSummaryName}>{wallLabel}</span>
                <span className={styles.wallSummaryMeta}>
                ширина {format(wall.lengthM)} м · высота {format(wall.heightM)} м · {wallTotals.errors.length ? 'проверьте замер' : `${format(wallTotals.netArea)} м²`}
                {wall.openings.length > 0 ? ` · проёмов: ${wall.openings.length}` : ''}
                {!wall.lengthSource || !wall.heightSource ? ' · размер изменён вручную' : ''}
                </span>
              </button>
              <button type="button" className={styles.deleteBtn} aria-label={`Удалить стену ${wallLabel}`}
                onClick={() => {
                  if (expandedWall) setExpandedWallId(null)
                  save({ ...measurements, walls: measurements.walls.filter((item) => item.id !== wall.id) })
                }}>Удалить</button>
            </div>
            {expandedWall ? <div className={styles.wallContent}>
              <label className={styles.wallName}>
                <span>Название стены</span>
                <input value={wall.name} maxLength={60} onChange={(event) => updateWall(wall.id, { name: event.target.value })} />
              </label>
              <details className={styles.optionalDimensions}>
                <summary>Размер этой стены отличается от комнаты?</summary>
                <p className={styles.hint}>Измените размер только для этой стены. Остальные продолжат обновляться вместе с комнатой.</p>
                <div className={styles.dimensions}>
                  <Measure label="Ширина стены" value={wall.lengthM}
                    onChange={(lengthM) => updateWall(wall.id, { lengthM, lengthSource: undefined })} />
                  <Measure label="Высота стены" value={wall.heightM}
                    onChange={(heightM) => updateWall(wall.id, { heightM, heightSource: undefined })} />
                </div>
              </details>
              {wall.openings.length > 0 ? <div className={styles.openingList} aria-label={`Проёмы стены ${wallLabel}`}>
                {wall.openings.map((opening, openingIndex) => {
                  const expanded = expandedOpeningId === opening.id
                  return <div className={styles.opening} key={opening.id}>
                    <div className={styles.openingRow}>
                      <button type="button" className={styles.openingToggle} aria-expanded={expanded}
                        onClick={() => setExpandedOpeningId(expanded ? null : opening.id)}>
                        <strong>{opening.kind === 'window' ? 'Окно' : 'Дверь'} {openingIndex + 1}</strong>
                        <span>{opening.widthM > 0 && opening.heightM > 0
                          ? `${format(opening.widthM)} × ${format(opening.heightM)} м · ${opening.count} шт.`
                          : 'Укажите размеры'}{opening.finishSlopes ? ' · откосы' : ''}{opening.deduct ? '' : ' · без вычета'}</span>
                      </button>
                      <button type="button" className={styles.deleteBtn} aria-label={`Удалить проём ${openingIndex + 1} стены ${wallLabel}`}
                        onClick={() => {
                          if (expanded) setExpandedOpeningId(null)
                          updateWall(wall.id, { openings: wall.openings.filter((item) => item.id !== opening.id) })
                        }}>Удалить</button>
                    </div>
                    {expanded ? <div className={styles.openingDetails}>
                      <label className={styles.kind}>
                        <span>Тип проёма</span>
                        <select value={opening.kind} onChange={(event) => updateOpening(wall, opening.id, { kind: event.target.value as WallOpening['kind'] })}>
                          <option value="window">Окно</option>
                          <option value="door">Дверь</option>
                        </select>
                      </label>
                      <div className={styles.dimensions}>
                        <Measure label="Ширина проёма" value={opening.widthM} onChange={(widthM) => updateOpening(wall, opening.id, { widthM })} />
                        <Measure label="Высота проёма" value={opening.heightM} onChange={(heightM) => updateOpening(wall, opening.id, { heightM })} />
                        <div className={styles.measure}>
                          <span>Количество</span>
                          <EstimateNumberInput value={opening.count} aria-label={`Количество проёмов ${openingIndex + 1}`}
                            onValueChange={(count) => updateOpening(wall, opening.id, { count: Math.floor(count) })} />
                        </div>
                      </div>
                      <div className={styles.checks}>
                        <label><input type="checkbox" checked={opening.deduct} onChange={(event) => updateOpening(wall, opening.id, { deduct: event.target.checked })} /> Вычесть из стены</label>
                        <label><input type="checkbox" checked={opening.finishSlopes} onChange={(event) => updateOpening(wall, opening.id, { finishSlopes: event.target.checked })} /> Замерить откосы</label>
                      </div>
                      {opening.finishSlopes ? <label className={styles.kind}>
                        <span>Стороны откосов</span>
                        <select value={opening.slopeSides ?? 3} onChange={(event) => updateOpening(wall, opening.id, { slopeSides: Number(event.target.value) as 3 | 4 })}>
                          <option value={3}>3 — верх и боковые, без подоконника / порога</option>
                          <option value={4}>4 — весь периметр</option>
                        </select>
                      </label> : null}
                    </div> : null}
                  </div>
                })}
              </div> : null}
              <button type="button" className={styles.secondary} disabled={wall.openings.length >= 30} onClick={() => addOpening(wall)}>+ Окно или дверь</button>
            </div> : null}
          </div>
        })}
      </div>
      <button type="button" className={styles.secondary} disabled={measurements.walls.length >= 40} onClick={() => save({ ...measurements, walls: [...measurements.walls, {
        id: newId(), name: `Стена ${measurements.walls.length + 1}`, lengthM: 0,
        heightM: measurements.roomHeightM, heightSource: 'room-height', openings: [],
      }] })}>+ Добавить стену</button>

      {measurements.walls.length > 0 ? <div className={styles.result}>
        <p>Стены: {format(totals.grossArea)} − проёмы {format(totals.deductedArea)} = <strong>{format(totals.netArea)} м²</strong></p>
        <p>Откосы по отмеченным проёмам: <strong>{format(totals.slopesLength)} м. пог.</strong></p>
        {totals.errors.length > 0 ? <ul className={styles.errors}>{totals.errors.map((error) => <li key={error}>{error}</li>)}</ul> : null}
        <p className={styles.hint}>После заполнения замеров площадь стен и длина откосов автоматически используются сценарием для этого помещения. Уже добавленные строки сметы меняются только при повторном применении сценария.</p>
      </div> : null}
    </section>
  )
}

function Measure({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <div className={styles.measure}><span>{label}, м</span><EstimateNumberInput value={value} onValueChange={onChange} aria-label={`${label}, м`} /></div>
}
