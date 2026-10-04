import { useMemo, useState } from 'react'

import {
  CEILING_PRICE_MAPPING,
  resolveCeilingScenarioPlan,
  type CeilingDemolitionCoveringOption,
  type CeilingEstimateInput,
  type CeilingFinishTargetOption,
  type CeilingPaintLayersOption,
  type CeilingScenarioApplication,
  type CeilingStateOption,
  type EstimateZone,
  type EstimateLine,
} from '@/entities/estimate'

import type { CeilingScenarioDraftState } from '../model/estimate-calculator-persistence'
import { useEstimateStatusMessage } from '../model/use-estimate-status-message'
import {
  canApplyCeilingScenario,
  validateCeilingScenarioMeasures,
} from '../model/validate-scenario-measures'
import { ALL_SCENARIO_ROOMS } from '../model/room-scenario-status'
import { useRoomScenarioBatch } from '../model/use-room-scenario-batch'
import { EstimateScenarioRooms } from '../ui/EstimateScenarioRooms'
import { EstimateScenarioWizard } from '../ui/EstimateScenarioWizard'
import { EstimateSelect } from '../ui/EstimateSelect'
import styles from '../ui/EstimateScenarioWizard.module.scss'

type CeilingEstimateScenariosProps = {
  draft: CeilingScenarioDraftState
  onDraftChange: (patch: Partial<CeilingScenarioDraftState>) => void
  lines?: readonly EstimateLine[]
  onZonesChange?: (zones: EstimateZone[]) => void
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
  lines = [],
  onZonesChange,
  generalInput,
  feedbackEpoch,
  onApplyScenario,
}: CeilingEstimateScenariosProps) {
  const {
    state,
    finishTarget,
    demolitionCovering,
    paintLayers,
    demolitionBeforeWork,
    substrate,
    quality,
    reinforce,
    gklConstruction,
    gklSeamsReady,
  } = draft
  const [targetId, setTargetId] = useState('')
  const { status, setSuccess, setError } = useEstimateStatusMessage({
    clearTokens: [targetId, feedbackEpoch ?? 0, zones.length],
  })

  const finishDisabled = state === 'demolition-only' || state === 'local-leveling'
  const needsFinishChoice = state === 'finish-only'
  const showDemolitionCovering =
    state === 'demolition-only' || (state === 'from-scratch' && demolitionBeforeWork)
  const showPaintLayers = finishTarget === 'paint' && !finishDisabled

  const targetOptions = useMemo(
    () => [
      { value: ALL_SCENARIO_ROOMS, label: `Все помещения · ${zones.length}` },
      ...zones.map((zone) => ({ value: zone.id, label: zone.name })),
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
    demolitionBeforeWork: state === 'from-scratch' && demolitionBeforeWork,
    substrate: state === 'prefinish' || state === 'finish-only' ? 'plastered' : substrate,
    quality,
    reinforce: resolvedFinish === 'paint' && reinforce,
    gklConstruction: substrate === 'drywall' ? gklConstruction : undefined,
    gklSeamsReady: substrate === 'drywall' && gklConstruction === 'existing' ? gklSeamsReady : false,
  }
  const plan = resolveCeilingScenarioPlan(application)
  const mappingById = new Map(CEILING_PRICE_MAPPING.map((item) => [item.id, item]))

  const measureCheck = validateCeilingScenarioMeasures({
    application,
    input: generalInput,
    zone: selectedZone,
  })
  const canApply =
    Boolean(selectedZone) &&
    plan.issues.length === 0 &&
    canApplyCeilingScenario({
      application,
      input: generalInput,
      zone: selectedZone,
    })
  const applyDisabledHint = plan.issues.length
    ? plan.issues.join(' ')
    : canApply
      ? null
      : measureCheck.ok
        ? null
        : measureCheck.message

  const batch = useRoomScenarioBatch({
    section: 'ceilings',
    zones,
    lines,
    targetId: resolvedTargetId,
    onZonesChange,
    setSuccess,
    setError,
    check: (zone) => validateCeilingScenarioMeasures({ application, input: generalInput, zone }),
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
      title="Сценарий потолков"
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
                    ariaLabel="Применить сценарий потолков к"
                    onChange={setTargetId}
                  />
                </div>
              ) : (
                <p className={styles.applyHint}>Добавьте помещение в блоке замеров выше.</p>
              )}{' '}
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
              {state === 'from-scratch' ? (
                <div className={styles.field}>
                  <span>Сначала снять старое покрытие?</span>
                  <EstimateSelect
                    value={demolitionBeforeWork ? 'yes' : 'no'}
                    ariaLabel="Демонтаж перед подготовкой потолка"
                    options={[
                      { value: 'no', label: 'Нет, основание свободно' },
                      { value: 'yes', label: 'Да, затем подготовить заново' },
                    ]}
                    onChange={(next) => onDraftChange({ demolitionBeforeWork: next === 'yes' })}
                  />
                </div>
              ) : null}
              {['from-scratch', 'after-demolition', 'local-leveling'].includes(state) ? (
                <div className={styles.field}>
                  <span>Какое основание потолка?</span>
                  <EstimateSelect
                    value={substrate}
                    ariaLabel="Основание потолка"
                    options={[
                      { value: 'unknown', label: 'Пока неизвестно' },
                      { value: 'mineral', label: 'Минеральное перекрытие' },
                      { value: 'plastered', label: 'Прочная старая штукатурка' },
                      { value: 'drywall', label: 'Гипсокартон' },
                    ]}
                    onChange={(next) =>
                      onDraftChange({ substrate: next as CeilingScenarioDraftState['substrate'] })
                    }
                  />
                </div>
              ) : null}
              {substrate === 'drywall' &&
              (state === 'from-scratch' || state === 'after-demolition') ? (
                <>
                  <div className={styles.field}>
                    <span>ГКЛ уже смонтирован или собираем потолок?</span>
                    <EstimateSelect
                      value={gklConstruction}
                      options={[
                        { value: 'existing', label: 'Уже смонтирован · подготовить поверхность' },
                        { value: 'new-one', label: 'Новый одноуровневый · каркас и 1 слой ГКЛ' },
                        { value: 'new-two', label: 'Новый одноуровневый · каркас и 2 слоя ГКЛ' },
                      ]}
                      ariaLabel="Конструкция ГКЛ потолка"
                      onChange={(value) => onDraftChange({ gklConstruction: value as CeilingScenarioDraftState['gklConstruction'] })}
                    />
                  </div>
                  {gklConstruction === 'existing' ? (
                    <div className={styles.field}>
                      <span>Швы и крепёж уже подготовлены?</span>
                      <EstimateSelect
                        value={gklSeamsReady ? 'yes' : 'no'}
                        options={[
                          { value: 'no', label: 'Нет · добавить обработку швов и крепежа' },
                          { value: 'yes', label: 'Да · не добавлять повторно' },
                        ]}
                        ariaLabel="Подготовка швов ГКЛ потолка"
                        onChange={(value) => onDraftChange({ gklSeamsReady: value === 'yes' })}
                      />
                    </div>
                  ) : null}
                  <p className={styles.applyHint}>
                    Для необработанных швов укажите их длину в замерах помещения.
                  </p>
                </>
              ) : null}
            </>
          ),
        },
        {
          label: 'параметры работ',
          title: 'Уточните выбранные работы',
          content: (
            <>
              {' '}
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
              {['from-scratch', 'after-demolition', 'prefinish'].includes(state) ? (
                <div className={styles.field}>
                  <span>Требуемое качество подготовки</span>
                  <EstimateSelect
                    value={quality}
                    ariaLabel="Качество потолка"
                    options={[
                      { value: 'q2', label: 'Q2 · фактурный финиш' },
                      { value: 'q3', label: 'Q3 · матовая окраска' },
                      { value: 'q4', label: 'Q4 · требовательная глянцевая отделка' },
                    ]}
                    onChange={(next) =>
                      onDraftChange({ quality: next as CeilingScenarioDraftState['quality'] })
                    }
                  />
                </div>
              ) : null}
              {resolvedFinish === 'paint' &&
              ['from-scratch', 'after-demolition', 'prefinish'].includes(state) ? (
                <div className={styles.field}>
                  <span>Стеклохолст предусмотрен проектом?</span>
                  <EstimateSelect
                    value={reinforce ? 'yes' : 'no'}
                    ariaLabel="Стеклохолст потолка"
                    options={[
                      { value: 'no', label: 'Нет' },
                      { value: 'yes', label: 'Да, добавить отдельно' },
                    ]}
                    onChange={(next) => onDraftChange({ reinforce: next === 'yes' })}
                  />
                </div>
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
        <>
          {' '}
          <p className={styles.applyHint}>В черновик попадут:</p>
          <ul className={styles.workList}>
            {plan.keys.map((key) => (
              <li key={key}>{mappingById.get(key)?.title ?? key}</li>
            ))}
          </ul>
          {!batch.all && applyDisabledHint ? (
            <p className={styles.applyHint}>{applyDisabledHint}</p>
          ) : null}
        </>
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
