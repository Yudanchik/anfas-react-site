import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './NotFoundState.module.scss'

type NotFoundStateProps = {
  title?: ReactNode
  lead?: string
  homeHref?: string
  homeLabel?: string
}

export function NotFoundState({
  title = (
    <>
      Такой страницы
      <br />
      <em>не существует.</em>
    </>
  ),
  lead = 'Возможно, ссылка устарела или адрес введён с ошибкой.',
  homeHref = '/',
  homeLabel = 'На главную',
}: NotFoundStateProps) {
  return (
    <main className={styles.page}>
      <span className={styles.backdrop} aria-hidden="true">
        404
      </span>

      <PageWrapper className={styles.wrap}>
        <div className={styles.content}>
          <p className={styles.code}>Ошибка 404</p>
          <h1 className={styles.title}>{title}</h1>
          {lead ? <p className={styles.lead}>{lead}</p> : null}
          <Link className={styles.button} to={homeHref}>
            {homeLabel}
          </Link>
        </div>
      </PageWrapper>
    </main>
  )
}
