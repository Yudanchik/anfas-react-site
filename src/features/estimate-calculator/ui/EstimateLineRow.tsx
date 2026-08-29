import type { EstimateLine } from '@/entities/estimate'
import { calculateLineTotal } from '@/entities/estimate'
import { formatPriceValue } from '@/entities/price/lib/price-helpers'

import styles from './EstimateGroupedTable.module.scss'

type EstimateLineRowProps = {
  line: EstimateLine
  onToggle: (lineId: string) => void
  onPatchLine: (
    lineId: string,
    patch: Partial<Pick<EstimateLine, 'quantity' | 'unitPrice' | 'coefficient' | 'comment'>>,
  ) => void
}

function parseNumberInput(raw: string): number {
  const normalized = raw.replace(',', '.').trim()
  if (normalized === '') return 0
  const value = Number(normalized)
  return Number.isFinite(value) ? value : 0
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
        <input
          className={styles.num}
          type="number"
          min={0}
          step="any"
          value={line.quantity}
          aria-label={`Объём: ${line.title}`}
          onChange={(event) =>
            onPatchLine(line.id, { quantity: parseNumberInput(event.target.value) })
          }
        />
      </td>
      <td>
        <input
          className={styles.num}
          type="number"
          min={0}
          step="any"
          value={line.unitPrice}
          aria-label={`Цена: ${line.title}`}
          onChange={(event) =>
            onPatchLine(line.id, { unitPrice: parseNumberInput(event.target.value) })
          }
        />
      </td>
      <td>
        <input
          className={styles.num}
          type="number"
          min={0}
          step="any"
          value={line.coefficient}
          aria-label={`Коэффициент: ${line.title}`}
          onChange={(event) =>
            onPatchLine(line.id, {
              coefficient: parseNumberInput(event.target.value),
            })
          }
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
