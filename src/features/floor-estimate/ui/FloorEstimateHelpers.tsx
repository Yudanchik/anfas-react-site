import type { FloorRecommendation } from '@/entities/estimate'

import styles from './FloorEstimateHelpers.module.scss'

type FloorEstimateHelpersProps = {
  recommendation: FloorRecommendation
  onApplyTotalArea: () => void
  onApplyDemolitionArea: () => void
  onApplyScreedArea: () => void
  onApplyWetArea: () => void
  onReset: () => void
}

export function FloorEstimateHelpers({
  recommendation,
  onApplyTotalArea,
  onApplyDemolitionArea,
  onApplyScreedArea,
  onApplyWetArea,
  onReset,
}: FloorEstimateHelpersProps) {
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
        {recommendation.suggestedPriceKeys.length > 0 ? (
          <p className={styles.keys}>
            Подсказка ключей: {recommendation.suggestedPriceKeys.join(', ')}
          </p>
        ) : null}
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onApplyTotalArea}>
          Применить общую площадь к м²
        </button>
        <button type="button" onClick={onApplyDemolitionArea}>
          Применить площадь демонтажа
        </button>
        <button type="button" onClick={onApplyScreedArea}>
          Применить площадь стяжки
        </button>
        <button type="button" onClick={onApplyWetArea}>
          Применить мокрые зоны к гидроизоляции
        </button>
        <button type="button" className={styles.reset} onClick={onReset}>
          Сбросить смету
        </button>
      </div>
    </section>
  )
}
