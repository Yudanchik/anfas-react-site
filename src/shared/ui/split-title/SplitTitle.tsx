import styles from './SplitTitle.module.scss'

type SplitTitleProps = {
  line: string
  accent: string
  accentAs?: 'em' | 'span'
  accentClassName?: string
}

/** Two-line title without DOM word-glue (space between parts for crawlers). */
export function SplitTitle({
  line,
  accent,
  accentAs = 'em',
  accentClassName,
}: SplitTitleProps) {
  const AccentTag = accentAs
  const accentClass = [styles.accent, accentClassName].filter(Boolean).join(' ')

  return (
    <>
      <span className={styles.line}>{line}</span>{' '}
      <AccentTag className={accentClass}>{accent}</AccentTag>
    </>
  )
}
