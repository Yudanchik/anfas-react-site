import type { ReactNode } from 'react'

import styles from './SectionHeader.module.scss'

export const sectionHeaderClassNames = {
  root: 'sectionHeader',
  main: 'sectionHeaderMain',
  kicker: 'sectionHeaderKicker',
  number: 'sectionHeaderNumber',
  label: 'sectionHeaderLabel',
  title: 'sectionHeaderTitle',
  lead: 'sectionHeaderLead',
} as const

type SectionHeaderProps = {
  title: ReactNode
  lead?: string
  number?: string
  label?: string
  tone?: 'light' | 'dark'
  className?: string
  titleClassName?: string
  leadClassName?: string
}

export function SectionHeader({
  title,
  lead,
  number,
  label,
  tone = 'light',
  className,
  titleClassName,
  leadClassName,
}: SectionHeaderProps) {
  const showKicker = Boolean(number && label)

  return (
    <header
      className={`${styles.sectionHeader} ${sectionHeaderClassNames.root} ${styles[tone]} ${className ?? ''}`}
      data-reveal
    >
      <div className={`${styles.sectionHeaderMain} ${sectionHeaderClassNames.main}`}>
        {showKicker ? (
          <div className={`${styles.sectionHeaderKicker} ${sectionHeaderClassNames.kicker}`}>
            <span className={`${styles.sectionHeaderNumber} ${sectionHeaderClassNames.number}`}>
              {number}
            </span>
            <p className={`${styles.sectionHeaderLabel} ${sectionHeaderClassNames.label}`}>{label}</p>
          </div>
        ) : null}
        <h2
          className={`${styles.sectionHeaderTitle} ${sectionHeaderClassNames.title} ${titleClassName ?? ''}`}
        >
          {title}
        </h2>
        {lead ? (
          <p
            className={`${styles.sectionHeaderLead} ${sectionHeaderClassNames.lead} ${leadClassName ?? ''}`}
          >
            {lead}
          </p>
        ) : null}
      </div>
    </header>
  )
}
