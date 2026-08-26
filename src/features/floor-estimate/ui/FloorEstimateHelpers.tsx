import { useState } from 'react'

import type { FloorRecommendation } from '@/entities/estimate'

import {
  formatQuickActionFeedback,
  type QuickActionKind,
} from '../model/quick-action-feedback'
import styles from './FloorEstimateHelpers.module.scss'

type FloorEstimateHelpersProps = {
  recommendation: FloorRecommendation
  totalFloorArea: number
  demolitionArea: number
  screedArea: number
  wetZonesArea: number
  onApplyTotalArea: () => number
  onApplyDemolitionArea: () => number
  onApplyScreedArea: () => number
  onApplyWetArea: () => number
  onReset: () => void
}

export function FloorEstimateHelpers({
  recommendation,
  totalFloorArea,
  demolitionArea,
  screedArea,
  wetZonesArea,
  onApplyTotalArea,
  onApplyDemolitionArea,
  onApplyScreedArea,
  onApplyWetArea,
  onReset,
}: FloorEstimateHelpersProps) {
  const [status, setStatus] = useState<string | null>(null)

  function runApply(kind: Exclude<QuickActionKind, 'reset'>, apply: () => number) {
    setStatus(formatQuickActionFeedback(kind, apply()))
  }

  return (
    <section className={styles.wrap} aria-labelledby="floor-estimate-helpers-title">
      <div className={styles.copy}>
        <h2 className={styles.title} id="floor-estimate-helpers-title">
          Быстрые действия и рекомендация
        </h2>
        <p className={styles.text}>{recommendation.message}</p>
        <p className={styles.hint}>
          Рекомендация не включает строки автоматически. Кнопки только подставляют объёмы.
        </p>
      </div>

      <div className={styles.actionsPanel}>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.action}
            disabled={!(totalFloorArea > 0)}
            onClick={() => runApply('total-area', onApplyTotalArea)}
          >
            Применить общую площадь к м²
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(demolitionArea > 0)}
            onClick={() => runApply('demolition-area', onApplyDemolitionArea)}
          >
            Применить площадь демонтажа
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(screedArea > 0)}
            onClick={() => runApply('screed-area', onApplyScreedArea)}
          >
            Применить площадь стяжки
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(wetZonesArea > 0)}
            onClick={() => runApply('wet-area', onApplyWetArea)}
          >
            Применить мокрые зоны к гидроизоляции
          </button>
        </div>

        <button
          type="button"
          className={styles.danger}
          onClick={() => {
            onReset()
            setStatus(formatQuickActionFeedback('reset'))
          }}
        >
          Сбросить смету
        </button>

        <p className={styles.status} role="status" aria-live="polite">
          {status ?? '\u00a0'}
        </p>
      </div>
    </section>
  )
}
