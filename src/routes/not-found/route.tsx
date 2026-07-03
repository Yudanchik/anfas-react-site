import { Link } from 'react-router'

import styles from '../_shared/InnerPage.module.scss'

export const meta = () => [{ title: 'Страница не найдена — Анфас' }]

export default function NotFoundRoute() {
  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>Ошибка 404</p>
      <h1 className={styles.title}>
        Такой страницы
        <br />
        <em>пока нет.</em>
      </h1>
      <Link className={styles.button} to="/">
        Вернуться на главную
      </Link>
    </main>
  )
}
