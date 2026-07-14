import styles from './PlusIcon.module.scss'

type PlusIconProps = {
  open?: boolean
  className?: string
}

export function PlusIcon({ open = false, className }: PlusIconProps) {
  return (
    <span
      className={`${styles.plusIcon} ${open ? styles.plusIcon_open : ''} ${className ?? ''}`}
      aria-hidden="true"
    >
      <span className={styles.plusIcon__line} />
      <span className={`${styles.plusIcon__line} ${styles.plusIcon__line_vertical}`} />
    </span>
  )
}
