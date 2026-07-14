import styles from './HomeTicker.module.scss'

const tickerItems = [
  'ремонт квартир под ключ',
  'дизайнерский ремонт квартир',
  'пакетный ремонт квартиры',
  'ремонт с фиксированной ценой',
  'ремонт с понятными сроками',
  'дизайн-проект и реализация',
  'прозрачный ремонт без хаоса',
  'премиальный интерьер в спб',
] as const

export function HomeTicker() {
  return (
    <div className={styles.ticker} aria-hidden="true">
      <div className={styles.tickertrack}>
        {Array.from({ length: 4 }).map((_, group) => (
          <div className={styles.tickergroup} key={group}>
            {tickerItems.map((item, index) => (
              <span className={styles.tickerItem} key={`${group}-${item}-${index}`}>
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
