import { useMemo, useState } from 'react'

import {
  PLUMBING_PRICE_MAPPING,
  formatPlumbingScenarioLabel,
  formatPlumbingScenarioZoneMismatchMessage,
  isPlumbingScenarioAllowedForZone,
  resolvePlumbingScenarioOptionsForZone,
  resolvePlumbingScenarioPlan,
  resolveMeasuredPlumbingScenarioKeys,
  resolvePlumbingScenarioQuantity,
  plumbingInputFromZone,
  type EstimateZone,
  type EstimateLine,
  type PlumbingEstimateInput,
  type PlumbingScenarioApplication,
  type PlumbingStateOption,
} from '@/entities/estimate'

import type { PlumbingScenarioDraftState } from '../model/estimate-calculator-persistence'
import { useEstimateStatusMessage } from '../model/use-estimate-status-message'
import {
  canApplyPlumbingScenario,
  validatePlumbingScenarioMeasures,
} from '../model/validate-scenario-measures'
import { ALL_SCENARIO_ROOMS } from '../model/room-scenario-status'
import { useRoomScenarioBatch } from '../model/use-room-scenario-batch'
import { EstimateScenarioRooms } from '../ui/EstimateScenarioRooms'
import { EstimateScenarioWizard } from '../ui/EstimateScenarioWizard'
import { EstimateSelect } from '../ui/EstimateSelect'
import { formatPlumbingScenarioTargetLabel } from './format-plumbing-scenario-target-label'
import styles from '../ui/EstimateScenarioWizard.module.scss'

export { formatPlumbingScenarioTargetLabel } from './format-plumbing-scenario-target-label'

type PlumbingEstimateScenariosProps = {
  draft: PlumbingScenarioDraftState
  onDraftChange: (patch: Partial<PlumbingScenarioDraftState>) => void
  lines?: readonly EstimateLine[]
  onZonesChange?: (zones: EstimateZone[]) => void
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
  lines = [],
  onZonesChange,
  generalInput,
  feedbackEpoch,
  onApplyScenario,
}: PlumbingEstimateScenariosProps) {
  const { state, toiletKind, bathKind, showerKind, sinkKind } = draft
  const [targetId, setTargetId] = useState('')
  const { status, setSuccess, setError } = useEstimateStatusMessage({
    clearTokens: [targetId, feedbackEpoch ?? 0, zones.length],
  })

  const targetOptions = useMemo(
    () => [
      { value: ALL_SCENARIO_ROOMS, label: `Все помещения · ${zones.length}` },
      ...zones.map((zone) => ({
        value: zone.id,
        label: formatPlumbingScenarioTargetLabel(zone),
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
  const { primary } = resolvePlumbingScenarioOptionsForZone(filterZoneType, false)
  const stateOptions = primary.map((option) => ({ value: option.id, label: option.label }))
  const compatibleState = resolveCompatibleState(state, filterZoneType)
  const selectedStates = draft.states?.length ? [...new Set(draft.states)] : [compatibleState]

  const application: PlumbingScenarioApplication = {
    state: selectedStates[0],
    states: selectedStates,
    toiletKind,
    bathKind,
    showerKind,
    sinkKind,
  }

  function applicationForZone(zone: EstimateZone): PlumbingScenarioApplication {
    if (
      toiletKind !== 'unknown' ||
      !zone.plumbingToiletMount ||
      zone.plumbingToiletMount === 'unknown'
    )
      return application
    return {
      ...application,
      toiletKind: zone.plumbingToiletMount === 'floor' ? 'floor' : 'installation',
    }
  }
  const previewInput = selectedZone ? plumbingInputFromZone(selectedZone) : generalInput
  const plan = resolvePlumbingScenarioPlan(
    selectedZone ? applicationForZone(selectedZone) : application,
    previewInput,
  )
  const mappingById = new Map(PLUMBING_PRICE_MAPPING.map((item) => [item.id, item]))
  const preview = resolveMeasuredPlumbingScenarioKeys(
    selectedZone ? applicationForZone(selectedZone) : application,
    previewInput,
  ).map((key) => {
    const item = mappingById.get(key)
    return {
      key,
      title: item?.title ?? key,
      unit: item?.unit ?? '',
      quantity: resolvePlumbingScenarioQuantity(
        key,
        item?.defaultQuantityFrom ?? 'manual',
        previewInput,
        selectedZone ? applicationForZone(selectedZone) : application,
      ),
    }
  })
  const bathroom = selectedStates.some((selected) =>
    selected === 'bathroom-from-scratch' || selected === 'bathroom-replacement')
  const fixtures = bathroom || selectedStates.includes('fixtures-only')
  const hasToilet =
    (fixtures || selectedStates.includes('toilet-zone')) &&
    (resolvedTargetId === ALL_SCENARIO_ROOMS
      ? zones.some((zone) => zone.plumbingToiletsCount > 0)
      : previewInput.plumbingToiletsCount > 0)
  const hasBath =
    (fixtures || selectedStates.includes('bath-zone')) &&
    (resolvedTargetId === ALL_SCENARIO_ROOMS
      ? zones.some((zone) => zone.plumbingBathtubsCount > 0)
      : previewInput.plumbingBathtubsCount > 0)
  const hasShower =
    (fixtures || selectedStates.includes('bath-zone')) &&
    (resolvedTargetId === ALL_SCENARIO_ROOMS
      ? zones.some((zone) => zone.plumbingShowersCount > 0)
      : previewInput.plumbingShowersCount > 0)
  const hasSink =
    fixtures &&
    (resolvedTargetId === ALL_SCENARIO_ROOMS
      ? zones.some((zone) => zone.plumbingSinksCount > 0)
      : previewInput.plumbingSinksCount > 0)

  const incompatibleState = selectedStates.find((selected) =>
    !isPlumbingScenarioAllowedForZone(selected, filterZoneType))
  const zoneFitOk = !incompatibleState
  const measureCheck = validatePlumbingScenarioMeasures({
    application: selectedZone ? applicationForZone(selectedZone) : application,
    input: generalInput,
    zone: selectedZone,
  })
  const canApply =
    Boolean(selectedZone) &&
    zoneFitOk &&
    plan.issues.length === 0 &&
    canApplyPlumbingScenario({
      application: selectedZone ? applicationForZone(selectedZone) : application,
      input: generalInput,
      zone: selectedZone,
    })
  const applyDisabledHint = !zoneFitOk
    ? formatPlumbingScenarioZoneMismatchMessage(incompatibleState!)
    : plan.issues.length
      ? plan.issues.join(' ')
      : canApply
        ? null
        : measureCheck.ok
          ? null
          : measureCheck.message

  const previewLabel = formatPlumbingScenarioLabel(application)

  function syncStateForZoneType(zoneType: EstimateZone['zoneType'] | null) {
    const retained = selectedStates.filter((selected) => isPlumbingScenarioAllowedForZone(selected, zoneType))
    const next = retained.length ? retained : [resolveCompatibleState(state, zoneType)]
    onDraftChange({ state: next[0], states: next })
  }

  const batch = useRoomScenarioBatch({
    section: 'plumbing',
    zones,
    lines,
    targetId: resolvedTargetId,
    onZonesChange,
    setSuccess,
    setError,
    check: (zone) =>
      validatePlumbingScenarioMeasures({
        application: applicationForZone(zone),
        input: generalInput,
        zone,
      }),
    apply: (zone) => onApplyScenario(applicationForZone(zone), { zone }),
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
      title="Сценарий сантехники"
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
                    ariaLabel="Применить сценарий сантехники к"
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
              <div className={styles.field}>
                <span>Выберите нужные сценарии для помещения</span>
                <div className={styles.scenarioChoices} role="group" aria-label="Сценарии сантехники">
                  {stateOptions.map((option) => (
                    <label key={option.value}>
                      <input type="checkbox" checked={selectedStates.includes(option.value)}
                        disabled={selectedStates.length === 1 && selectedStates.includes(option.value)}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...selectedStates, option.value]
                            : selectedStates.filter((selected) => selected !== option.value)
                          onDraftChange({ state: next[0] ?? state, states: next })
                        }} />
                      {option.label}
                    </label>
                  ))}
                </div>
                <p className={styles.applyHint}>
                  Повторяющиеся работы объединяются в одну строку на помещение. Противоречащие
                  маршруты, например «санузел с нуля» и «замена», выбрать вместе нельзя.
                </p>
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
              {hasToilet ? (
                <div className={styles.field}>
                  <span>Какой унитаз устанавливаем?</span>
                  <EstimateSelect
                    value={
                      selectedZone
                        ? (applicationForZone(selectedZone).toiletKind ?? toiletKind)
                        : toiletKind
                    }
                    ariaLabel="Тип унитаза"
                    options={[
                      { value: 'unknown', label: 'Пока неизвестно' },
                      { value: 'floor', label: 'Напольный' },
                      { value: 'installation', label: 'На инсталляции' },
                    ]}
                    onChange={(next) =>
                      onDraftChange({
                        toiletKind: next as PlumbingScenarioDraftState['toiletKind'],
                      })
                    }
                  />
                </div>
              ) : null}
              {hasBath ? (
                <div className={styles.field}>
                  <span>Какая ванна?</span>
                  <EstimateSelect
                    value={bathKind}
                    ariaLabel="Тип ванны"
                    options={[
                      { value: 'unknown', label: 'Пока неизвестно' },
                      { value: 'acrylic', label: 'Акриловая' },
                      { value: 'cast-iron', label: 'Чугунная' },
                      { value: 'quaryl', label: 'Кварил или искусственный камень' },
                    ]}
                    onChange={(next) =>
                      onDraftChange({ bathKind: next as PlumbingScenarioDraftState['bathKind'] })
                    }
                  />
                </div>
              ) : null}
              {hasShower ? (
                <div className={styles.field}>
                  <span>Какой душ?</span>
                  <EstimateSelect
                    value={showerKind}
                    ariaLabel="Тип душа"
                    options={[
                      { value: 'unknown', label: 'Пока неизвестно' },
                      { value: 'tray', label: 'Готовый поддон' },
                      { value: 'cabin', label: 'Душевая кабина' },
                    ]}
                    onChange={(next) =>
                      onDraftChange({
                        showerKind: next as PlumbingScenarioDraftState['showerKind'],
                      })
                    }
                  />
                </div>
              ) : null}
              {hasSink ? (
                <div className={styles.field}>
                  <span>Какая раковина?</span>
                  <EstimateSelect
                    value={sinkKind}
                    ariaLabel="Тип раковины"
                    options={[
                      { value: 'unknown', label: 'Пока неизвестно' },
                      { value: 'ordinary', label: 'Обычная' },
                      { value: 'wall', label: 'Подвесная' },
                      { value: 'countertop', label: 'Накладная на столешницу' },
                      { value: 'inset', label: 'Врезная' },
                    ]}
                    onChange={(next) =>
                      onDraftChange({ sinkKind: next as PlumbingScenarioDraftState['sinkKind'] })
                    }
                  />
                </div>
              ) : null}
              {!hasToilet && !hasBath && !hasShower && !hasSink ? (
                <p className={styles.applyHint}>
                  В этом маршруте нет приборов, тип которых нужно уточнять. Проверьте замеры и
                  список справа.
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
              const measured = plumbingInputFromZone(zone)
              return (
                <div key={zone.id}>
                  <strong>{zone.name}</strong>
                  <ul className={styles.workList}>
                    {resolveMeasuredPlumbingScenarioKeys(applicationForZone(zone), measured).map(
                      (key) => {
                        const item = mappingById.get(key)
                        return (
                          <li key={key}>
                            {item?.title ?? key} —{' '}
                            {resolvePlumbingScenarioQuantity(
                              key,
                              item?.defaultQuantityFrom ?? 'manual',
                              measured,
                              applicationForZone(zone),
                            ).toLocaleString('ru-RU')}{' '}
                            {item?.unit}
                          </li>
                        )
                      },
                    )}
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
            {plan.notes.map((note) => (
              <p key={note} className={styles.applyHint}>
                {note}
              </p>
            ))}
            {!batch.all && applyDisabledHint ? (
              <p className={styles.applyHint}>{applyDisabledHint}</p>
            ) : null}
          </>
        )
      }
      canApply={selectedStates.length > 0 && batch.canApply}
      disabledHint={
        selectedStates.length === 0 ? 'Выберите хотя бы один сценарий.' : batch.all
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
