import { useMemo, useState } from 'react'

import {
  ESTIMATE_GENERAL_WORKS_TITLE,
  formatFloorPresetFeedback,
  formatFloorPresetZoneFeedback,
  type DemolitionCoveringOption,
  type EstimateZone,
  type FloorEstimateInput,
  type FloorPresetApplication,
  type ScreedTypeOption,
  type WasteTripOption,
  type WaterproofingLayersOption,
} from '@/entities/estimate'
import { useEstimateStatusMessage } from '@/features/estimate-calculator/model/use-estimate-status-message'
import {
  canApplyFloorPreset,
  getScenarioMeasuresDisabledHint,
  validateFloorPresetMeasures,
} from '@/features/estimate-calculator/model/validate-scenario-measures'
import { EstimateSelect } from '@/features/estimate-calculator/ui/EstimateSelect'

import styles from './FloorEstimatePresets.module.scss'

type FloorPresetDraft = {
  covering: DemolitionCoveringOption
  screedType: ScreedTypeOption
  layers: WaterproofingLayersOption
  wasteTrip: WasteTripOption
}

const GENERAL_TARGET = 'general'

type FloorEstimatePresetsProps = {
  draft?: FloorPresetDraft
  onDraftChange?: (patch: Partial<FloorPresetDraft>) => void
  zones?: readonly EstimateZone[]
  demolitionArea: number
  screedArea: number
  totalFloorArea: number
  wetZonesArea: number
  feedbackEpoch?: number
  onApplyPreset: (
    application: FloorPresetApplication,
    target?: { zone?: EstimateZone },
  ) => { label: string; addedCount: number; zoneName?: string }
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
  zones = [],
  demolitionArea,
  screedArea,
  totalFloorArea,
  wetZonesArea,
  feedbackEpoch,
  onApplyPreset,
}: FloorEstimatePresetsProps) {
  const [uncontrolledDraft, setUncontrolledDraft] = useState<FloorPresetDraft>(DEFAULT_DRAFT)
  const draft = controlledDraft ?? uncontrolledDraft
  const { covering, screedType, layers, wasteTrip } = draft
  const [targetId, setTargetId] = useState(GENERAL_TARGET)
  const { status, setSuccess, setError } = useEstimateStatusMessage({
    clearTokens: feedbackEpoch === undefined ? [] : [feedbackEpoch],
  })

  function patchDraft(patch: Partial<FloorPresetDraft>) {
    if (onDraftChange) onDraftChange(patch)
    else setUncontrolledDraft((prev) => ({ ...prev, ...patch }))
  }

  const targetOptions = useMemo(
    () => [
      { value: GENERAL_TARGET, label: ESTIMATE_GENERAL_WORKS_TITLE },
      ...zones.map((zone) => ({ value: zone.id, label: zone.name })),
    ],
    [zones],
  )

  const resolvedTargetId = targetOptions.some((option) => option.value === targetId)
    ? targetId
    : GENERAL_TARGET
  const effectiveZone = zones.find((zone) => zone.id === resolvedTargetId)

  const generalInput: FloorEstimateInput = {
    totalFloorArea,
    demolitionArea,
    screedArea,
    wetZonesArea,
    avgDeltaMm: 0,
    surveyorComment: '',
  }

  const forZone = Boolean(effectiveZone)
  const disabledHint = getScenarioMeasuresDisabledHint(forZone)

  const canDemolition = canApplyFloorPreset({
    application: { presetId: 'demolition-covering', covering },
    input: generalInput,
    zone: effectiveZone,
  })
  const canScreed = canApplyFloorPreset({
    application: { presetId: 'screed-on-slab', screedType },
    input: generalInput,
    zone: effectiveZone,
  })
  const canSelfLeveling = canApplyFloorPreset({
    application: { presetId: 'self-leveling' },
    input: generalInput,
    zone: effectiveZone,
  })
  const canWet = canApplyFloorPreset({
    application: { presetId: 'wet-zones', layers },
    input: generalInput,
    zone: effectiveZone,
  })
  const canWaste = canApplyFloorPreset({
    application: { presetId: 'waste', trip: wasteTrip },
    input: generalInput,
    zone: effectiveZone,
  })

  function apply(application: FloorPresetApplication) {
    const check = validateFloorPresetMeasures({
      application,
      input: generalInput,
      zone: effectiveZone,
    })
    if (!check.ok) {
      setError(check.message)
      return
    }

    const result = onApplyPreset(
      application,
      effectiveZone ? { zone: effectiveZone } : undefined,
    )
    setSuccess(
      result.zoneName
        ? formatFloorPresetZoneFeedback(result.label, result.zoneName, result.addedCount)
        : formatFloorPresetFeedback(result.label, result.addedCount),
    )
  }

  return (
    <section className={styles.wrap} aria-labelledby="floor-estimate-presets-title">
      <div className={styles.head}>
        <h2 className={styles.title} id="floor-estimate-presets-title">
          Сценарии
        </h2>
        <p className={styles.lead}>
          Выберите сценарий и примените его к общим работам или конкретной зоне. После применения
          каждую строку можно изменить вручную.
        </p>
      </div>

      <div className={styles.targetRow}>
        <span className={styles.targetLabel}>Применить к</span>
        <EstimateSelect
          value={resolvedTargetId}
          options={targetOptions}
          ariaLabel="Применить сценарий пола к"
          onChange={setTargetId}
        />
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
            disabled={!canDemolition}
            onClick={() => apply({ presetId: 'demolition-covering', covering })}
          >
            Применить
          </button>
          {!canDemolition ? <p className={styles.applyHint}>{disabledHint}</p> : null}
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
            disabled={!canScreed}
            onClick={() => apply({ presetId: 'screed-on-slab', screedType })}
          >
            Применить
          </button>
          {!canScreed ? <p className={styles.applyHint}>{disabledHint}</p> : null}
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
            disabled={!canSelfLeveling}
            onClick={() => apply({ presetId: 'self-leveling' })}
          >
            Применить
          </button>
          {!canSelfLeveling ? <p className={styles.applyHint}>{disabledHint}</p> : null}
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
            disabled={!canWet}
            onClick={() => apply({ presetId: 'wet-zones', layers })}
          >
            Применить
          </button>
          {!canWet ? <p className={styles.applyHint}>{disabledHint}</p> : null}
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
            disabled={!canWaste}
            onClick={() => apply({ presetId: 'waste', trip: wasteTrip })}
          >
            Применить
          </button>
        </article>
      </div>

      {status ? (
        <p className={styles.status} data-kind={status.kind} role="status" aria-live="polite">
          {status.message}
        </p>
      ) : null}
    </section>
  )
}
