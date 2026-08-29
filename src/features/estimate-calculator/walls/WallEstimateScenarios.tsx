import { useMemo, useState } from 'react'

import {
  ESTIMATE_GENERAL_WORKS_TITLE,
  formatWallScenarioFeedback,
  formatWallScenarioZoneFeedback,
  type EstimateZone,
  type WallDemolitionCoveringOption,
  type WallFinishTargetOption,
  type WallPaintLayersOption,
  type WallScenarioApplication,
  type WallStateOption,
  type WallWallpaperTypeOption,
} from '@/entities/estimate'

import type { WallScenarioDraftState } from '../model/estimate-calculator-persistence'
import { EstimateSelect } from '../ui/EstimateSelect'
import styles from './WallEstimateScenarios.module.scss'

type WallEstimateScenariosProps = {
  draft: WallScenarioDraftState
  onDraftChange: (patch: Partial<WallScenarioDraftState>) => void
  zones?: readonly EstimateZone[]
  onApplyScenario: (
    application: WallScenarioApplication,
    target?: { zone?: EstimateZone },
  ) => {
    label: string
    addedCount: number
    zoneName?: string
  }
}

const GENERAL_TARGET = 'general'

const STATE_OPTIONS: ReadonlyArray<{ value: WallStateOption; label: string }> = [
  { value: 'from-scratch', label: 'С нуля' },
  { value: 'after-demolition', label: 'После демонтажа' },
  { value: 'prefinish', label: 'Предчистовая' },
  { value: 'local-leveling', label: 'Локальное выравнивание' },
  { value: 'demolition-only', label: 'Только демонтаж' },
  { value: 'finish-only', label: 'Только финиш' },
]

const FINISH_OPTIONS: ReadonlyArray<{ value: WallFinishTargetOption; label: string }> = [
  { value: 'none', label: 'Без финиша' },
  { value: 'wallpaper', label: 'Под обои' },
  { value: 'paint', label: 'Под покраску' },
]

const DEMOLITION_OPTIONS: ReadonlyArray<{ value: WallDemolitionCoveringOption; label: string }> = [
  { value: 'wallpaper', label: 'Обои' },
  { value: 'paint', label: 'Краска' },
  { value: 'plaster', label: 'Штукатурка' },
  { value: 'wall-tile', label: 'Плитка стеновая' },
  { value: 'glassfiber', label: 'Стеклохолст' },
]

const WALLPAPER_OPTIONS: ReadonlyArray<{ value: WallWallpaperTypeOption; label: string }> = [
  { value: 'flizelin', label: 'Флизелин без подбора' },
  { value: 'vinyl-match', label: 'Винил с подбором' },
  { value: 'photo', label: 'Фотообои' },
  { value: 'textile-match', label: 'Тканевые с подбором' },
]

const PAINT_OPTIONS: ReadonlyArray<{ value: WallPaintLayersOption; label: string }> = [
  { value: 'paint-2', label: 'Валик, 2 слоя' },
  { value: 'paint-1', label: 'Валик, 1 слой' },
  { value: 'paint-3', label: 'Валик, 3 слоя' },
  { value: 'paint-mech-2', label: 'Механизированная, 2 слоя' },
]

export function WallEstimateScenarios({
  draft,
  onDraftChange,
  zones = [],
  onApplyScenario,
}: WallEstimateScenariosProps) {
  const { state, finishTarget, demolitionCovering, wallpaperType, paintLayers } = draft
  const [targetId, setTargetId] = useState(GENERAL_TARGET)
  const [status, setStatus] = useState<string | null>(null)

  const finishDisabled = state === 'demolition-only' || state === 'local-leveling'
  const needsFinishChoice = state === 'finish-only'
  const showDemolitionCovering = state === 'demolition-only'
  const showWallpaperType = finishTarget === 'wallpaper' && !finishDisabled
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

  function handleApply() {
    const resolvedFinish: WallFinishTargetOption = finishDisabled
      ? 'none'
      : needsFinishChoice && finishTarget === 'none'
        ? 'paint'
        : finishTarget

    const application: WallScenarioApplication = {
      state,
      finishTarget: resolvedFinish,
      demolitionCovering: showDemolitionCovering ? demolitionCovering : undefined,
      wallpaperType: resolvedFinish === 'wallpaper' ? wallpaperType : undefined,
      paintLayers: resolvedFinish === 'paint' ? paintLayers : undefined,
    }

    const result = onApplyScenario(
      application,
      selectedZone ? { zone: selectedZone } : undefined,
    )
    setStatus(
      result.zoneName
        ? formatWallScenarioZoneFeedback(result.label, result.zoneName, result.addedCount)
        : formatWallScenarioFeedback(result.label, result.addedCount),
    )
  }

  return (
    <section className={styles.wrap} aria-labelledby="wall-estimate-scenarios-title">
      <div className={styles.head}>
        <h2 className={styles.title} id="wall-estimate-scenarios-title">
          Сценарий стен
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
          ariaLabel="Применить сценарий стен к"
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
            <span>Состояние стен</span>
            <EstimateSelect
              value={state}
              options={STATE_OPTIONS}
              ariaLabel="Состояние стен"
              onChange={(nextValue) => {
                const next = nextValue as WallStateOption
                const patch: Partial<WallScenarioDraftState> = { state: next }
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
                onDraftChange({ finishTarget: next as WallFinishTargetOption })
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
                    demolitionCovering: next as WallDemolitionCoveringOption,
                  })
                }
              />
            </div>
          ) : null}

          {showWallpaperType ? (
            <div className={styles.field}>
              <span>Тип обоев</span>
              <EstimateSelect
                value={wallpaperType}
                options={WALLPAPER_OPTIONS}
                ariaLabel="Тип обоев"
                onChange={(next) =>
                  onDraftChange({ wallpaperType: next as WallWallpaperTypeOption })
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
                  onDraftChange({ paintLayers: next as WallPaintLayersOption })
                }
              />
            </div>
          ) : null}

          <button type="button" className={styles.action} onClick={handleApply}>
            Применить сценарий
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
