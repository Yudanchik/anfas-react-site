import { formatPriceValue } from '@/entities/price/lib/price-helpers'

import styles from './FloorEstimateTotals.module.scss'

type FloorEstimateTotalsProps = {
  selectedCount: number
  totalRub: number
}

export function FloorEstimateTotals({ selectedCount, totalRub }: FloorEstimateTotalsProps) {
  return (
    <section className={styles.totals} aria-label="Итог сметы по полу">
      <div>
        <span className={styles.label}>Выбрано работ</span>
        <strong className={styles.value}>{selectedCount}</strong>
      </div>
      <div>
        <span className={styles.label}>Итог по полу</span>
        <strong className={styles.value}>{formatPriceValue(totalRub)} ₽</strong>
      </div>
      <p className={styles.note} role="status">
        Материалы пока не учитываются. Итог = сумма округлённых строк (`Math.round`) только по
        включённым работам.
      </p>
    </section>
  )
}
