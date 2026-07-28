import styles from './HomeTicker.module.scss'

const tickerItems = [
  'ремонт квартир под ключ',
  'дизайн-проект и реализация',
  'фиксированная цена за м²',
  'согласованные сроки и этапы',
  'пакетный и индивидуальный формат',
  'премиальный интерьер в СПб',
] as const

export function HomeTicker() {
  return (
    <div className={styles.ticker} aria-hidden="true">
      <div className={styles.ticker__track}>
        {Array.from({ length: 4 }).map((_, group) => (
          <div className={styles.ticker__group} key={group}>
            {tickerItems.map((item, index) => (
              <span className={styles.ticker__item} key={`${group}-${item}-${index}`}>
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
