import { formatPriceValue } from '@/entities/price/lib/price-helpers'

import type { SelectedEstimateLineView } from '../model/get-selected-estimate-lines'
import styles from './FloorEstimateSummary.module.scss'

type FloorEstimateSummaryLineProps = {
  item: SelectedEstimateLineView
}

export function FloorEstimateSummaryLine({ item }: FloorEstimateSummaryLineProps) {
  const { line, groupTitle, lineTotal } = item
  const showCoefficient = line.coefficient !== 1

  return (
    <li className={styles.item}>
      <div className={styles.itemMain}>
        <span className={styles.group}>{groupTitle}</span>
        <span className={styles.work}>{line.title}</span>
      </div>
      <div className={styles.itemMeta}>
        <span>
          {line.quantity} {line.unit}
        </span>
        <span>× {formatPriceValue(line.unitPrice)} ₽</span>
        {showCoefficient ? <span>× коэф. {line.coefficient}</span> : null}
        <strong className={styles.itemTotal}>{formatPriceValue(lineTotal)} ₽</strong>
      </div>
      {line.comment ? <p className={styles.comment}>{line.comment}</p> : null}
    </li>
  )
}
