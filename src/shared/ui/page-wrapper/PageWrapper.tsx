import type { ReactNode } from 'react'

import styles from './PageWrapper.module.scss'

type PageWrapperProps = {
  children: ReactNode
  className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return <div className={[styles.pageWrapper, className].filter(Boolean).join(' ')}>{children}</div>
}
