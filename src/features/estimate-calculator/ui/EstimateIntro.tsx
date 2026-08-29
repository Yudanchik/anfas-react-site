import { formatEstimatePositionCount } from '@/entities/estimate'
import { formatPriceValue } from '@/entities/price/lib/price-helpers'

import styles from './EstimateIntro.module.scss'

type EstimateIntroProps = {
  floorsSelectedCount: number
  wallsSelectedCount: number
  floorsTotalRub: number
  wallsTotalRub: number
  grandTotalRub: number
  floorsMappingCount: number
  wallsMappingCount: number
}

export function EstimateIntro({
  floorsSelectedCount,
  wallsSelectedCount,
  floorsTotalRub,
  wallsTotalRub,
  grandTotalRub,
  floorsMappingCount,
  wallsMappingCount,
}: EstimateIntroProps) {
  const selectedCount = floorsSelectedCount + wallsSelectedCount

  return (
    <section className={styles.intro} aria-labelledby="estimate-calculator-title">
      <p className={styles.eyebrow}>Внутренний инструмент</p>
      <h1 className={styles.title} id="estimate-calculator-title">
        Калькулятор сметы
        <br />
        <em>полы и стены</em>
      </h1>
      <p className={styles.lead}>
        Быстрый черновик для сметчика: сценарии подставляют типовой набор, все строки остаются
        видимыми и редактируемыми.
      </p>

      <p className={styles.warning} role="status">
        Материалы пока не учитываются — в итоге только стоимость работ.
      </p>

      <dl className={styles.stats}>
        <div>
          <dt>Позиций (полы / стены)</dt>
          <dd>
            {floorsMappingCount} / {wallsMappingCount}
          </dd>
        </div>
        <div>
          <dt>Выбрано</dt>
          <dd>{selectedCount}</dd>
        </div>
        <div>
          <dt>Итог</dt>
          <dd>{formatPriceValue(grandTotalRub)} ₽</dd>
        </div>
      </dl>

      <aside className={styles.sections} aria-label="Сводка по разделам">
        <span className={styles.sectionsLabel}>Разделы</span>
        <ul className={styles.sectionsList}>
          <li
            className={styles.sectionCard}
            data-active={floorsSelectedCount > 0 ? 'true' : 'false'}
          >
            <span className={styles.sectionName}>Полы</span>
            <span className={styles.sectionMeta}>
              {formatEstimatePositionCount(floorsSelectedCount)} ·{' '}
              {formatPriceValue(floorsTotalRub)} ₽
            </span>
          </li>
          <li
            className={styles.sectionCard}
            data-active={wallsSelectedCount > 0 ? 'true' : 'false'}
          >
            <span className={styles.sectionName}>Стены</span>
            <span className={styles.sectionMeta}>
              {formatEstimatePositionCount(wallsSelectedCount)} ·{' '}
              {formatPriceValue(wallsTotalRub)} ₽
            </span>
          </li>
        </ul>
      </aside>
    </section>
  )
}
