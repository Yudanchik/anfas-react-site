import { useState } from 'react'

import {
  formatWallQuickActionFeedback,
  type WallQuickActionKind,
} from './wall-quick-action-feedback'
import styles from './WallEstimateHelpers.module.scss'

type WallEstimateHelpersProps = {
  totalWallArea: number
  demolitionArea: number
  plasterArea: number
  puttyArea: number
  finishArea: number
  slopesLengthM: number
  cornersLengthM: number
  onApplyTotalArea: () => number
  onApplyDemolitionArea: () => number
  onApplyPlasterArea: () => number
  onApplyPuttyArea: () => number
  onApplyFinishArea: () => number
  onApplyLinearMeters: () => number
  onReset: () => void
}

export function WallEstimateHelpers({
  totalWallArea,
  demolitionArea,
  plasterArea,
  puttyArea,
  finishArea,
  slopesLengthM,
  cornersLengthM,
  onApplyTotalArea,
  onApplyDemolitionArea,
  onApplyPlasterArea,
  onApplyPuttyArea,
  onApplyFinishArea,
  onApplyLinearMeters,
  onReset,
}: WallEstimateHelpersProps) {
  const [status, setStatus] = useState<string | null>(null)

  function runApply(kind: Exclude<WallQuickActionKind, 'reset'>, apply: () => number) {
    setStatus(formatWallQuickActionFeedback(kind, apply()))
  }

  return (
    <section className={styles.wrap} aria-labelledby="wall-estimate-helpers-title">
      <div className={styles.copy}>
        <h2 className={styles.title} id="wall-estimate-helpers-title">
          Быстрые действия
        </h2>
        <p className={styles.text}>
          Кнопки подставляют площади из параметров замера в подходящие строки сметы. Работы сами не
          включаются.
        </p>
      </div>

      <div className={styles.actionsPanel}>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.action}
            disabled={!(totalWallArea > 0)}
            onClick={() => runApply('total-area', onApplyTotalArea)}
          >
            Площадь стен → м²
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
            className={styles.action}
            disabled={!(slopesLengthM > 0 || cornersLengthM > 0)}
            onClick={() => runApply('linear', onApplyLinearMeters)}
          >
            Откосы / углы
          </button>
        </div>

        <button
          type="button"
          className={styles.danger}
          aria-label="Сбросить только раздел стены"
          title="Полы и их автосохранение не затрагиваются"
          onClick={() => {
            onReset()
            setStatus(formatWallQuickActionFeedback('reset'))
          }}
        >
          Сбросить стены
        </button>

        {status ? (
          <p className={styles.status} role="status" aria-live="polite">
            {status}
          </p>
        ) : null}
      </div>
    </section>
  )
}
