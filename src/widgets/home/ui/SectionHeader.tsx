import type { ReactNode } from 'react'

import { tieRussianShortWords, tieRussianShortWordsInNode } from '@/shared/lib/tie-russian-short-words'

import styles from './SectionHeader.module.scss'

export const sectionHeaderClassNames = {
  root: 'sectionHeader',
  main: 'sectionHeaderMain',
  title: 'sectionHeaderTitle',
  lead: 'sectionHeaderLead',
} as const

type SectionHeaderProps = {
  title: ReactNode
  lead?: string
  number?: string
  label?: string
  tone?: 'light' | 'dark'
  reveal?: boolean
  className?: string
  titleId?: string
  titleClassName?: string
  leadClassName?: string
}

export function SectionHeader({
  title,
  lead,
  tone = 'light',
  reveal = true,
  className,
  titleId,
  titleClassName,
  leadClassName,
}: SectionHeaderProps) {
  const headerClassName = [
    styles.sectionHeader,
    sectionHeaderClassNames.root,
    tone === 'dark' ? styles.sectionHeader_dark : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header
      className={headerClassName}
      {...(reveal ? { 'data-reveal': true } : { 'data-visible': true })}
    >
      <div className={`${styles.sectionHeaderMain} ${sectionHeaderClassNames.main}`}>
        <h2
          id={titleId}
          className={`${styles.sectionHeaderTitle} ${sectionHeaderClassNames.title} ${titleClassName ?? ''}`}
        >
          {tieRussianShortWordsInNode(title)}
        </h2>
        {lead ? (
          <p
            className={`${styles.sectionHeaderLead} ${sectionHeaderClassNames.lead} ${leadClassName ?? ''}`}
          >
            {tieRussianShortWords(lead)}
          </p>
        ) : null}
      </div>
    </header>
  )
}
