import type { PriceFactor } from '@/entities/price/model/price.types'
import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'

import styles from './PricesFactors.module.scss'

type PricesFactorsProps = {
  items: readonly PriceFactor[]
}

export function PricesFactors({ items }: PricesFactorsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className={styles.factors}>
      <h2 className={styles.title}>{tieRussianShortWords('Что влияет на цену')}</h2>
      <div className={styles.grid}>
        {items.map((factor) => (
          <article className={styles.card} key={factor.title} data-reveal>
            <h3>{tieRussianShortWords(factor.title)}</h3>
            <p>{tieRussianShortWords(factor.text)}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
