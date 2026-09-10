import { formatEstimatePositionCount } from '@/entities/estimate'
import { formatPriceValue } from '@/entities/price/lib/price-helpers'

import styles from './EstimateIntro.module.scss'

type EstimateIntroProps = {
  floorsSelectedCount: number
  wallsSelectedCount: number
  ceilingsSelectedCount: number
  tileSelectedCount: number
  electricsSelectedCount: number
  plumbingSelectedCount: number
  floorsTotalRub: number
  wallsTotalRub: number
  ceilingsTotalRub: number
  tileTotalRub: number
  electricsTotalRub: number
  plumbingTotalRub: number
  grandTotalRub: number
  floorsMappingCount: number
  wallsMappingCount: number
  ceilingsMappingCount: number
  tileMappingCount: number
  electricsMappingCount: number
  plumbingMappingCount: number
}

export function EstimateIntro({
  floorsSelectedCount,
  wallsSelectedCount,
  ceilingsSelectedCount,
  tileSelectedCount,
  electricsSelectedCount,
  plumbingSelectedCount,
  floorsTotalRub,
  wallsTotalRub,
  ceilingsTotalRub,
  tileTotalRub,
  electricsTotalRub,
  plumbingTotalRub,
  grandTotalRub,
  floorsMappingCount,
  wallsMappingCount,
  ceilingsMappingCount,
  tileMappingCount,
  electricsMappingCount,
  plumbingMappingCount,
}: EstimateIntroProps) {
  const selectedCount =
    floorsSelectedCount +
    wallsSelectedCount +
    ceilingsSelectedCount +
    tileSelectedCount +
    electricsSelectedCount +
    plumbingSelectedCount

  return (
    <section className={styles.intro} aria-labelledby="estimate-calculator-title">
      <p className={styles.eyebrow}>Внутренний инструмент</p>
      <h1 className={styles.title} id="estimate-calculator-title">
        Калькулятор сметы
        <br />
        <em>полы, стены, потолки, плитка, электрика и сантехника</em>
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
          <dt>Позиций (полы / стены / потолки / плитка / электрика / сантехника)</dt>
          <dd>
            {floorsMappingCount} / {wallsMappingCount} / {ceilingsMappingCount} /{' '}
            {tileMappingCount} / {electricsMappingCount} / {plumbingMappingCount}
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
          <li
            className={styles.sectionCard}
            data-active={ceilingsSelectedCount > 0 ? 'true' : 'false'}
          >
            <span className={styles.sectionName}>Потолки</span>
            <span className={styles.sectionMeta}>
              {formatEstimatePositionCount(ceilingsSelectedCount)} ·{' '}
              {formatPriceValue(ceilingsTotalRub)} ₽
            </span>
          </li>
          <li
            className={styles.sectionCard}
            data-active={tileSelectedCount > 0 ? 'true' : 'false'}
          >
            <span className={styles.sectionName}>Плитка</span>
            <span className={styles.sectionMeta}>
              {formatEstimatePositionCount(tileSelectedCount)} ·{' '}
              {formatPriceValue(tileTotalRub)} ₽
            </span>
          </li>
          <li
            className={styles.sectionCard}
            data-active={electricsSelectedCount > 0 ? 'true' : 'false'}
          >
            <span className={styles.sectionName}>Электрика</span>
            <span className={styles.sectionMeta}>
              {formatEstimatePositionCount(electricsSelectedCount)} ·{' '}
              {formatPriceValue(electricsTotalRub)} ₽
            </span>
          </li>
          <li
            className={styles.sectionCard}
            data-active={plumbingSelectedCount > 0 ? 'true' : 'false'}
          >
            <span className={styles.sectionName}>Сантехника</span>
            <span className={styles.sectionMeta}>
              {formatEstimatePositionCount(plumbingSelectedCount)} ·{' '}
              {formatPriceValue(plumbingTotalRub)} ₽
            </span>
          </li>
        </ul>
      </aside>
    </section>
  )
}
