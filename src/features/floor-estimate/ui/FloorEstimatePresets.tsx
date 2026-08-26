import { useState } from 'react'

import {
  formatFloorPresetFeedback,
  type DemolitionCoveringOption,
  type FloorPresetApplication,
  type ScreedTypeOption,
  type WasteTripOption,
  type WaterproofingLayersOption,
} from '@/entities/estimate'

import styles from './FloorEstimatePresets.module.scss'

type FloorEstimatePresetsProps = {
  demolitionArea: number
  screedArea: number
  totalFloorArea: number
  wetZonesArea: number
  onApplyPreset: (application: FloorPresetApplication) => { label: string; addedCount: number }
}

const DEMOLITION_OPTIONS: ReadonlyArray<{ value: DemolitionCoveringOption; label: string }> = [
  { value: 'laminate', label: 'Ламинат' },
  { value: 'linoleum', label: 'Линолеум' },
  { value: 'tile', label: 'Плитка' },
  { value: 'parquet', label: 'Паркетная доска' },
  { value: 'screed', label: 'Стяжка до 70 мм' },
]

const SCREED_OPTIONS: ReadonlyArray<{ value: ScreedTypeOption; label: string }> = [
  { value: 'semidry-up-to-80', label: 'Полусухая до 80 мм' },
  { value: 'semidry-over-80', label: 'Полусухая свыше 80 мм' },
  { value: 'wet-up-to-50', label: 'Мокрая до 50 мм' },
  { value: 'wet-50-to-80', label: 'Мокрая 50–80 мм' },
  { value: 'wet-over-80', label: 'Мокрая свыше 80 мм' },
]

const HYDRO_OPTIONS: ReadonlyArray<{ value: WaterproofingLayersOption; label: string }> = [
  { value: 'acrylic-2', label: 'Акрил, 2 слоя' },
  { value: 'acrylic-1', label: 'Акрил, 1 слой' },
]

const WASTE_OPTIONS: ReadonlyArray<{ value: WasteTripOption; label: string }> = [
  { value: 'gazelle-6', label: 'Газель до 6 м³' },
  { value: 'gazelle-12', label: 'Газель до 12 м³' },
  { value: 'carry-out', label: 'Вынос вручную' },
]

export function FloorEstimatePresets({
  demolitionArea,
  screedArea,
  totalFloorArea,
  wetZonesArea,
  onApplyPreset,
}: FloorEstimatePresetsProps) {
  const [covering, setCovering] = useState<DemolitionCoveringOption>('laminate')
  const [screedType, setScreedType] = useState<ScreedTypeOption>('semidry-up-to-80')
  const [layers, setLayers] = useState<WaterproofingLayersOption>('acrylic-2')
  const [wasteTrip, setWasteTrip] = useState<WasteTripOption>('gazelle-6')
  const [status, setStatus] = useState<string | null>(null)

  const screedQty = screedArea > 0 ? screedArea : totalFloorArea

  function apply(application: FloorPresetApplication) {
    const result = onApplyPreset(application)
    setStatus(formatFloorPresetFeedback(result.label, result.addedCount))
  }

  return (
    <section className={styles.wrap} aria-labelledby="floor-estimate-presets-title">
      <div className={styles.head}>
        <h2 className={styles.title} id="floor-estimate-presets-title">
          Сценарии
        </h2>
        <p className={styles.lead}>Явно включают типовой набор. Площадь сама строки не включает.</p>
      </div>

      <div className={styles.grid}>
        <article className={`${styles.card} ${styles.cardAccent}`}>
          <div className={styles.cardTop}>
            <h3 className={styles.cardTitle}>Демонтаж покрытия</h3>
            <span className={styles.badge}>Демонтаж</span>
          </div>
          <label className={styles.field}>
            <span>Тип</span>
            <select
              className={styles.select}
              value={covering}
              onChange={(event) => setCovering(event.target.value as DemolitionCoveringOption)}
            >
              {DEMOLITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={styles.action}
            disabled={!(demolitionArea > 0)}
            onClick={() => apply({ presetId: 'demolition-covering', covering })}
          >
            Применить
          </button>
        </article>

        <article className={`${styles.card} ${styles.cardAccent}`}>
          <div className={styles.cardTop}>
            <h3 className={styles.cardTitle}>Стяжка по плите</h3>
            <span className={styles.badge}>Стяжка</span>
          </div>
          <label className={styles.field}>
            <span>Тип</span>
            <select
              className={styles.select}
              value={screedType}
              onChange={(event) => setScreedType(event.target.value as ScreedTypeOption)}
            >
              {SCREED_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={styles.action}
            disabled={!(screedQty > 0)}
            onClick={() => apply({ presetId: 'screed-on-slab', screedType })}
          >
            Применить
          </button>
        </article>

        <article className={styles.card}>
          <div className={styles.cardTop}>
            <h3 className={styles.cardTitle}>Ровнитель</h3>
            <span className={styles.badge}>Финиш</span>
          </div>
          <p className={styles.cardHint}>Грунт + наливной, без стяжки</p>
          <button
            type="button"
            className={styles.action}
            disabled={!(screedQty > 0)}
            onClick={() => apply({ presetId: 'self-leveling' })}
          >
            Применить
          </button>
        </article>

        <article className={styles.card}>
          <div className={styles.cardTop}>
            <h3 className={styles.cardTitle}>Мокрые зоны</h3>
            <span className={styles.badge}>Гидро</span>
          </div>
          <label className={styles.field}>
            <span>Гидроизоляция</span>
            <select
              className={styles.select}
              value={layers}
              onChange={(event) => setLayers(event.target.value as WaterproofingLayersOption)}
            >
              {HYDRO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={styles.action}
            disabled={!(wetZonesArea > 0)}
            onClick={() => apply({ presetId: 'wet-zones', layers })}
          >
            Применить
          </button>
        </article>

        <article className={styles.card}>
          <div className={styles.cardTop}>
            <h3 className={styles.cardTitle}>Вывоз мусора</h3>
            <span className={styles.badgeMuted}>Опционально</span>
          </div>
          <label className={styles.field}>
            <span>Вариант</span>
            <select
              className={styles.select}
              value={wasteTrip}
              onChange={(event) => setWasteTrip(event.target.value as WasteTripOption)}
            >
              {WASTE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={styles.action}
            onClick={() => apply({ presetId: 'waste', trip: wasteTrip })}
          >
            Применить
          </button>
        </article>
      </div>

      {status ? (
        <p className={styles.status} role="status" aria-live="polite">
          {status}
        </p>
      ) : null}
    </section>
  )
}
