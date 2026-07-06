import styles from './HomeQuote.module.scss'

export function HomeQuote() {
  return (
    <section className={styles.quotesection}>
      <div className={styles.quoteimage} aria-hidden="true" />
      <div className={styles.quotecard} data-reveal>
        <span className={styles.quotemark}>“</span>
        <blockquote>
          Не пудрим мозги, берём ответственность на себя и закрываем вопрос полностью. Просто,
          честно, по делу.
        </blockquote>
        <footer>
          <strong>Кирилл и Антон</strong>
          <span>Основатели «Анфас»</span>
        </footer>
      </div>
    </section>
  )
}
