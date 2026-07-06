import styles from './PlusIcon.module.scss'

type PlusIconProps = {
  open?: boolean
  className?: string
}

export function PlusIcon({ open = false, className }: PlusIconProps) {
  return (
    <span
      className={`${styles.plusIcon} ${open ? styles.open : ''} ${className ?? ''}`}
      aria-hidden="true"
    >
      <span className={styles.line} />
      <span className={`${styles.line} ${styles.lineVertical}`} />
    </span>
  )
}
