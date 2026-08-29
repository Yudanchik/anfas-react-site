import type { EstimateLine } from '@/entities/estimate'
import { calculateLineTotal, isZonedEstimateLine } from '@/entities/estimate'
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
  onRemoveManualLine?: (lineId: string) => void
}

function sourceTooltip(line: EstimateLine): string | undefined {
  const parts: string[] = []
  if (line.source && line.source !== 'manual') parts.push(`Источник: ${line.source}`)
  if (line.note?.trim()) parts.push(line.note.trim())
  return parts.length > 0 ? parts.join(' · ') : undefined
}

export function EstimateLineRow({
  line,
  onToggle,
  onPatchLine,
  onRemoveManualLine,
}: EstimateLineRowProps) {
  const total = calculateLineTotal(line)
  const canRemove =
    Boolean(onRemoveManualLine) && (line.source === 'manual' || isZonedEstimateLine(line))
  const tooltip = sourceTooltip(line)

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
        <div className={styles.workCell}>
          <span className={styles.workTitle} title={tooltip}>
            {line.title}
          </span>
          {line.zoneName ? (
            <span className={styles.zoneBadge}>Зона: {line.zoneName}</span>
          ) : null}
        </div>
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
      <td className={styles.rowActions}>
        {canRemove ? (
          <button
            type="button"
            className={styles.removeBtn}
            aria-label={`Удалить строку: ${line.title}`}
            onClick={() => onRemoveManualLine?.(line.id)}
          >
            Удалить
          </button>
        ) : null}
      </td>
    </tr>
  )
}
