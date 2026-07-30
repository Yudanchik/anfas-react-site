import type { PricePosition } from '@/entities/price/model/price.types'
import { formatPriceValue } from '@/entities/price/lib/price-helpers'
import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'

import styles from './PricesPreviewTable.module.scss'

type PricesPreviewTableProps = {
  positions: readonly PricePosition[]
}

export function PricesPreviewTable({ positions }: PricesPreviewTableProps) {
  if (positions.length === 0) {
    return null
  }

  return (
    <table className={styles.table}>
      <thead className={styles.head}>
        <tr>
          <th scope="col">Услуга</th>
          <th scope="col">Ед. изм.</th>
          <th scope="col">Цена</th>
        </tr>
      </thead>
      <tbody>
        {positions.map((position) => (
          <tr className={styles.row} key={position.name}>
            <td className={styles.cellName} data-label="Услуга">
              <span>{tieRussianShortWords(position.name)}</span>
              {position.note ? <em>{tieRussianShortWords(position.note)}</em> : null}
            </td>
            <td data-label="Ед. изм.">{position.unit}</td>
            <td className={styles.cellPrice} data-label="Цена">
              от {formatPriceValue(position.priceFrom)} ₽
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
