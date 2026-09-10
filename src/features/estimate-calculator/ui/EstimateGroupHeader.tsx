import { formatPriceValue } from '@/entities/price/lib/price-helpers'

import styles from './EstimateGroupHeader.module.scss'

export type EstimateGroupView = {
  id: string
  title: string
  selectedCount: number
  totalCount: number
  totalRub: number
}

type EstimateGroupHeaderProps = {
  group: EstimateGroupView
  open: boolean
  panelId: string
  onToggle: () => void
}

export function EstimateGroupHeader({
  group,
  open,
  panelId,
  onToggle,
}: EstimateGroupHeaderProps) {
  return (
    <button
      type="button"
      className={styles.header}
      data-open={open ? 'true' : 'false'}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onToggle}
    >
      <span className={styles.chevron} data-open={open ? 'true' : 'false'} aria-hidden="true" />
      <span className={styles.title}>{group.title}</span>
      <span className={styles.badge}>
        {group.selectedCount}/{group.totalCount}
      </span>
      <span className={styles.total}>{formatPriceValue(group.totalRub)} ₽</span>
    </button>
  )
}
