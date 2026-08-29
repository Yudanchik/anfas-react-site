import type { EstimateLine } from '@/entities/estimate'
import { calculateLineTotal } from '@/entities/estimate'
import { formatPriceValue } from '@/entities/price/lib/price-helpers'

import { EstimateNumberInput } from './EstimateNumberInput'
import styles from './EstimateGroupedTable.module.scss'

type EstimateLineRowProps = {
  line: EstimateLine
  onToggle: (lineId: string) => void
  onPatchLine: (
    lineId: string,
    patch: Partial<Pick<EstimateLine, 'quantity' | 'unitPrice' | 'coefficient' | 'comment'>>,
  ) => void
}

export function EstimateLineRow({ line, onToggle, onPatchLine }: EstimateLineRowProps) {
  const total = calculateLineTotal(line)

  return (
    <tr data-enabled={line.enabled ? 'true' : 'false'}>
      <td>
        <input
          type="checkbox"
          checked={line.enabled}
          aria-label={`Включить: ${line.title}`}
          onChange={() => onToggle(line.id)}
        />
      </td>
      <td>
        <span className={styles.workTitle}>{line.title}</span>
        <span className={styles.meta}>
          {line.source}
          {line.note ? ` · ${line.note}` : ''}
        </span>
      </td>
      <td>{line.unit}</td>
      <td>
        <EstimateNumberInput
          className={styles.num}
          value={line.quantity}
          aria-label={`Объём: ${line.title}`}
          onValueChange={(quantity) => onPatchLine(line.id, { quantity })}
        />
      </td>
      <td>
        <EstimateNumberInput
          className={styles.num}
          value={line.unitPrice}
          aria-label={`Цена: ${line.title}`}
          onValueChange={(unitPrice) => onPatchLine(line.id, { unitPrice })}
        />
      </td>
      <td>
        <EstimateNumberInput
          className={styles.num}
          value={line.coefficient}
          aria-label={`Коэффициент: ${line.title}`}
          onValueChange={(coefficient) => onPatchLine(line.id, { coefficient })}
        />
      </td>
      <td className={styles.total}>{formatPriceValue(total)} ₽</td>
      <td>
        <input
          className={styles.comment}
          type="text"
          value={line.comment ?? ''}
          aria-label={`Комментарий: ${line.title}`}
          onChange={(event) => onPatchLine(line.id, { comment: event.target.value })}
        />
      </td>
    </tr>
  )
}
