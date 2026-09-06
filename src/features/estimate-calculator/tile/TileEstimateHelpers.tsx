import { useEstimateStatusMessage } from '../model/use-estimate-status-message'
import {
  formatTileQuickActionFeedback,
  type TileQuickActionKind,
} from './tile-quick-action-feedback'
import styles from './TileEstimateHelpers.module.scss'

type TileEstimateHelpersProps = {
  floorTileArea: number
  wallTileArea: number
  backsplashArea: number
  cuttingLength: number
  holesCount: number
  onApplyCladArea: () => number
  onApplyFloorArea: () => number
  onApplyWallArea: () => number
  onApplyCuttingLength: () => number
  onApplyHolesCount: () => number
  onReset: () => void
}

export function TileEstimateHelpers({
  floorTileArea,
  wallTileArea,
  backsplashArea,
  cuttingLength,
  holesCount,
  onApplyCladArea,
  onApplyFloorArea,
  onApplyWallArea,
  onApplyCuttingLength,
  onApplyHolesCount,
  onReset,
}: TileEstimateHelpersProps) {
  const { status, setSuccess } = useEstimateStatusMessage()
  const cladArea = floorTileArea + wallTileArea + backsplashArea

  function runApply(kind: Exclude<TileQuickActionKind, 'reset'>, apply: () => number) {
    setSuccess(formatTileQuickActionFeedback(kind, apply()))
  }

  return (
    <section className={styles.wrap} aria-labelledby="tile-estimate-helpers-title">
      <details className={styles.details}>
        <summary className={styles.summary} id="tile-estimate-helpers-title">
          Быстрые действия
        </summary>
        <p className={styles.text}>
          Подставляют объёмы в строки раздела, но не включают работы. Гидроизоляция — через раздел
          «Полы». После сценариев по зонам обычно нужны реже.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.action}
            disabled={!(cladArea > 0)}
            onClick={() => runApply('clad-area', onApplyCladArea)}
          >
            Облицовка → м²
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(floorTileArea > 0)}
            onClick={() => runApply('floor-area', onApplyFloorArea)}
          >
            Пол (демонтаж)
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(wallTileArea > 0)}
            onClick={() => runApply('wall-area', onApplyWallArea)}
          >
            Стены (демонтаж)
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(cuttingLength > 0)}
            onClick={() => runApply('cutting-length', onApplyCuttingLength)}
          >
            Подрезка
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!(holesCount > 0)}
            onClick={() => runApply('holes-count', onApplyHolesCount)}
          >
            Отверстия
          </button>
          <button
            type="button"
            className={styles.danger}
            aria-label="Сбросить только раздел плитка"
            title="Полы, стены, потолки и их автосохранение не затрагиваются"
            onClick={() => {
              onReset()
              setSuccess(formatTileQuickActionFeedback('reset'))
            }}
          >
            Сбросить плитку
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
