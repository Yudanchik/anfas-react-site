import { useMemo, useState } from 'react'

import {
  ESTIMATE_GENERAL_WORKS_TITLE,
  ELECTRIC_PRICE_MAPPING,
  electricInputFromZone,
  formatElectricScenarioFeedback,
  formatElectricScenarioLabel,
  formatElectricScenarioZoneFeedback,
  formatElectricScenarioZoneMismatchMessage,
  isElectricScenarioAllowedForZone,
  resolveElectricScenarioOptionsForZone,
  resolveElectricScenarioKeys,
  resolveElectricScenarioPlan,
  resolveMeasuredElectricScenarioKeys,
  resolveElectricScenarioQuantity,
  type ElectricEstimateInput,
  type ElectricScenarioApplication,
  type ElectricStateOption,
  type EstimateZone,
} from '@/entities/estimate'

import type { ElectricScenarioDraftState } from '../model/estimate-calculator-persistence'
import { useEstimateStatusMessage } from '../model/use-estimate-status-message'
import {
  canApplyElectricScenario,
  getScenarioMeasuresDisabledHint,
  validateElectricScenarioMeasures,
} from '../model/validate-scenario-measures'
import { EstimateSelect } from '../ui/EstimateSelect'
import { formatElectricScenarioTargetLabel } from './format-electric-scenario-target-label'
import styles from './ElectricEstimateScenarios.module.scss'

export { formatElectricScenarioTargetLabel } from './format-electric-scenario-target-label'

type ElectricEstimateScenariosProps = {
  draft: ElectricScenarioDraftState
  onDraftChange: (patch: Partial<ElectricScenarioDraftState>) => void
  zones?: readonly EstimateZone[]
  generalInput: ElectricEstimateInput
  feedbackEpoch?: number
  onApplyScenario: (
    application: ElectricScenarioApplication,
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
  state: ElectricStateOption,
  zoneType: EstimateZone['zoneType'] | null,
): ElectricStateOption {
  if (isElectricScenarioAllowedForZone(state, zoneType)) return state
  const { primary } = resolveElectricScenarioOptionsForZone(zoneType, false)
  return primary[0]?.id ?? 'outlets-switches'
}

export function ElectricEstimateScenarios({
  draft,
  onDraftChange,
  zones = [],
  generalInput,
  feedbackEpoch,
  onApplyScenario,
}: ElectricEstimateScenariosProps) {
  const { state, wallMaterial, cableRoute } = draft
  const [targetId, setTargetId] = useState(GENERAL_TARGET)
  const { status, setSuccess, setError } = useEstimateStatusMessage({
    clearTokens: feedbackEpoch === undefined ? [] : [feedbackEpoch],
  })

  const targetOptions = useMemo(
    () => [
      { value: GENERAL_TARGET, label: ESTIMATE_GENERAL_WORKS_TITLE },
      ...zones.map((zone) => ({
        value: zone.id,
        label: formatElectricScenarioTargetLabel(zone),
      })),
    ],
    [zones],
  )
  const resolvedTargetId = targetOptions.some((option) => option.value === targetId)
    ? targetId
    : GENERAL_TARGET
  const selectedZone = zones.find((zone) => zone.id === resolvedTargetId)
  const filterZoneType = selectedZone ? selectedZone.zoneType : null
  const { primary } = resolveElectricScenarioOptionsForZone(filterZoneType, false)
  const stateOptions = primary.map((option) => ({ value: option.id, label: option.label }))
  const compatibleState = resolveCompatibleState(state, filterZoneType)

  const application: ElectricScenarioApplication = {
    state: compatibleState,
    wallMaterial,
    cableRoute,
  }

  const originalKeys = resolveElectricScenarioKeys({ state: compatibleState })
  const needsWall = originalKeys.some(
    (key) => key.startsWith('chase-') || key.startsWith('hole-podrozetnik-'),
  )
  const needsRoute = originalKeys.includes('cable-chase-1-5-2-5')
  const plan = resolveElectricScenarioPlan(application)
  const previewInput = selectedZone ? electricInputFromZone(selectedZone) : generalInput
  const mappingById = new Map(ELECTRIC_PRICE_MAPPING.map((item) => [item.id, item]))
  const preview = resolveMeasuredElectricScenarioKeys(application, previewInput).map((key) => {
    const item = mappingById.get(key)
    return {
      key,
      title: item?.title ?? key,
      unit: item?.unit ?? '',
      quantity: resolveElectricScenarioQuantity(
        key,
        item?.defaultQuantityFrom ?? 'manual',
        previewInput,
      ),
    }
  })

  const zoneFitOk = isElectricScenarioAllowedForZone(application.state, filterZoneType)
  const canApply =
    zoneFitOk &&
    plan.issues.length === 0 &&
    canApplyElectricScenario({
      application,
      input: generalInput,
      zone: selectedZone,
    })
  const applyDisabledHint = !zoneFitOk
    ? formatElectricScenarioZoneMismatchMessage(application.state)
    : plan.issues.length
      ? plan.issues.join(' ')
      : canApply
        ? null
        : getScenarioMeasuresDisabledHint(Boolean(selectedZone))

  const previewLabel = formatElectricScenarioLabel(application)

  function syncStateForZoneType(zoneType: EstimateZone['zoneType'] | null) {
    if (isElectricScenarioAllowedForZone(state, zoneType)) return
    const next = resolveCompatibleState(state, zoneType)
    if (next === state) return
    onDraftChange({ state: next })
  }

  function handleApply() {
    const check = validateElectricScenarioMeasures({
      application,
      input: generalInput,
      zone: selectedZone,
    })
    if (!check.ok) {
      setError(check.message)
      return
    }

    const result = onApplyScenario(application, selectedZone ? { zone: selectedZone } : undefined)
    if (result.error) {
      setError(result.error)
      return
    }
    setSuccess(
      result.zoneName
        ? formatElectricScenarioZoneFeedback(result.label, result.zoneName, result.addedCount)
        : formatElectricScenarioFeedback(result.label, result.addedCount),
    )
  }

  return (
    <section className={styles.wrap} aria-labelledby="electric-estimate-scenarios-title">
      <div className={styles.head}>
        <h2 className={styles.title} id="electric-estimate-scenarios-title">
          Сценарий электрики
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
          ariaLabel="Применить сценарий электрики к"
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
              ariaLabel="Сценарий электрики"
              onChange={(nextValue) => {
                const next = nextValue as ElectricStateOption
                if (!isElectricScenarioAllowedForZone(next, filterZoneType)) {
                  setError(formatElectricScenarioZoneMismatchMessage(next))
                  return
                }
                onDraftChange({ state: next })
              }}
            />
          </div>

          {needsWall ? (
            <div className={styles.field}>
              <span>Основание для отверстий и штроб</span>
              <EstimateSelect
                value={wallMaterial}
                ariaLabel="Материал стены для электрики"
                options={[
                  { value: 'unknown', label: 'Пока неизвестно' },
                  { value: 'concrete', label: 'Бетон' },
                  { value: 'brick', label: 'Кирпич или блок' },
                  { value: 'drywall', label: 'Гипсокартон' },
                  { value: 'ready', label: 'Отверстия уже готовы' },
                ]}
                onChange={(next) =>
                  onDraftChange({
                    wallMaterial: next as ElectricScenarioDraftState['wallMaterial'],
                  })
                }
              />
            </div>
          ) : null}
          {needsRoute ? (
            <div className={styles.field}>
              <span>Как прокладываем новый кабель?</span>
              <EstimateSelect
                value={cableRoute}
                ariaLabel="Способ прокладки кабеля"
                options={[
                  { value: 'unknown', label: 'Пока неизвестно' },
                  { value: 'chase', label: 'В новой штробе' },
                  { value: 'open', label: 'Открыто на крепёж' },
                  { value: 'existing', label: 'Кабель уже проложен' },
                ]}
                onChange={(next) =>
                  onDraftChange({ cableRoute: next as ElectricScenarioDraftState['cableRoute'] })
                }
              />
            </div>
          ) : null}

          <p className={styles.hydroHint}>{previewLabel}. Работы с заполненным объёмом:</p>
          {preview.length ? (
            <ul className={styles.preview}>
              {preview.map((item) => (
                <li key={item.key}>
                  {item.title} — {item.quantity.toLocaleString('ru-RU')} {item.unit}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.applyHint}>Для этого сценария ещё нет подходящих замеров.</p>
          )}

          <button
            type="button"
            className={styles.action}
            disabled={!canApply}
            onClick={handleApply}
          >
            Применить сценарий
          </button>
          {applyDisabledHint ? <p className={styles.applyHint}>{applyDisabledHint}</p> : null}
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
