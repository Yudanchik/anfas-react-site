import { useState } from 'react'

import {
  FLOOR_PRICE_MAPPING,
  resolveFloorRoomPlan,
  type DemolitionCoveringOption,
  type EstimateZone,
  type EstimateLine,
  type FloorEstimateInput,
  type FloorPresetApplication,
  type ScreedTypeOption,
  type WasteTripOption,
  type WaterproofingLayersOption,
} from '@/entities/estimate'
import { useEstimateStatusMessage } from '@/features/estimate-calculator/model/use-estimate-status-message'
import { validateFloorPresetMeasures } from '@/features/estimate-calculator/model/validate-scenario-measures'
import { ALL_SCENARIO_ROOMS } from '@/features/estimate-calculator/model/room-scenario-status'
import { useRoomScenarioBatch } from '@/features/estimate-calculator/model/use-room-scenario-batch'
import { EstimateScenarioRooms } from '@/features/estimate-calculator/ui/EstimateScenarioRooms'
import { EstimateScenarioWizard } from '@/features/estimate-calculator/ui/EstimateScenarioWizard'
import { EstimateSelect } from '@/features/estimate-calculator/ui/EstimateSelect'

import styles from '@/features/estimate-calculator/ui/EstimateScenarioWizard.module.scss'

type FloorPresetDraft = {
  roomOldCovering: DemolitionCoveringOption | 'none'
  roomLeveling: ScreedTypeOption | 'self-leveling' | 'none'
  selfLevelingBase: 'inspect' | 'ready' | 'grind' | 'other'
  roomScreedBase: 'inspect' | 'bonded' | 'film' | 'floating'
  roomWaterproofing: WaterproofingLayersOption | 'none'
  covering: DemolitionCoveringOption
  screedType: ScreedTypeOption
  layers: WaterproofingLayersOption
  wasteTrip: WasteTripOption
}

type FloorEstimatePresetsProps = {
  draft?: FloorPresetDraft
  onDraftChange?: (patch: Partial<FloorPresetDraft>) => void
  lines?: readonly EstimateLine[]
  onZonesChange?: (zones: EstimateZone[]) => void
  zones?: readonly EstimateZone[]
  demolitionArea: number
  screedArea: number
  totalFloorArea: number
  wetZonesArea: number
  feedbackEpoch?: number
  onApplyPreset: (
    application: FloorPresetApplication,
    target?: { zone?: EstimateZone },
  ) => { label: string; addedCount: number; zoneName?: string; error?: string }
}

const DEFAULT_DRAFT: FloorPresetDraft = {
  roomOldCovering: 'none',
  roomLeveling: 'none',
  selfLevelingBase: 'inspect',
  roomScreedBase: 'inspect',
  roomWaterproofing: 'none',
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

export function FloorEstimatePresets({
  draft: controlledDraft,
  onDraftChange,
  zones = [],
  lines = [],
  onZonesChange,
  demolitionArea,
  screedArea,
  totalFloorArea,
  wetZonesArea,
  feedbackEpoch,
  onApplyPreset,
}: FloorEstimatePresetsProps) {
  const [uncontrolledDraft, setUncontrolledDraft] = useState<FloorPresetDraft>(DEFAULT_DRAFT)
  const draft = controlledDraft ?? uncontrolledDraft
  const [targetId, setTargetId] = useState('')
  const resolvedTargetId =
    targetId === ALL_SCENARIO_ROOMS || zones.some((entry) => entry.id === targetId)
      ? targetId
      : (zones[0]?.id ?? '')
  const zone = zones.find((entry) => entry.id === targetId) ?? zones[0]
  const { status, setSuccess, setError } = useEstimateStatusMessage({
    clearTokens: [resolvedTargetId, feedbackEpoch ?? 0],
  })
  function patchDraft(patch: Partial<FloorPresetDraft>) {
    if (onDraftChange) onDraftChange(patch)
    else setUncontrolledDraft((previous) => ({ ...previous, ...patch }))
  }
  const generalInput: FloorEstimateInput = {
    demolitionArea,
    screedArea,
    totalFloorArea,
    wetZonesArea,
    avgDeltaMm: 0,
  }
  const input = zone
    ? {
        demolitionArea: zone.demolitionFloorArea,
        screedArea: zone.screedArea,
        totalFloorArea: zone.floorArea,
        wetZonesArea: zone.wetArea,
        avgDeltaMm: 0,
      }
    : generalInput
  const application: Extract<FloorPresetApplication, { presetId: 'room-plan' }> = {
    presetId: 'room-plan',
    oldCovering: draft.roomOldCovering,
    leveling: draft.roomLeveling,
    selfLevelingBase: draft.selfLevelingBase,
    screedBase: draft.roomScreedBase,
    waterproofing: draft.roomWaterproofing,
  }
  const plan = resolveFloorRoomPlan(application, input)
  const mappingById = new Map(FLOOR_PRICE_MAPPING.map((item) => [item.id, item]))
  function applicationForZone(entry: EstimateZone) {
    return {
      ...application,
      waterproofing: entry.wetArea > 0 ? application.waterproofing : ('none' as const),
    }
  }
  const batch = useRoomScenarioBatch({
    section: 'floors',
    zones,
    lines,
    targetId: resolvedTargetId,
    onZonesChange,
    setSuccess,
    setError,
    check: (entry) =>
      validateFloorPresetMeasures({
        application: applicationForZone(entry),
        input: generalInput,
        zone: entry,
      }),
    apply: (entry) => onApplyPreset(applicationForZone(entry), { zone: entry }),
  })
  function apply() {
    return batch.apply()
  }

  return (
    <EstimateScenarioWizard
      key={`${resolvedTargetId}:${feedbackEpoch ?? 0}`}
      roomOverview={<EstimateScenarioRooms batch={batch} onSelect={setTargetId} />}
      applyLabel={batch.applyLabel}
      allRooms={batch.all}
      title="Сценарий полов"
      context={
        batch.all ? (
          `Один набор ответов для всех ${zones.length} помещений. Замеры берутся отдельно из каждого.`
        ) : zone ? (
          <>
            Помещение: <strong>{zone.name}</strong> · площадь пола{' '}
            {zone.floorArea.toLocaleString('ru-RU')} м²
          </>
        ) : (
          'Сначала добавьте помещение в блоке замеров.'
        )
      }
      steps={[
        {
          label: 'помещение и исходные работы',
          title: 'Что будем делать и где?',
          blockedReason: zone ? undefined : 'Сначала добавьте помещение.',
          content: (
            <>
              {zone ? (
                <div className={styles.field}>
                  <span>Помещение</span>
                  <EstimateSelect
                    value={resolvedTargetId}
                    options={[
                      { value: ALL_SCENARIO_ROOMS, label: `Все помещения · ${zones.length}` },
                      ...zones.map((entry) => ({ value: entry.id, label: entry.name })),
                    ]}
                    ariaLabel="Помещение для сценария пола"
                    onChange={setTargetId}
                  />
                </div>
              ) : null}
              <div className={styles.field}>
                <span>Нужно снять старое покрытие?</span>
                <EstimateSelect
                  value={draft.roomOldCovering}
                  ariaLabel="Старое покрытие пола"
                  options={[{ value: 'none', label: 'Нет / уже снято' }, ...DEMOLITION_OPTIONS]}
                  onChange={(next) =>
                    patchDraft({ roomOldCovering: next as FloorPresetDraft['roomOldCovering'] })
                  }
                />
              </div>
            </>
          ),
        },
        {
          label: 'подготовка и гидроизоляция',
          title: 'Как подготовим пол?',
          content: (
            <>
              <div className={styles.field}>
                <span>Как выравниваем основание?</span>
                <EstimateSelect
                  value={draft.roomLeveling}
                  ariaLabel="Выравнивание пола"
                  options={[
                    { value: 'none', label: 'Не требуется' },
                    { value: 'self-leveling', label: 'Ровнитель по подходящему основанию' },
                    ...SCREED_OPTIONS,
                  ]}
                  onChange={(next) =>
                    patchDraft({ roomLeveling: next as FloorPresetDraft['roomLeveling'] })
                  }
                />
              </div>
              {draft.roomLeveling === 'self-leveling' ? (
                <div className={styles.field}>
                  <span>Нужно шлифовать бетон перед наливным полом?</span>
                  <EstimateSelect
                    value={draft.selfLevelingBase}
                    ariaLabel="Состояние основания перед наливным полом"
                    options={[
                      { value: 'inspect', label: 'Пока не осмотрено' },
                      { value: 'ready', label: 'Нет, основание прочное и подготовлено' },
                      { value: 'grind', label: 'Да, снять слабый верхний слой / цементное молочко' },
                      { value: 'other', label: 'Основание не бетонное или непрочное' },
                    ]}
                    onChange={(next) =>
                      patchDraft({ selfLevelingBase: next as FloorPresetDraft['selfLevelingBase'] })
                    }
                  />
                  <p className={styles.applyHint}>
                    Шлифование добавится только при ответе «Да». Сильно крошащееся, влажное или
                    загрязнённое основание нужно сначала оценить: одной шлифовки недостаточно.
                    Обеспыливание и грунтование уже входят в маршрут наливного пола.
                  </p>
                </div>
              ) : null}
              {draft.roomLeveling !== 'none' && draft.roomLeveling !== 'self-leveling' ? (
                <div className={styles.field}>
                  <span>Как устроена стяжка?</span>
                  <EstimateSelect
                    value={draft.roomScreedBase}
                    ariaLabel="Конструкция стяжки пола"
                    options={[
                      { value: 'inspect', label: 'Пока не определено' },
                      { value: 'bonded', label: 'Контактная по основанию · грунтование' },
                      { value: 'film', label: 'На полиэтиленовой плёнке · без грунта под стяжку' },
                      { value: 'floating', label: 'Плавающая по изоляции · уточнить систему' },
                    ]}
                    onChange={(next) =>
                      patchDraft({ roomScreedBase: next as FloorPresetDraft['roomScreedBase'] })
                    }
                  />
                  <p className={styles.applyHint}>
                    Для варианта на плёнке добавляется её укладка вместо грунта. Демпферную ленту
                    и изоляцию добавляйте после замера и проверки выбранной системы.
                  </p>
                </div>
              ) : null}
              <div className={styles.field}>
                <span>Есть площадь под гидроизоляцию?</span>
                <EstimateSelect
                  value={draft.roomWaterproofing}
                  ariaLabel="Гидроизоляция пола"
                  options={[{ value: 'none', label: 'Нет' }, ...HYDRO_OPTIONS]}
                  onChange={(next) =>
                    patchDraft({ roomWaterproofing: next as FloorPresetDraft['roomWaterproofing'] })
                  }
                />
              </div>
              <p className={styles.applyHint}>
                Гидроизоляция добавляется только в помещениях с мокрой площадью больше нуля. В сухих
                помещениях этот этап пропускается.
              </p>
              <p className={styles.applyHint}>
                Покрытие, плинтусы и вывоз мусора добавляются ниже из прайса. Плитка — на своей
                вкладке.
              </p>
            </>
          ),
        },
        {
          label: 'проверка работ',
          title: 'Добавить предложенные работы?',
          content: (
            <p className={styles.applyHint}>
              Проверьте список и объёмы справа. Повторное применение заменит автоматические работы
              этого маршрута в помещении. Ручные строки сохранятся.
            </p>
          ),
        },
      ]}
      preview={
        batch.all ? (
          <>
            {batch.ready.map(({ zone: entry }) => {
              const roomPlan = resolveFloorRoomPlan(applicationForZone(entry), {
                demolitionArea: entry.demolitionFloorArea,
                screedArea: entry.screedArea,
                totalFloorArea: entry.floorArea,
                wetZonesArea: entry.wetArea,
                avgDeltaMm: 0,
              })
              return (
                <div key={entry.id}>
                  <strong>{entry.name}</strong>
                  <ul>
                    {roomPlan.works.map((work) => (
                      <li key={work.key}>
                        {mappingById.get(work.key)?.title ?? work.key} —{' '}
                        {work.quantity.toLocaleString('ru-RU')} м²
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </>
        ) : (
          <>
            {application.waterproofing !== 'none' && (zone?.wetArea ?? 0) === 0 ? (
              <p className={styles.applyHint}>
                В этом помещении нет мокрой площади. Гидроизоляция не добавляется; остальные
                выбранные этапы доступны.
              </p>
            ) : null}
            {plan.works.length ? (
              <ul>
                {plan.works.map((work) => (
                  <li key={work.key}>
                    {mappingById.get(work.key)?.title ?? work.key} —{' '}
                    {work.quantity.toLocaleString('ru-RU')} м²
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.applyHint}>
                Выберите необходимые этапы — здесь появятся работы.
              </p>
            )}
            {plan.issues.map((issue) => (
              <p key={issue} className={styles.applyHint}>
                {issue}
              </p>
            ))}
          </>
        )
      }
      canApply={batch.canApply}
      disabledHint={
        batch.canApply
          ? null
          : batch.excluded
              .map(({ zone: entry, check }) => `${entry.name}: ${check.message}`)
              .join(' ')
      }
      onApply={apply}
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
