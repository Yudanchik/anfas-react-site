import { useMemo, useState } from 'react'

import {
  ELECTRIC_PRICE_MAPPING,
  electricInputFromZone,
  formatElectricScenarioLabel,
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
  type EstimateLine,
} from '@/entities/estimate'

import type { ElectricScenarioDraftState } from '../model/estimate-calculator-persistence'
import { useEstimateStatusMessage } from '../model/use-estimate-status-message'
import {
  canApplyElectricScenario,
  validateElectricScenarioMeasures,
} from '../model/validate-scenario-measures'
import { ALL_SCENARIO_ROOMS } from '../model/room-scenario-status'
import { useRoomScenarioBatch } from '../model/use-room-scenario-batch'
import { EstimateScenarioRooms } from '../ui/EstimateScenarioRooms'
import { EstimateScenarioWizard } from '../ui/EstimateScenarioWizard'
import { EstimateSelect } from '../ui/EstimateSelect'
import { formatElectricScenarioTargetLabel } from './format-electric-scenario-target-label'
import styles from '../ui/EstimateScenarioWizard.module.scss'

export { formatElectricScenarioTargetLabel } from './format-electric-scenario-target-label'

type ElectricEstimateScenariosProps = {
  draft: ElectricScenarioDraftState
  onDraftChange: (patch: Partial<ElectricScenarioDraftState>) => void
  lines?: readonly EstimateLine[]
  onZonesChange?: (zones: EstimateZone[]) => void
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
  lines = [],
  onZonesChange,
  generalInput,
  feedbackEpoch,
  onApplyScenario,
}: ElectricEstimateScenariosProps) {
  const { state, wallMaterial, cableRoute } = draft
  const [targetId, setTargetId] = useState('')
  const { status, setSuccess, setError } = useEstimateStatusMessage({
    clearTokens: [targetId, feedbackEpoch ?? 0, zones.length],
  })

  const targetOptions = useMemo(
    () => [
      { value: ALL_SCENARIO_ROOMS, label: `Все помещения · ${zones.length}` },
      ...zones.map((zone) => ({
        value: zone.id,
        label: formatElectricScenarioTargetLabel(zone),
      })),
    ],
    [zones],
  )
  const resolvedTargetId = targetOptions.some((option) => option.value === targetId)
    ? targetId
    : (zones[0]?.id ?? '')
  const selectedZone =
    resolvedTargetId === ALL_SCENARIO_ROOMS
      ? zones[0]
      : zones.find((zone) => zone.id === resolvedTargetId)
  const filterZoneType =
    resolvedTargetId === ALL_SCENARIO_ROOMS ? null : selectedZone ? selectedZone.zoneType : null
  const { primary } = resolveElectricScenarioOptionsForZone(filterZoneType, false)
  const stateOptions = primary.map((option) => ({ value: option.id, label: option.label }))
  const compatibleState = resolveCompatibleState(state, filterZoneType)

  const application: ElectricScenarioApplication = {
    state: compatibleState,
    wallMaterial,
    cableRoute,
    demolitionBeforeWork: state !== 'demolition-only' && draft.demolitionBeforeWork,
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
        application,
      ),
    }
  })

  const zoneFitOk = isElectricScenarioAllowedForZone(application.state, filterZoneType)
  const measureCheck = validateElectricScenarioMeasures({
    application,
    input: generalInput,
    zone: selectedZone,
  })
  const canApply =
    Boolean(selectedZone) &&
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
        : measureCheck.ok
          ? null
          : measureCheck.message

  const previewLabel = formatElectricScenarioLabel(application)

  function syncStateForZoneType(zoneType: EstimateZone['zoneType'] | null) {
    if (isElectricScenarioAllowedForZone(state, zoneType)) return
    const next = resolveCompatibleState(state, zoneType)
    if (next === state) return
    onDraftChange({ state: next })
  }

  const batch = useRoomScenarioBatch({
    section: 'electrics',
    zones,
    lines,
    targetId: resolvedTargetId,
    onZonesChange,
    setSuccess,
    setError,
    check: (zone) => validateElectricScenarioMeasures({ application, input: generalInput, zone }),
    apply: (zone) => onApplyScenario(application, { zone }),
  })
  function handleApply() {
    return batch.apply()
  }

  return (
    <EstimateScenarioWizard
      key={`${resolvedTargetId}:${feedbackEpoch ?? 0}`}
      roomOverview={<EstimateScenarioRooms batch={batch} onSelect={setTargetId} />}
      applyLabel={batch.applyLabel}
      allRooms={batch.all}
      title="Сценарий электрики"
      context={
        batch.all ? (
          `Один набор ответов для всех ${zones.length} помещений. Замеры берутся отдельно из каждого.`
        ) : selectedZone ? (
          <>
            Помещение: <strong>{selectedZone.name}</strong>
          </>
        ) : (
          'Сначала добавьте помещение в блоке замеров.'
        )
      }
      steps={[
        {
          label: 'помещение и исходные работы',
          title: 'Что будем делать и где?',
          blockedReason: selectedZone ? undefined : 'Сначала добавьте помещение.',
          content: (
            <>
              {selectedZone ? (
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
              ) : (
                <p className={styles.applyHint}>Добавьте помещение в блоке замеров выше.</p>
              )}{' '}
              {compatibleState !== 'demolition-only' ? (
                <div className={styles.field}>
                  <span>Снять старую электрику перед монтажом?</span>
                  <EstimateSelect
                    value={draft.demolitionBeforeWork ? 'yes' : 'no'}
                    options={[
                      { value: 'no', label: 'Нет' },
                      { value: 'yes', label: 'Да · объёмы из блока «Демонтаж старой электрики»' },
                    ]}
                    ariaLabel="Демонтаж перед новой электрикой"
                    onChange={(next) => onDraftChange({ demolitionBeforeWork: next === 'yes' })}
                  />
                </div>
              ) : null}
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
            </>
          ),
        },
        {
          label: 'параметры работ',
          title: 'Уточните выбранные работы',
          content: (
            <>
              {' '}
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
                      {
                        value: 'chase',
                        label:
                          wallMaterial === 'drywall'
                            ? 'Новая штроба · недоступно для ГКЛ'
                            : 'В штробе (новой или готовой)',
                        disabled: wallMaterial === 'drywall',
                      },
                      { value: 'open', label: 'Открыто на крепёж' },
                      {
                        value: 'mixed',
                        label: 'Часть открыто, часть в штробе',
                        disabled: wallMaterial === 'drywall',
                      },
                      { value: 'existing', label: 'Кабель уже проложен' },
                    ]}
                    onChange={(next) =>
                      onDraftChange({
                        cableRoute: next as ElectricScenarioDraftState['cableRoute'],
                      })
                    }
                  />
                </div>
              ) : null}
              {!needsWall && !needsRoute ? (
                <p className={styles.applyHint}>
                  Для этого состава дополнительные вопросы не нужны. Объёмы уже взяты из замеров
                  помещения.
                </p>
              ) : null}
            </>
          ),
        },
        {
          label: 'проверка работ',
          title: 'Добавить предложенные работы?',
          content: (
            <p className={styles.applyHint}>
              Проверьте список справа. Новые работы добавятся для выбранного помещения. Уже
              добавленные одинаковые позиции обновятся; дополнительные строки сохранятся.
            </p>
          ),
        },
      ]}
      preview={
        batch.all ? (
          <>
            {batch.ready.map(({ zone }) => {
              const measured = electricInputFromZone(zone)
              return (
                <div key={zone.id}>
                  <strong>{zone.name}</strong>
                  <ul className={styles.workList}>
                    {resolveMeasuredElectricScenarioKeys(application, measured).map((key) => {
                      const item = mappingById.get(key)
                      return (
                        <li key={key}>
                          {item?.title ?? key} —{' '}
                          {resolveElectricScenarioQuantity(
                            key,
                            item?.defaultQuantityFrom ?? 'manual',
                            measured,
                            application,
                          ).toLocaleString('ru-RU')}{' '}
                          {item?.unit}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </>
        ) : (
          <>
            {' '}
            <p className={styles.hydroHint}>{previewLabel}. Работы с заполненным объёмом:</p>
            {preview.length ? (
              <ul className={styles.workList}>
                {preview.map((item) => (
                  <li key={item.key}>
                    {item.title} — {item.quantity.toLocaleString('ru-RU')} {item.unit}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.applyHint}>Для этого сценария ещё нет подходящих замеров.</p>
            )}
            {!batch.all && applyDisabledHint ? (
              <p className={styles.applyHint}>{applyDisabledHint}</p>
            ) : null}
          </>
        )
      }
      canApply={batch.canApply}
      disabledHint={
        batch.all
          ? batch.canApply
            ? null
            : 'Нет помещений с подходящими замерами.'
          : applyDisabledHint
      }
      onApply={handleApply}
      status={
        status ? (
          <p className={styles.status} data-kind={status.kind} role="status" aria-live="polite">
            {status.message}
          </p>
        ) : null
      }
    />
  )
}
