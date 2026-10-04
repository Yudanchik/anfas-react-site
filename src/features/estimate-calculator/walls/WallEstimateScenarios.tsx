import { useMemo, useState } from 'react'

import {
  calculateWallMeasurements,
  formatWallScenarioFeedback,
  formatWallScenarioLabel,
  getWallScenarioProgress,
  formatWallScenarioZoneFeedback,
  resolveWallScenarioPlan,
  wallScenarioForZone,
  WALL_PRICE_MAPPING,
  type EstimateZone,
  type EstimateLine,
  type WallDemolitionCoveringOption,
  type WallEstimateInput,
  type WallFinishTargetOption,
  type WallPaintLayersOption,
  type WallPriceMappingItem,
  type WallScenarioApplication,
  type WallScenarioApplyMode,
  type WallSubstrateOption,
  type WallLevelingOption,
  type WallMoistureOption,
  type WallQualityOption,
  type WallBaseConditionOption,
  type WallSlopesWorkOption,
  type WallStateOption,
  type WallWallpaperTypeOption,
} from '@/entities/estimate'

import type { WallScenarioDraftState } from '../model/estimate-calculator-persistence'
import { useEstimateStatusMessage } from '../model/use-estimate-status-message'
import {
  getScenarioMeasuresDisabledHint,
  validateWallScenarioMeasures,
} from '../model/validate-scenario-measures'
import { EstimateSelect } from '../ui/EstimateSelect'
import {
  WALL_DEMOLITION_OPTIONS,
  WALL_FINISH_OPTIONS,
  WALL_PAINT_OPTIONS,
  WALL_SLOPES_OPTIONS,
  WALL_STATE_OPTIONS,
  WALL_WALLPAPER_OPTIONS,
  WALL_SUBSTRATE_OPTIONS,
  WALL_LEVELING_OPTIONS,
  WALL_MOISTURE_OPTIONS,
  WALL_QUALITY_OPTIONS,
  WALL_BASE_CONDITION_OPTIONS,
} from './wall-scenario-questions'
import styles from './WallEstimateScenarios.module.scss'

type Props = {
  draft: WallScenarioDraftState
  onDraftChange: (patch: Partial<WallScenarioDraftState>) => void
  step: 1 | 2 | 3
  onStepChange: (step: 1 | 2 | 3) => void
  targetId: string
  onTargetChange: (targetId: string) => void
  zones?: readonly EstimateZone[]
  generalInput: WallEstimateInput
  wallLines: readonly EstimateLine[]
  mapping?: readonly WallPriceMappingItem[]
  feedbackEpoch?: number
  onApplyScenario: (
    application: WallScenarioApplication,
    target?: { zone?: EstimateZone },
    mode?: WallScenarioApplyMode,
  ) => { label: string; addedCount: number; zoneName?: string; error?: string }
  onApplyToZones: (application: WallScenarioApplication, zones: readonly EstimateZone[], mode?: WallScenarioApplyMode) =>
    { addedCount: number; error?: string }
}

export function WallEstimateScenarios({
  draft,
  onDraftChange,
  step,
  onStepChange,
  targetId,
  onTargetChange,
  zones = [],
  generalInput,
  wallLines,
  mapping = WALL_PRICE_MAPPING,
  feedbackEpoch,
  onApplyScenario,
  onApplyToZones,
}: Props) {
  const { state, finishTarget, demolitionCovering, demolitionBeforeWork, wallpaperType, paintLayers,
    slopesWork = 'none', substrate, leveling, moisture, quality, reinforce, baseCondition } = draft
  const [applyChoice, setApplyChoice] = useState<{ key: string; mode: WallScenarioApplyMode } | null>(null)
  const { status, setSuccess, setError } = useEstimateStatusMessage({
    clearTokens: feedbackEpoch === undefined ? [] : [feedbackEpoch],
  })
  const targets = useMemo(() => [
    ...(zones.length > 1 ? [{ value: 'all', label: `Все помещения (${zones.length})` }] : []),
    ...zones.map((zone) => ({ value: zone.id, label: zone.name })),
  ], [zones])
  const resolvedTargetId = targets.some((option) => option.value === targetId) ? targetId : zones[0]?.id
  const applyToAll = resolvedTargetId === 'all'
  const selectedZone = zones.find((zone) => zone.id === resolvedTargetId)
  const targetZones = applyToAll ? zones : selectedZone ? [selectedZone] : []
  const slopesLength = targetZones.reduce((sum, zone) => sum + zone.slopesLength, 0)
  const finishDisabled = state === 'demolition-only' || state === 'local-leveling'
  const resolvedSubstrate: WallSubstrateOption = state === 'finish-only' ? 'plastered'
    : state === 'prefinish' ? 'plastered'
      : substrate === 'dense' ? 'absorbent' : substrate
  const resolvedBaseCondition: WallBaseConditionOption = state === 'finish-only' ? 'sound' : baseCondition
  const resolvedMoisture: WallMoistureOption = moisture
  const resolvedFinish: WallFinishTargetOption = finishDisabled
    ? 'none'
    : state === 'finish-only' && finishTarget === 'none' ? 'paint' : finishTarget
  const application: WallScenarioApplication = {
    state,
    finishTarget: resolvedFinish,
    demolitionCovering: state === 'demolition-only' || (state === 'from-scratch' && demolitionBeforeWork) ? demolitionCovering : undefined,
    demolitionBeforeWork: state === 'from-scratch' && demolitionBeforeWork,
    wallpaperType: resolvedFinish === 'wallpaper' ? wallpaperType : undefined,
    paintLayers: resolvedFinish === 'paint' ? paintLayers : undefined,
    slopesWork: state === 'demolition-only' || moisture === 'wet' || slopesLength <= 0 ? 'none' : slopesWork,
    substrate: resolvedSubstrate,
    leveling,
    moisture: resolvedMoisture,
    quality,
    reinforce,
    baseCondition: resolvedBaseCondition,
  }
  const previewApplication = targetZones.some((zone) => zone.slopesLength > 0)
    ? application : { ...application, slopesWork: 'none' as const }
  const plan = resolveWallScenarioPlan(previewApplication)
  const keys = plan.keys
  const showDemolitionCovering = state === 'demolition-only' || (state === 'from-scratch' && demolitionBeforeWork)
  const mappingById = useMemo(() => new Map(mapping.map((item) => [item.id, item])), [mapping])
  const measured = selectedZone?.wallMeasurements?.walls.length
    ? calculateWallMeasurements(selectedZone.wallMeasurements)
    : null
  const invalidTargets = targetZones.flatMap((zone) => {
    const measurements = zone.wallMeasurements?.walls.length
      ? calculateWallMeasurements(zone.wallMeasurements) : null
    if (measurements && (measurements.errors.length || measurements.netArea !== zone.wallArea)) {
      return [{ name: zone.name, reason: 'проверьте стены и проёмы' }]
    }
    if ((state === 'from-scratch' || state === 'after-demolition') && leveling === 'local' &&
      !(zone.plasterArea > 0 && zone.plasterArea <= zone.wallArea)) {
      return [{ name: zone.name, reason: 'укажите площадь локальной штукатурки, не больше площади стен' }]
    }
    if (state === 'local-leveling' && !(zone.puttyArea > 0 && zone.puttyArea <= zone.wallArea)) {
      return [{ name: zone.name, reason: 'укажите площадь локальной шпаклёвки' }]
    }
    const check = validateWallScenarioMeasures({
      application: wallScenarioForZone(application, zone), input: generalInput, zone,
    })
    return check.ok ? [] : [{ name: zone.name, reason: 'нет нужных замеров' }]
  })
  const technicalIssue = plan.issues.join(' ') || null
  const existingZones = targetZones.filter((zone) => zone.wallScenario)
  const choiceKey = targetZones.map((zone) => `${zone.id}:${zone.wallScenario?.applications?.length ?? (zone.wallScenario ? 1 : 0)}`).join('|')
  const selectedMode = applyChoice?.key === choiceKey ? applyChoice.mode : null
  const canApply = targetZones.length > 0 && invalidTargets.length === 0 && !technicalIssue &&
    (existingZones.length === 0 || selectedMode !== null)
  const disabledHint = !targetZones.length ? 'Сначала добавьте помещение и замерьте его стены.'
      : invalidTargets.length ? `Не готовы: ${invalidTargets.map((item) => `${item.name} — ${item.reason}`).join('; ')}`
      : technicalIssue
  const completedCount = zones.filter((zone) => getWallScenarioProgress(zone, wallLines) === 'applied').length
  const nextPending = zones.find((zone) => zone.id !== selectedZone?.id && getWallScenarioProgress(zone, wallLines) === 'pending')

  function handleApply() {
    if (!canApply) {
      setError(disabledHint ?? getScenarioMeasuresDisabledHint(true))
      return
    }
    if (applyToAll) {
      const result = onApplyToZones(application, targetZones, selectedMode ?? 'add')
      if (result.error) {
        setError(result.error)
        return
      }
      setSuccess(`Сценарий «${formatWallScenarioLabel(application)}» применён к ${targetZones.length} помещениям. Обработано позиций: ${result.addedCount}.`)
      setApplyChoice(null)
      return
    }
    const result = onApplyScenario(application, { zone: selectedZone }, selectedMode ?? 'add')
    if (result.error) {
      setError(result.error)
      return
    }
    setSuccess(result.zoneName
      ? formatWallScenarioZoneFeedback(result.label, result.zoneName, result.addedCount)
      : formatWallScenarioFeedback(result.label, result.addedCount))
    setApplyChoice(null)
  }

  return (
    <section className={styles.wrap} aria-labelledby="wall-estimate-scenarios-title">
      <div className={styles.head}>
        <h2 className={styles.title} id="wall-estimate-scenarios-title">Сценарий стен</h2>
        <p className={styles.lead}>Выберите одно помещение или все сразу, ответьте на вопросы и проверьте предложенные работы.</p>
      </div>

      <p className={styles.roomContext}>{applyToAll
        ? <>Один набор ответов для <strong>всех {zones.length} помещений</strong>. Объёмы берутся отдельно из каждого помещения; при разных технологиях выбирайте их по очереди.</>
        : selectedZone
          ? <>Сценарий для помещения: <strong>{selectedZone.name}</strong> · площадь стен <strong>{selectedZone.wallArea.toLocaleString('ru-RU')} м²</strong>{measured?.errors.length ? ' · проверьте замеры' : ''}</>
          : 'Сначала добавьте помещение выше, в блоке замеров.'}</p>
      {zones.length ? <div className={styles.progressBlock}>
        <p className={styles.progressTitle}>Работы по сценарию добавлены в {completedCount} из {zones.length} помещений</p>
        <ul className={styles.roomProgress}>{zones.map((zone) => {
          const progress = getWallScenarioProgress(zone, wallLines)
          return <li key={zone.id}><button type="button" data-active={zone.id === resolvedTargetId ? 'true' : 'false'}
            onClick={() => onTargetChange(zone.id)}>
            <strong>{zone.name}</strong>
            <span>{progress === 'pending' ? 'Работы по стенам ещё не добавлены' : progress === 'unknown' ? 'Работы есть · сценарий не отмечен'
              : progress === 'review' ? 'Проверить изменения'
                : (zone.wallScenario!.applications?.length ?? 1) > 1
                  ? `${zone.wallScenario!.applications!.length} сценария · последний: ${formatWallScenarioLabel(zone.wallScenario!.application)}`
                  : formatWallScenarioLabel(zone.wallScenario!.application)}</span>
          </button></li>
        })}</ul>
      </div> : null}
      <p className={styles.stepLabel}>Шаг {step} из 3 · {step === 1 ? 'Помещение и исходные работы' : step === 2 ? 'Желаемый результат' : 'Проверка работ'}</p>
      <div className={`${styles.grid} ${step < 3 ? styles.gridWithPreview : ''}`}>
        <article className={`${styles.card} ${styles.cardAccent}`}>
          {step === 1 ? (
            <>
              <h3 className={styles.cardTitle}>Что будем делать и где?</h3>
              <div className={styles.field}>
                <span>Куда добавить работы?</span>
                {targets.length ? <EstimateSelect value={resolvedTargetId} options={targets} ariaLabel="Применить сценарий стен к" onChange={onTargetChange} />
                  : <p className={styles.cardHint}>Добавьте помещение в блоке замеров выше.</p>}
              </div>
              <div className={styles.field}>
                <span>В каком состоянии стены и что нужно сделать?</span>
                <EstimateSelect value={state} options={WALL_STATE_OPTIONS} ariaLabel="Состояние стен" onChange={(value) => {
                  const next = value as WallStateOption
                  const patch: Partial<WallScenarioDraftState> = { state: next }
                  if (next === 'demolition-only' || next === 'local-leveling') patch.finishTarget = 'none'
                  if (next === 'finish-only' && finishTarget === 'none') patch.finishTarget = 'paint'
                  if (next === 'finish-only') patch.quality = 'q3'
                  if (next === 'prefinish') {
                    patch.substrate = 'plastered'
                    patch.leveling = 'none'
                  }
                  onDraftChange(patch)
                }} />
              </div>
              <p className={styles.cardHint}>{state === 'after-demolition'
                ? 'Покрытие уже снято: демонтаж в смету не добавится.'
                : state === 'from-scratch'
                  ? 'Полная подготовка стен. Если сначала нужно снять покрытие, ответьте на вопрос ниже.'
                  : state === 'prefinish'
                    ? 'Штукатурка уже готова: добавится подготовка под отделку без повторной штукатурки.'
                    : state === 'local-leveling'
                      ? 'Только локальные работы без отделки всей стены.'
                      : state === 'finish-only'
                        ? 'Подготовка уже выполнена: добавится только выбранная отделка.'
                        : 'Добавится только демонтаж; новую отделку можно выбрать через «С нуля».'}</p>
              {state === 'from-scratch' ? <div className={styles.field}>
                <span>Перед подготовкой снять старое покрытие?</span>
                <EstimateSelect value={demolitionBeforeWork ? 'yes' : 'no'}
                  options={[{ value: 'no', label: 'Нет, основание уже свободно' }, { value: 'yes', label: 'Да, снять и затем подготовить стены' }]}
                  ariaLabel="Снять старое покрытие перед подготовкой"
                  onChange={(value) => onDraftChange({ demolitionBeforeWork: value === 'yes' })} />
              </div> : null}
              {showDemolitionCovering ? <div className={styles.field}>
                <span>Что именно снимаем?</span>
                <EstimateSelect value={demolitionCovering} options={WALL_DEMOLITION_OPTIONS} ariaLabel="Старое покрытие стен"
                  onChange={(value) => onDraftChange({ demolitionCovering: value as WallDemolitionCoveringOption })} />
              </div> : null}
              {state !== 'demolition-only' && state !== 'finish-only' ? <>
                {state !== 'prefinish' ?
                <div className={styles.field}>
                  <span>Из чего основание стены?</span>
                  <EstimateSelect value={resolvedSubstrate} options={WALL_SUBSTRATE_OPTIONS} ariaLabel="Материал основания стен"
                    onChange={(value) => onDraftChange({ substrate: value as WallSubstrateOption })} />
                </div> : null}
                <div className={styles.field}>
                  <span>Основание прочное?</span>
                  <EstimateSelect value={baseCondition} options={WALL_BASE_CONDITION_OPTIONS} ariaLabel="Состояние основания стен"
                    onChange={(value) => onDraftChange({ baseCondition: value as WallBaseConditionOption })} />
                </div>
                {(state === 'from-scratch' || state === 'after-demolition') ? <div className={styles.field}>
                  <span>Сколько стены нужно выравнивать?</span>
                  <EstimateSelect value={leveling} options={WALL_LEVELING_OPTIONS} ariaLabel="Объём выравнивания стен"
                    onChange={(value) => onDraftChange({ leveling: value as WallLevelingOption })} />
                  <p className={styles.cardHint}>Для локальных участков уточните площадь штукатурки в замерах комнаты.</p>
                </div> : null}
              </> : null}
              {state !== 'demolition-only' ? <div className={styles.field}>
                <span>Есть прямое попадание воды на стены?</span>
                <EstimateSelect value={moisture} options={WALL_MOISTURE_OPTIONS} ariaLabel="Режим влажности стен"
                  onChange={(value) => onDraftChange({ moisture: value as WallMoistureOption })} />
                {moisture === 'wet' ? <p className={styles.cardHint}>В мокрой зоне нужен отдельный подбор гидроизоляции и финиша. Мастер предлагает только черновое выравнивание.</p> : null}
              </div> : null}
              {technicalIssue ? <p className={styles.applyHint} role="status">{technicalIssue}</p> : null}
              <button type="button" className={styles.action} disabled={!targetZones.length}
                onClick={() => onStepChange(2)}>Далее</button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h3 className={styles.cardTitle}>Какой результат нужен?</h3>
              <div className={styles.field}>
                <span>Целевой результат</span>
                <EstimateSelect value={resolvedFinish} disabled={finishDisabled}
                  options={WALL_FINISH_OPTIONS.filter((item) => state !== 'finish-only' || item.value !== 'none')}
                  ariaLabel="Целевой результат" onChange={(value) => onDraftChange({
                    finishTarget: value as WallFinishTargetOption,
                    quality: value === 'paint' && quality === 'q2' ? 'q3' : quality,
                  })} />
              </div>
              {state !== 'demolition-only' && state !== 'local-leveling' && state !== 'finish-only' && moisture !== 'wet'
                ? <div className={styles.field}>
                  <span>Качество подготовки поверхности</span>
                  <EstimateSelect value={quality} options={WALL_QUALITY_OPTIONS} ariaLabel="Категория качества стен"
                    onChange={(value) => onDraftChange({ quality: value as WallQualityOption })} />
                  <p className={styles.cardHint}>Q2–Q4 — ориентир по финишу, а не гарантия качества числом слоёв. Проверьте поверхность на объекте.</p>
                </div> : null}
              {resolvedFinish === 'paint' && state !== 'finish-only' && state !== 'local-leveling' ? <div className={styles.field}>
                <span>Нужно армирование стеклохолстом?</span>
                <EstimateSelect value={reinforce ? 'yes' : 'no'}
                  options={[{ value: 'no', label: 'Нет, не добавлять автоматически' }, { value: 'yes', label: 'Да, предусмотрено по проекту' }]}
                  ariaLabel="Армирование стен стеклохолстом" onChange={(value) => onDraftChange({ reinforce: value === 'yes' })} />
              </div> : null}
              {resolvedFinish === 'wallpaper' ? <div className={styles.field}>
                <span>Тип обоев</span>
                <EstimateSelect value={wallpaperType} options={WALL_WALLPAPER_OPTIONS} ariaLabel="Тип обоев"
                  onChange={(value) => onDraftChange({ wallpaperType: value as WallWallpaperTypeOption,
                    quality: (value === 'photo' || value === 'textile-match') && quality === 'q2' ? 'q3' : quality })} />
              </div> : null}
              {resolvedFinish === 'paint' ? <div className={styles.field}>
                <span>Покраска</span>
                <EstimateSelect value={paintLayers} options={WALL_PAINT_OPTIONS} ariaLabel="Покраска"
                  onChange={(value) => onDraftChange({ paintLayers: value as WallPaintLayersOption })} />
              </div> : null}
              {state !== 'demolition-only' ? <div className={styles.field}>
                <span>Работы на откосах · {slopesLength.toLocaleString('ru-RU')} пог. м</span>
                <EstimateSelect value={slopesLength > 0 && moisture !== 'wet' ? slopesWork : 'none'} disabled={slopesLength <= 0 || moisture === 'wet'}
                  options={WALL_SLOPES_OPTIONS} ariaLabel="Работы на откосах"
                  onChange={(value) => onDraftChange({ slopesWork: value as WallSlopesWorkOption })} />
                <p className={styles.cardHint}>{moisture === 'wet'
                  ? 'Для мокрой зоны откосы подберите отдельно по выбранной системе.'
                  : slopesLength > 0
                  ? applyToAll ? 'В общем режиме эти работы попадут только в помещения с замером откосов.'
                    : 'Работы на откосах добавятся отдельно от площади стен.'
                  : 'Откосов нет: в эту смету работы на откосах не добавятся.'}</p>
              </div> : null}
              <div className={styles.navigation}>
                <button type="button" className={styles.back} onClick={() => onStepChange(1)}>Назад</button>
                <button type="button" className={styles.action} onClick={() => onStepChange(3)}>Проверить работы</button>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h3 className={styles.cardTitle}>Что попадёт в черновик сметы</h3>
              <p className={styles.cardHint}>Только работы. Количества берутся из выбранной зоны; точные строки и суммы проверьте после добавления. Уже введённые вручную строки сохраняются.</p>
              <ul className={styles.preview}>{keys.map((key) => <li key={key}>{mappingById.get(key)?.title ?? key}</li>)}</ul>
              {existingZones.length ? <div className={styles.applyHint}>
                <p>Сценарий уже применён: {existingZones.map((zone) => `${zone.name} — ${formatWallScenarioLabel(zone.wallScenario!.application)}`).join('; ')}.</p>
                <p>Выберите действие. Ручные строки останутся; совпадающие строки сценария при любом повторном применении пересчитаются по замерам.</p>
                <div className={styles.navigation}>
                  <button type="button" className={selectedMode === 'replace' ? styles.action : styles.back}
                    aria-pressed={selectedMode === 'replace'} onClick={() => setApplyChoice({ key: choiceKey, mode: 'replace' })}>
                    Заменить прежний сценарий
                  </button>
                  <button type="button" className={selectedMode === 'add' ? styles.action : styles.back}
                    aria-pressed={selectedMode === 'add'} onClick={() => setApplyChoice({ key: choiceKey, mode: 'add' })}>
                    Добавить к существующим
                  </button>
                </div>
              </div> : null}
              {disabledHint ? <p className={styles.applyHint}>{disabledHint}</p> : null}
              <div className={styles.navigation}>
                <button type="button" className={styles.back} onClick={() => onStepChange(2)}>Назад</button>
                <button type="button" className={styles.action} disabled={!canApply} onClick={handleApply}>{applyToAll ? `Добавить работы для всех ${targetZones.length} помещений` : 'Добавить работы в смету'}</button>
              </div>
              {!applyToAll && nextPending ? <button type="button" className={styles.back}
                onClick={() => onTargetChange(nextPending.id)}>Следующее без работ: {nextPending.name}</button> : null}
            </>
          ) : null}
        </article>
        {step < 3 ? <aside className={styles.livePreview} aria-live="polite">
          <h3 className={styles.cardTitle}>Что войдёт в смету</h3>
          <p className={styles.cardHint}>Список меняется с ответами. Точные объёмы и цены проверьте после добавления.</p>
          {technicalIssue ? <p className={styles.applyHint}>Требует уточнения: {technicalIssue}</p> : null}
          {keys.length ? <ul className={styles.preview}>{keys.map((key) => <li key={key}>{mappingById.get(key)?.title ?? key}</li>)}</ul>
            : <p className={styles.cardHint}>По этим ответам пока нет работ, которые можно добавить без уточнения.</p>}
          {step === 1 && state !== 'demolition-only' && state !== 'local-leveling'
            ? <p className={styles.cardHint}>Отделку и откосы уточните на следующем шаге.</p> : null}
        </aside> : null}
      </div>
      {status ? <p className={styles.status} data-kind={status.kind} role="status" aria-live="polite">{status.message}</p> : null}
    </section>
  )
}
