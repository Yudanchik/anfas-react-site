import { useMemo } from 'react'

import type { EstimateLine } from '@/entities/estimate'
import { formatPriceValue } from '@/entities/price/lib/price-helpers'

import { getSelectedFloorEstimateLines } from '../model/get-selected-estimate-lines'
import { FloorEstimateSummaryLine } from './FloorEstimateSummaryLine'
import styles from './FloorEstimateSummary.module.scss'

type FloorEstimateSummaryProps = {
  lines: readonly EstimateLine[]
  totalRub: number
}

export function FloorEstimateSummary({ lines, totalRub }: FloorEstimateSummaryProps) {
  const selectedLines = useMemo(() => getSelectedFloorEstimateLines(lines), [lines])

  return (
    <section className={styles.wrap} aria-labelledby="floor-estimate-summary-title">
      <div className={styles.head}>
        <h2 className={styles.title} id="floor-estimate-summary-title">
          Итоговая смета
        </h2>
        <p className={styles.lead}>Состав только по включённым работам.</p>
      </div>

      {selectedLines.length === 0 ? (
        <p className={styles.empty} role="status">
          Включите работы или примените сценарий.
        </p>
      ) : (
        <ul className={styles.list}>
          {selectedLines.map((item) => (
            <FloorEstimateSummaryLine key={item.line.id} item={item} />
          ))}
        </ul>
      )}

      <div className={styles.footer}>
        <div className={styles.stat}>
          <span className={styles.label}>Строк в итоге</span>
          <strong className={styles.value}>{selectedLines.length}</strong>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Итог по полу</span>
          <strong className={styles.value}>{formatPriceValue(totalRub)} ₽</strong>
        </div>
        <p className={styles.note} role="status">
          Материалы пока не учитываются.
        </p>
      </div>
    </section>
  )
}
