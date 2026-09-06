import { useEstimateStatusMessage } from '../model/use-estimate-status-message'
import {
  formatPlumbingQuickActionFeedback,
  type PlumbingQuickActionKind,
} from './plumbing-quick-action-feedback'
import styles from './PlumbingEstimateHelpers.module.scss'

type PlumbingEstimateHelpersProps = {
  plumbingWaterPipeLength: number
  plumbingSewerPipeLength: number
  plumbingWaterPointsCount: number
  plumbingSewerPointsCount: number
  plumbingWarmFloorArea: number
  onApplyWaterPipeLength: () => number
  onApplySewerPipeLength: () => number
  onApplyWaterPointsCount: () => number
  onApplySewerPointsCount: () => number
  onApplyWarmFloorArea: () => number
  onReset: () => void
}

export function PlumbingEstimateHelpers({
  plumbingWaterPipeLength,
  plumbingSewerPipeLength,
  plumbingWaterPointsCount,
  plumbingSewerPointsCount,
  plumbingWarmFloorArea,
  onApplyWaterPipeLength,
  onApplySewerPipeLength,
  onApplyWaterPointsCount,
  onApplySewerPointsCount,
  onApplyWarmFloorArea,
  onReset,
}: PlumbingEstimateHelpersProps) {
  const { status, setSuccess } = useEstimateStatusMessage()

  function runApply(kind: Exclude<PlumbingQuickActionKind, 'reset'>, apply: () => number) {
    setSuccess(formatPlumbingQuickActionFeedback(kind, apply()))
  }

  return (
    <section className={styles.wrap} aria-labelledby="plumbing-estimate-helpers-title">
      <details className={styles.details}>
        <summary className={styles.summary} id="plumbing-estimate-helpers-title">
          Быстрые действия
        </summary>
        <p className={styles.text}>
          Подставляют количества в строки раздела, но не включают работы. Материалы не считаются.
          После сценариев по зонам обычно нужны реже.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.action}
            disabled={!(plumbingWaterPipeLength > 0)}
            onClick={() => runApply('water-pipe', onApplyWaterPipeLength)}
          >
            Трубы воды
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(plumbingSewerPipeLength > 0)}
            onClick={() => runApply('sewer-pipe', onApplySewerPipeLength)}
          >
            Канализация
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(plumbingWaterPointsCount > 0)}
            onClick={() => runApply('water-points', onApplyWaterPointsCount)}
          >
            Водорозетки
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(plumbingSewerPointsCount > 0)}
            onClick={() => runApply('sewer-points', onApplySewerPointsCount)}
          >
            Выводы канализации
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(plumbingWarmFloorArea > 0)}
            onClick={() => runApply('warm-floor', onApplyWarmFloorArea)}
          >
            Тёплый пол
          </button>
          <button
            type="button"
            className={styles.danger}
            aria-label="Сбросить только раздел сантехника"
            title="Другие разделы и их автосохранение не затрагиваются"
            onClick={() => {
              onReset()
              setSuccess(formatPlumbingQuickActionFeedback('reset'))
            }}
          >
            Сбросить сантехнику
          </button>
        </div>
        {status ? (
          <p className={styles.status} data-kind={status.kind} role="status" aria-live="polite">
            {status.message}
          </p>
        ) : null}
      </details>
    </section>
  )
}
