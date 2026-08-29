import { useState } from 'react'

import {
  formatQuickActionFeedback,
  type QuickActionKind,
} from '../model/quick-action-feedback'
import styles from './FloorEstimateHelpers.module.scss'

type FloorEstimateHelpersProps = {
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
      <details className={styles.details}>
        <summary className={styles.summary} id="floor-estimate-helpers-title">
          Быстрые действия
        </summary>
        <p className={styles.text}>
          Подставляют площади в строки раздела, но не включают работы. После сценариев по зонам
          обычно нужны реже.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.action}
            disabled={!(totalFloorArea > 0)}
            onClick={() => runApply('total-area', onApplyTotalArea)}
          >
            Общая площадь → м²
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(demolitionArea > 0)}
            onClick={() => runApply('demolition-area', onApplyDemolitionArea)}
          >
            Площадь демонтажа
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(screedArea > 0)}
            onClick={() => runApply('screed-area', onApplyScreedArea)}
          >
            Площадь стяжки
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(wetZonesArea > 0)}
            onClick={() => runApply('wet-area', onApplyWetArea)}
          >
            Мокрые зоны → гидро
          </button>
          <button
            type="button"
            className={styles.danger}
            aria-label="Сбросить всю смету: полы, стены и автосохранение на этом устройстве"
            title="Сбросит полы, стены и автосохранение на этом устройстве"
            onClick={() => {
              onReset()
              setStatus(formatQuickActionFeedback('reset'))
            }}
          >
            Сбросить всю смету
          </button>
        </div>
        {status ? (
          <p className={styles.status} role="status" aria-live="polite">
            {status}
          </p>
        ) : null}
      </details>
    </section>
  )
}
