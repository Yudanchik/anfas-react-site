import type { FloorRecommendation } from '@/entities/estimate'
import { formatPriceValue } from '@/entities/price/lib/price-helpers'

import styles from './FloorEstimateIntro.module.scss'

type FloorEstimateIntroProps = {
  availableWorksCount: number
  recommendation: FloorRecommendation
  selectedCount: number
  totalRub: number
}

export function FloorEstimateIntro({
  availableWorksCount,
  recommendation,
  selectedCount,
  totalRub,
}: FloorEstimateIntroProps) {
  return (
    <section className={styles.intro} aria-labelledby="floor-estimate-title">
      <p className={styles.eyebrow}>Внутренний инструмент</p>
      <h1 className={styles.title} id="floor-estimate-title">
        Калькулятор сметы
        <br />
        <em>черновые полы</em>
      </h1>
      <p className={styles.lead}>
        Рабочий расчёт для сметчика: демонтаж, подготовка основания, стяжка, наливной пол и
        гидроизоляция мокрых зон. Цены берутся из утверждённого floor mapping (PDF + сверка с
        превью сайта).
      </p>

      <p className={styles.warning} role="status">
        Материалы пока не учитываются — в итоге только стоимость работ.
      </p>

      <dl className={styles.stats}>
        <div>
          <dt>Позиций в mapping</dt>
          <dd>{availableWorksCount}</dd>
        </div>
        <div>
          <dt>Выбрано работ</dt>
          <dd>{selectedCount}</dd>
        </div>
        <div>
          <dt>Итог по полу</dt>
          <dd>{formatPriceValue(totalRub)} ₽</dd>
        </div>
      </dl>

      <aside className={styles.recommendation} aria-label="Рекомендация по перепаду">
        <span className={styles.recommendationLabel}>Рекомендация</span>
        <p className={styles.recommendationText}>{recommendation.message}</p>
        <p className={styles.recommendationHint}>
          Подсказки не включают работы автоматически — строки включает сметчик вручную.
        </p>
      </aside>
    </section>
  )
}
