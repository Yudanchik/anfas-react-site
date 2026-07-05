import styles from './HomeTicker.module.scss'

export function HomeTicker() {
  return (
    <div className={styles.ticker} aria-hidden="true">
      <div className={styles.tickertrack}>
        {[0, 1].map((group) => (
          <div className={styles.tickergroup} key={group}>
            <span>Дизайн без компромиссов</span>
            <i>✦</i>
            <span>Прозрачная реализация</span>
            <i>✦</i>
            <span>Гарантия на работы</span>
            <i>✦</i>
          </div>
        ))}
      </div>
    </div>
  )
}
