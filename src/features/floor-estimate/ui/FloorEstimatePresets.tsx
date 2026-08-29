import { useState } from 'react'

import {
  formatFloorPresetFeedback,
  type DemolitionCoveringOption,
  type FloorPresetApplication,
  type ScreedTypeOption,
  type WasteTripOption,
  type WaterproofingLayersOption,
} from '@/entities/estimate'
import { EstimateSelect } from '@/features/estimate-calculator/ui/EstimateSelect'

import styles from './FloorEstimatePresets.module.scss'

type FloorPresetDraft = {
  covering: DemolitionCoveringOption
  screedType: ScreedTypeOption
  layers: WaterproofingLayersOption
  wasteTrip: WasteTripOption
}

type FloorEstimatePresetsProps = {
  draft?: FloorPresetDraft
  onDraftChange?: (patch: Partial<FloorPresetDraft>) => void
  demolitionArea: number
  screedArea: number
  totalFloorArea: number
  wetZonesArea: number
  onApplyPreset: (application: FloorPresetApplication) => { label: string; addedCount: number }
}

const DEFAULT_DRAFT: FloorPresetDraft = {
  covering: 'laminate',
  screedType: 'semidry-up-to-80',
  layers: 'acrylic-2',
  wasteTrip: 'gazelle-6',
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
  draft: controlledDraft,
  onDraftChange,
  demolitionArea,
  screedArea,
  totalFloorArea,
  wetZonesArea,
  onApplyPreset,
}: FloorEstimatePresetsProps) {
  const [uncontrolledDraft, setUncontrolledDraft] = useState<FloorPresetDraft>(DEFAULT_DRAFT)
  const draft = controlledDraft ?? uncontrolledDraft
  const { covering, screedType, layers, wasteTrip } = draft
  const [status, setStatus] = useState<string | null>(null)

  function patchDraft(patch: Partial<FloorPresetDraft>) {
    if (onDraftChange) onDraftChange(patch)
    else setUncontrolledDraft((prev) => ({ ...prev, ...patch }))
  }

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
        <p className={styles.lead}>
          Сценарий добавляет типовой набор работ в смету и подставляет площади из параметров замера.
          После применения каждую строку можно изменить вручную.
        </p>
      </div>

      <div className={styles.grid}>
        <article className={`${styles.card} ${styles.cardAccent}`}>
          <div className={styles.cardTop}>
            <h3 className={styles.cardTitle}>Демонтаж покрытия</h3>
            <span className={styles.badge}>Демонтаж</span>
          </div>
          <div className={styles.field}>
            <span>Тип</span>
            <EstimateSelect
              value={covering}
              options={DEMOLITION_OPTIONS}
              onChange={(next) => patchDraft({ covering: next as DemolitionCoveringOption })}
              ariaLabel="Тип демонтажа покрытия"
            />
          </div>
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
          <div className={styles.field}>
            <span>Тип</span>
            <EstimateSelect
              value={screedType}
              options={SCREED_OPTIONS}
              onChange={(next) => patchDraft({ screedType: next as ScreedTypeOption })}
              ariaLabel="Тип стяжки"
            />
          </div>
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
          <div className={styles.field}>
            <span>Гидроизоляция</span>
            <EstimateSelect
              value={layers}
              options={HYDRO_OPTIONS}
              onChange={(next) => patchDraft({ layers: next as WaterproofingLayersOption })}
              ariaLabel="Гидроизоляция"
            />
          </div>
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
          <div className={styles.field}>
            <span>Вариант</span>
            <EstimateSelect
              value={wasteTrip}
              options={WASTE_OPTIONS}
              onChange={(next) => patchDraft({ wasteTrip: next as WasteTripOption })}
              ariaLabel="Вариант вывоза мусора"
            />
          </div>
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
