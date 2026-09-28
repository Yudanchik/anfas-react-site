import { useMemo, useState } from 'react'

import {
  ESTIMATE_GENERAL_WORKS_TITLE,
  formatCeilingScenarioFeedback,
  formatCeilingScenarioZoneFeedback,
  type CeilingDemolitionCoveringOption,
  type CeilingEstimateInput,
  type CeilingFinishTargetOption,
  type CeilingPaintLayersOption,
  type CeilingScenarioApplication,
  type CeilingStateOption,
  type EstimateZone,
} from '@/entities/estimate'

import type { CeilingScenarioDraftState } from '../model/estimate-calculator-persistence'
import { useEstimateStatusMessage } from '../model/use-estimate-status-message'
import {
  canApplyCeilingScenario,
  getScenarioMeasuresDisabledHint,
  validateCeilingScenarioMeasures,
} from '../model/validate-scenario-measures'
import { EstimateSelect } from '../ui/EstimateSelect'
import styles from './CeilingEstimateScenarios.module.scss'

type CeilingEstimateScenariosProps = {
  draft: CeilingScenarioDraftState
  onDraftChange: (patch: Partial<CeilingScenarioDraftState>) => void
  zones?: readonly EstimateZone[]
  generalInput: CeilingEstimateInput
  feedbackEpoch?: number
  onApplyScenario: (
    application: CeilingScenarioApplication,
    target?: { zone?: EstimateZone },
  ) => {
    label: string
    addedCount: number
    zoneName?: string
    error?: string
  }
}

const GENERAL_TARGET = 'general'

const STATE_OPTIONS: ReadonlyArray<{ value: CeilingStateOption; label: string }> = [
  { value: 'from-scratch', label: 'С нуля' },
  { value: 'after-demolition', label: 'После демонтажа' },
  { value: 'prefinish', label: 'Предчистовая' },
  { value: 'local-leveling', label: 'Локальное выравнивание' },
  { value: 'demolition-only', label: 'Только демонтаж' },
  { value: 'finish-only', label: 'Только финиш' },
]

const FINISH_OPTIONS: ReadonlyArray<{ value: CeilingFinishTargetOption; label: string }> = [
  { value: 'none', label: 'Без финиша' },
  { value: 'paint', label: 'Под покраску' },
]

const DEMOLITION_OPTIONS: ReadonlyArray<{ value: CeilingDemolitionCoveringOption; label: string }> =
  [
    { value: 'paint', label: 'Краска' },
    { value: 'plaster', label: 'Штукатурка' },
    { value: 'putty', label: 'Шпаклёвка' },
    { value: 'wallpaper', label: 'Обои' },
    { value: 'gkl-frame', label: 'ГКЛ с каркасом' },
    { value: 'suspended', label: 'Подвесной (Армстронг/Грильято)' },
    { value: 'stretch', label: 'Натяжной' },
    { value: 'stretch-no-save', label: 'Натяжной без сохранения' },
    { value: 'panel', label: 'Панельный' },
  ]

const PAINT_OPTIONS: ReadonlyArray<{ value: CeilingPaintLayersOption; label: string }> = [
  { value: 'paint-ceiling-2', label: 'Валик, 2 слоя' },
  { value: 'paint-ceiling-1', label: 'Валик, 1 слой' },
  { value: 'paint-ceiling-3', label: 'Валик, 3 слоя' },
  { value: 'paint-ceiling-mech-2', label: 'Механизированная, 2 слоя' },
]

export function CeilingEstimateScenarios({
  draft,
  onDraftChange,
  zones = [],
  generalInput,
  feedbackEpoch,
  onApplyScenario,
}: CeilingEstimateScenariosProps) {
  const { state, finishTarget, demolitionCovering, paintLayers } = draft
  const [targetId, setTargetId] = useState(GENERAL_TARGET)
  const { status, setSuccess, setError } = useEstimateStatusMessage({
    clearTokens: feedbackEpoch === undefined ? [] : [feedbackEpoch],
  })

  const finishDisabled = state === 'demolition-only' || state === 'local-leveling'
  const needsFinishChoice = state === 'finish-only'
  const showDemolitionCovering = state === 'demolition-only' || state === 'after-demolition'
  const showPaintLayers = finishTarget === 'paint' && !finishDisabled

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
  const selectedZone = zones.find((zone) => zone.id === resolvedTargetId)

  const resolvedFinish: CeilingFinishTargetOption = finishDisabled
    ? 'none'
    : needsFinishChoice && finishTarget === 'none'
      ? 'paint'
      : finishTarget

  const application: CeilingScenarioApplication = {
    state,
    finishTarget: resolvedFinish,
    demolitionCovering: showDemolitionCovering ? demolitionCovering : undefined,
    paintLayers: resolvedFinish === 'paint' ? paintLayers : undefined,
  }

  const canApply = canApplyCeilingScenario({
    application,
    input: generalInput,
    zone: selectedZone,
  })
  const applyDisabledHint = canApply
    ? null
    : getScenarioMeasuresDisabledHint(Boolean(selectedZone))

  function handleApply() {
    const check = validateCeilingScenarioMeasures({
      application,
      input: generalInput,
      zone: selectedZone,
    })
    if (!check.ok) {
      setError(check.message)
      return
    }

    const result = onApplyScenario(
      application,
      selectedZone ? { zone: selectedZone } : undefined,
    )
    if (result.error) {
      setError(result.error)
      return
    }
    setSuccess(
      result.zoneName
        ? formatCeilingScenarioZoneFeedback(result.label, result.zoneName, result.addedCount)
        : formatCeilingScenarioFeedback(result.label, result.addedCount),
    )
  }

  return (
    <section className={styles.wrap} aria-labelledby="ceiling-estimate-scenarios-title">
      <div className={styles.head}>
        <h2 className={styles.title} id="ceiling-estimate-scenarios-title">
          Сценарий потолков
        </h2>
        <p className={styles.lead}>
          Выберите сценарий и примените его к общим работам или конкретной зоне. После применения
          смету можно вручную уточнить.
        </p>
      </div>

      <div className={styles.targetRow}>
        <span className={styles.targetLabel}>Применить к</span>
        <EstimateSelect
          value={resolvedTargetId}
          options={targetOptions}
          ariaLabel="Применить сценарий потолков к"
          onChange={setTargetId}
        />
      </div>

      <div className={styles.grid}>
        <article className={`${styles.card} ${styles.cardAccent}`}>
          <div className={styles.cardTop}>
            <h3 className={styles.cardTitle}>Параметры сценария</h3>
            <span className={styles.badge}>Черновик</span>
          </div>

          <div className={styles.field}>
            <span>Состояние потолков</span>
            <EstimateSelect
              value={state}
              options={STATE_OPTIONS}
              ariaLabel="Состояние потолков"
              onChange={(nextValue) => {
                const next = nextValue as CeilingStateOption
                const patch: Partial<CeilingScenarioDraftState> = { state: next }
                if (next === 'demolition-only' || next === 'local-leveling') {
                  patch.finishTarget = 'none'
                }
                if (next === 'finish-only' && finishTarget === 'none') {
                  patch.finishTarget = 'paint'
                }
                onDraftChange(patch)
              }}
            />
          </div>

          <div className={styles.field}>
            <span>Целевой результат</span>
            <EstimateSelect
              value={finishDisabled ? 'none' : finishTarget}
              disabled={finishDisabled}
              options={FINISH_OPTIONS.filter((option) =>
                needsFinishChoice ? option.value !== 'none' : true,
              )}
              ariaLabel="Целевой результат"
              onChange={(next) =>
                onDraftChange({ finishTarget: next as CeilingFinishTargetOption })
              }
            />
          </div>

          {showDemolitionCovering ? (
            <div className={styles.field}>
              <span>Что демонтируем</span>
              <EstimateSelect
                value={demolitionCovering}
                options={DEMOLITION_OPTIONS}
                ariaLabel="Что демонтируем"
                onChange={(next) =>
                  onDraftChange({
                    demolitionCovering: next as CeilingDemolitionCoveringOption,
                  })
                }
              />
            </div>
          ) : null}

          {showPaintLayers ? (
            <div className={styles.field}>
              <span>Покраска</span>
              <EstimateSelect
                value={paintLayers}
                options={PAINT_OPTIONS}
                ariaLabel="Покраска"
                onChange={(next) =>
                  onDraftChange({ paintLayers: next as CeilingPaintLayersOption })
                }
              />
            </div>
          ) : null}

          <button
            type="button"
            className={styles.action}
            disabled={!canApply}
            onClick={handleApply}
          >
            Применить сценарий
          </button>
          {applyDisabledHint ? (
            <p className={styles.applyHint}>{applyDisabledHint}</p>
          ) : null}
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
