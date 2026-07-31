import { useState } from 'react'

import type { PriceFaqItem } from '@/entities/price/model/price.types'
import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'
import { PlusIcon } from '@/shared/ui/icons/PlusIcon'

import styles from './PricesFaq.module.scss'

type PricesFaqProps = {
  items: readonly PriceFaqItem[]
}

export function PricesFaq({ items }: PricesFaqProps) {
  const [openIndex, setOpenIndex] = useState(-1)

  if (items.length === 0) {
    return null
  }

  return (
    <section className={styles.faq}>
      <h2 className={styles.title}>{tieRussianShortWords('Частые вопросы')}</h2>
      <div className={styles.list}>
        {items.map((item, index) => {
          const isOpen = openIndex === index
          const triggerId = `prices-faq-trigger-${index + 1}`
          const answerId = `prices-faq-answer-${index + 1}`

          return (
            <article className={`${styles.item} ${isOpen ? styles.item_open : ''}`} key={item.question}>
              <button
                id={triggerId}
                className={styles.trigger}
                type="button"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
              >
                <strong className={styles.question}>{tieRussianShortWords(item.question)}</strong>
                <span className={styles.toggle}>
                  <PlusIcon open={isOpen} />
                </span>
              </button>
              <div className={styles.answer} id={answerId} role="region" aria-labelledby={triggerId}>
                <div className={styles.answerInner}>
                  <p className={styles.answerText}>{tieRussianShortWords(item.answer)}</p>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
