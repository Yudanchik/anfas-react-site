import { useState } from 'react'

import {
  formatWallScenarioFeedback,
  type WallDemolitionCoveringOption,
  type WallFinishTargetOption,
  type WallPaintLayersOption,
  type WallScenarioApplication,
  type WallStateOption,
  type WallWallpaperTypeOption,
} from '@/entities/estimate'

import type { WallScenarioDraftState } from '../model/estimate-calculator-persistence'
import styles from './WallEstimateScenarios.module.scss'

type WallEstimateScenariosProps = {
  draft: WallScenarioDraftState
  onDraftChange: (patch: Partial<WallScenarioDraftState>) => void
  onApplyScenario: (application: WallScenarioApplication) => {
    label: string
    addedCount: number
  }
}

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
  onApplyScenario,
}: WallEstimateScenariosProps) {
  const { state, finishTarget, demolitionCovering, wallpaperType, paintLayers } = draft
  const [status, setStatus] = useState<string | null>(null)

  const finishDisabled = state === 'demolition-only' || state === 'local-leveling'
  const needsFinishChoice = state === 'finish-only'
  const showDemolitionCovering = state === 'demolition-only'
  const showWallpaperType = finishTarget === 'wallpaper' && !finishDisabled
  const showPaintLayers = finishTarget === 'paint' && !finishDisabled

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

    const result = onApplyScenario(application)
    setStatus(formatWallScenarioFeedback(result.label, result.addedCount))
  }

  return (
    <section className={styles.wrap} aria-labelledby="wall-estimate-scenarios-title">
      <div className={styles.head}>
        <h2 className={styles.title} id="wall-estimate-scenarios-title">
          Сценарий стен
        </h2>
        <p className={styles.lead}>
          Быстрый черновик: состояние × результат. Строки остаются видимыми и редактируемыми.
        </p>
      </div>

      <div className={styles.grid}>
        <article className={`${styles.card} ${styles.cardAccent}`}>
          <div className={styles.cardTop}>
            <h3 className={styles.cardTitle}>Параметры сценария</h3>
            <span className={styles.badge}>Черновик</span>
          </div>

          <label className={styles.field}>
            <span>Состояние стен</span>
            <select
              className={styles.select}
              value={state}
              onChange={(event) => {
                const next = event.target.value as WallStateOption
                const patch: Partial<WallScenarioDraftState> = { state: next }
                if (next === 'demolition-only' || next === 'local-leveling') {
                  patch.finishTarget = 'none'
                }
                if (next === 'finish-only' && finishTarget === 'none') {
                  patch.finishTarget = 'paint'
                }
                onDraftChange(patch)
              }}
            >
              {STATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Целевой результат</span>
            <select
              className={styles.select}
              value={finishDisabled ? 'none' : finishTarget}
              disabled={finishDisabled}
              onChange={(event) =>
                onDraftChange({ finishTarget: event.target.value as WallFinishTargetOption })
              }
            >
              {FINISH_OPTIONS.filter((option) =>
                needsFinishChoice ? option.value !== 'none' : true,
              ).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {showDemolitionCovering ? (
            <label className={styles.field}>
              <span>Что демонтируем</span>
              <select
                className={styles.select}
                value={demolitionCovering}
                onChange={(event) =>
                  onDraftChange({
                    demolitionCovering: event.target.value as WallDemolitionCoveringOption,
                  })
                }
              >
                {DEMOLITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {showWallpaperType ? (
            <label className={styles.field}>
              <span>Тип обоев</span>
              <select
                className={styles.select}
                value={wallpaperType}
                onChange={(event) =>
                  onDraftChange({ wallpaperType: event.target.value as WallWallpaperTypeOption })
                }
              >
                {WALLPAPER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {showPaintLayers ? (
            <label className={styles.field}>
              <span>Покраска</span>
              <select
                className={styles.select}
                value={paintLayers}
                onChange={(event) =>
                  onDraftChange({ paintLayers: event.target.value as WallPaintLayersOption })
                }
              >
                {PAINT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
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
