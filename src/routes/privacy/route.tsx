import styles from '../_shared/InnerPage.module.scss'

export const meta = () => [
  { title: 'Политика конфиденциальности — Анфас' },
  { name: 'robots', content: 'noindex, nofollow' },
]

export default function PrivacyRoute() {
  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>Документы</p>
      <h1 className={styles.title}>Политика конфиденциальности</h1>
      <div className={styles.content}>
        <h2>Черновик</h2>
        <p>
          Перед публикацией здесь необходимо разместить утверждённую юридическую версию политики
          обработки персональных данных компании.
        </p>
      </div>
    </main>
  )
}

