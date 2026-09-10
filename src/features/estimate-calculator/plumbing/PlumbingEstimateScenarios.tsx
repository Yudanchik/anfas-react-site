import { useMemo, useState } from 'react'

import {
  ESTIMATE_GENERAL_WORKS_TITLE,
  formatPlumbingScenarioFeedback,
  formatPlumbingScenarioLabel,
  formatPlumbingScenarioZoneFeedback,
  formatPlumbingScenarioZoneMismatchMessage,
  isPlumbingScenarioAllowedForZone,
  resolvePlumbingScenarioOptionsForZone,
  type EstimateZone,
  type PlumbingEstimateInput,
  type PlumbingScenarioApplication,
  type PlumbingStateOption,
} from '@/entities/estimate'

import type { PlumbingScenarioDraftState } from '../model/estimate-calculator-persistence'
import { useEstimateStatusMessage } from '../model/use-estimate-status-message'
import {
  canApplyPlumbingScenario,
  getScenarioMeasuresDisabledHint,
  validatePlumbingScenarioMeasures,
} from '../model/validate-scenario-measures'
import { EstimateSelect } from '../ui/EstimateSelect'
import { formatPlumbingScenarioTargetLabel } from './format-plumbing-scenario-target-label'
import styles from './PlumbingEstimateScenarios.module.scss'

export { formatPlumbingScenarioTargetLabel } from './format-plumbing-scenario-target-label'

type PlumbingEstimateScenariosProps = {
  draft: PlumbingScenarioDraftState
  onDraftChange: (patch: Partial<PlumbingScenarioDraftState>) => void
  zones?: readonly EstimateZone[]
  generalInput: PlumbingEstimateInput
  feedbackEpoch?: number
  onApplyScenario: (
    application: PlumbingScenarioApplication,
    target?: { zone?: EstimateZone },
  ) => {
    label: string
    addedCount: number
    zoneName?: string
    error?: string
  }
}

const GENERAL_TARGET = 'general'

function resolveCompatibleState(
  state: PlumbingStateOption,
  zoneType: EstimateZone['zoneType'] | null,
): PlumbingStateOption {
  if (isPlumbingScenarioAllowedForZone(state, zoneType)) return state
  const { primary } = resolvePlumbingScenarioOptionsForZone(zoneType, false)
  return primary[0]?.id ?? 'bathroom-from-scratch'
}

export function PlumbingEstimateScenarios({
  draft,
  onDraftChange,
  zones = [],
  generalInput,
  feedbackEpoch,
  onApplyScenario,
}: PlumbingEstimateScenariosProps) {
  const { state } = draft
  const [targetId, setTargetId] = useState(GENERAL_TARGET)
  const { status, setSuccess, setError } = useEstimateStatusMessage({
    clearTokens: feedbackEpoch === undefined ? [] : [feedbackEpoch],
  })

  const targetOptions = useMemo(
    () => [
      { value: GENERAL_TARGET, label: ESTIMATE_GENERAL_WORKS_TITLE },
      ...zones.map((zone) => ({
        value: zone.id,
        label: formatPlumbingScenarioTargetLabel(zone),
      })),
    ],
    [zones],
  )
  const resolvedTargetId = targetOptions.some((option) => option.value === targetId)
    ? targetId
    : GENERAL_TARGET
  const selectedZone = zones.find((zone) => zone.id === resolvedTargetId)
  const filterZoneType = selectedZone ? selectedZone.zoneType : null
  const { primary } = resolvePlumbingScenarioOptionsForZone(filterZoneType, false)
  const stateOptions = primary.map((option) => ({ value: option.id, label: option.label }))
  const compatibleState = resolveCompatibleState(state, filterZoneType)

  const application: PlumbingScenarioApplication = {
    state: compatibleState,
  }

  const zoneFitOk = isPlumbingScenarioAllowedForZone(application.state, filterZoneType)
  const canApply =
    zoneFitOk &&
    canApplyPlumbingScenario({
      application,
      input: generalInput,
      zone: selectedZone,
    })
  const applyDisabledHint = !zoneFitOk
    ? formatPlumbingScenarioZoneMismatchMessage(application.state)
    : canApply
      ? null
      : getScenarioMeasuresDisabledHint(Boolean(selectedZone))

  const previewLabel = formatPlumbingScenarioLabel(application)

  function syncStateForZoneType(zoneType: EstimateZone['zoneType'] | null) {
    if (isPlumbingScenarioAllowedForZone(state, zoneType)) return
    const next = resolveCompatibleState(state, zoneType)
    if (next === state) return
    onDraftChange({ state: next })
  }

  function handleApply() {
    const check = validatePlumbingScenarioMeasures({
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
        ? formatPlumbingScenarioZoneFeedback(result.label, result.zoneName, result.addedCount)
        : formatPlumbingScenarioFeedback(result.label, result.addedCount),
    )
  }

  return (
    <section className={styles.wrap} aria-labelledby="plumbing-estimate-scenarios-title">
      <div className={styles.head}>
        <h2 className={styles.title} id="plumbing-estimate-scenarios-title">
          Сценарий сантехники
        </h2>
        <p className={styles.lead}>
          Компактный черновик типовых работ. Редкие позиции — через «Добавить работу из прайса».
          Материалы не считаются. После применения смету можно вручную уточнить.
        </p>
      </div>

      <div className={styles.targetRow}>
        <span className={styles.targetLabel}>Применить к</span>
        <EstimateSelect
          value={resolvedTargetId}
          options={targetOptions}
          ariaLabel="Применить сценарий сантехники к"
          onChange={(next) => {
            setTargetId(next)
            const zone = zones.find((entry) => entry.id === next)
            syncStateForZoneType(zone ? zone.zoneType : null)
          }}
        />
      </div>

      <div className={styles.grid}>
        <article className={`${styles.card} ${styles.cardAccent}`}>
          <div className={styles.cardTop}>
            <h3 className={styles.cardTitle}>Параметры сценария</h3>
            <span className={styles.badge}>Черновик</span>
          </div>

          <div className={styles.field}>
            <span>Сценарий</span>
            <EstimateSelect
              value={compatibleState}
              options={stateOptions}
              ariaLabel="Сценарий сантехники"
              onChange={(nextValue) => {
                const next = nextValue as PlumbingStateOption
                if (!isPlumbingScenarioAllowedForZone(next, filterZoneType)) {
                  setError(formatPlumbingScenarioZoneMismatchMessage(next))
                  return
                }
                onDraftChange({ state: next })
              }}
            />
          </div>

          <p className={styles.hydroHint}>Будет применено: {previewLabel}</p>

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
