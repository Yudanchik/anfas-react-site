import { Link } from 'react-router'

import { createSeoMeta } from '@/shared/config/seo'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './route.module.scss'

export const meta = () =>
  createSeoMeta({
    title: 'Страница не найдена — Анфас',
    path: '/',
    robots: 'noindex, nofollow',
  })

export default function NotFoundRoute() {
  return (
    <main className={styles.page}>
      <PageWrapper>
        <p className={styles.eyebrow}>Ошибка 404</p>
        <h1 className={styles.title}>
          Такой страницы
          <br />
          <em>пока нет.</em>
        </h1>
        <Link className={styles.button} to="/">
          Вернуться на главную
        </Link>
      </PageWrapper>
    </main>
  )
}
