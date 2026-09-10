import { useEstimateStatusMessage } from '../model/use-estimate-status-message'
import {
  formatElectricQuickActionFeedback,
  type ElectricQuickActionKind,
} from './electric-quick-action-feedback'
import styles from './ElectricEstimateHelpers.module.scss'

type ElectricEstimateHelpersProps = {
  electricSocketsCount: number
  electricSwitchesCount: number
  electricLightPointsCount: number
  electricStrobeLength: number
  electricCableLength: number
  electricWarmFloorArea: number
  onApplySocketsCount: () => number
  onApplySwitchesCount: () => number
  onApplyLightPointsCount: () => number
  onApplyStrobeLength: () => number
  onApplyCableLength: () => number
  onApplyWarmFloorArea: () => number
  onReset: () => void
}

export function ElectricEstimateHelpers({
  electricSocketsCount,
  electricSwitchesCount,
  electricLightPointsCount,
  electricStrobeLength,
  electricCableLength,
  electricWarmFloorArea,
  onApplySocketsCount,
  onApplySwitchesCount,
  onApplyLightPointsCount,
  onApplyStrobeLength,
  onApplyCableLength,
  onApplyWarmFloorArea,
  onReset,
}: ElectricEstimateHelpersProps) {
  const { status, setSuccess } = useEstimateStatusMessage()

  function runApply(kind: Exclude<ElectricQuickActionKind, 'reset'>, apply: () => number) {
    setSuccess(formatElectricQuickActionFeedback(kind, apply()))
  }

  return (
    <section className={styles.wrap} aria-labelledby="electric-estimate-helpers-title">
      <details className={styles.details}>
        <summary className={styles.summary} id="electric-estimate-helpers-title">
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
            disabled={!(electricSocketsCount > 0)}
            onClick={() => runApply('sockets', onApplySocketsCount)}
          >
            Розетки
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(electricSwitchesCount > 0)}
            onClick={() => runApply('switches', onApplySwitchesCount)}
          >
            Выключатели
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(electricLightPointsCount > 0)}
            onClick={() => runApply('lights', onApplyLightPointsCount)}
          >
            Свет
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(electricStrobeLength > 0)}
            onClick={() => runApply('strobe', onApplyStrobeLength)}
          >
            Штробы
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(electricCableLength > 0)}
            onClick={() => runApply('cable', onApplyCableLength)}
          >
            Кабель
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(electricWarmFloorArea > 0)}
            onClick={() => runApply('warm-floor', onApplyWarmFloorArea)}
          >
            Тёплый пол
          </button>
          <button
            type="button"
            className={styles.danger}
            aria-label="Сбросить только раздел электрика"
            title="Другие разделы и их автосохранение не затрагиваются"
            onClick={() => {
              onReset()
              setSuccess(formatElectricQuickActionFeedback('reset'))
            }}
          >
            Сбросить электрику
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
