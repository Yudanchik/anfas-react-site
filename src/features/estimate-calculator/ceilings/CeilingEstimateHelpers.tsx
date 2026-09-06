import { useState } from 'react'

import {
  formatCeilingQuickActionFeedback,
  type CeilingQuickActionKind,
} from './ceiling-quick-action-feedback'
import styles from './CeilingEstimateHelpers.module.scss'

type CeilingEstimateHelpersProps = {
  totalCeilingArea: number
  demolitionArea: number
  plasterArea: number
  puttyArea: number
  finishArea: number
  onApplyTotalArea: () => number
  onApplyDemolitionArea: () => number
  onApplyPlasterArea: () => number
  onApplyPuttyArea: () => number
  onApplyFinishArea: () => number
  onReset: () => void
}

export function CeilingEstimateHelpers({
  totalCeilingArea,
  demolitionArea,
  plasterArea,
  puttyArea,
  finishArea,
  onApplyTotalArea,
  onApplyDemolitionArea,
  onApplyPlasterArea,
  onApplyPuttyArea,
  onApplyFinishArea,
  onReset,
}: CeilingEstimateHelpersProps) {
  const [status, setStatus] = useState<string | null>(null)

  function runApply(kind: Exclude<CeilingQuickActionKind, 'reset'>, apply: () => number) {
    setStatus(formatCeilingQuickActionFeedback(kind, apply()))
  }

  return (
    <section className={styles.wrap} aria-labelledby="ceiling-estimate-helpers-title">
      <details className={styles.details}>
        <summary className={styles.summary} id="ceiling-estimate-helpers-title">
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
            disabled={!(totalCeilingArea > 0)}
            onClick={() => runApply('total-area', onApplyTotalArea)}
          >
            Площадь потолков → м²
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(demolitionArea > 0)}
            onClick={() => runApply('demolition-area', onApplyDemolitionArea)}
          >
            Демонтаж
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(plasterArea > 0)}
            onClick={() => runApply('plaster-area', onApplyPlasterArea)}
          >
            Штукатурка
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(puttyArea > 0)}
            onClick={() => runApply('putty-area', onApplyPuttyArea)}
          >
            Шпаклёвка
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(finishArea > 0)}
            onClick={() => runApply('finish-area', onApplyFinishArea)}
          >
            Финиш
          </button>
          <button
            type="button"
            className={styles.danger}
            aria-label="Сбросить только раздел потолки"
            title="Полы, стены и их автосохранение не затрагиваются"
            onClick={() => {
              onReset()
              setStatus(formatCeilingQuickActionFeedback('reset'))
            }}
          >
            Сбросить потолки
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
