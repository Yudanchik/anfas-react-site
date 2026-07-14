import { useRef } from 'react'

import { SectionHeader } from '@/widgets/home/ui'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import styles from './SeoContentBlock.module.scss'

type SeoItem = {
  title: string
  text: string
}

type SeoContentBlockProps = {
  title: string
  lead: string
  items: readonly SeoItem[]
  /** Внутри inner-page без дополнительных боковых отступов */
  embedded?: boolean
}

export function SeoContentBlock({ title, lead, items, embedded = false }: SeoContentBlockProps) {
  const railRef = useRef<HTMLDivElement | null>(null)

  const scrollRail = (direction: -1 | 1) => {
    const rail = railRef.current
    if (!rail) {
      return
    }

    const step = Math.max(rail.clientWidth * 0.82, 320)

    rail.scrollBy({
      left: direction * step,
      behavior: 'smooth',
    })
  }

  return (
    <section className={`${styles.seoContent} ${embedded ? styles.seoContent_embedded : ''}`}>
      <SectionHeader title={title} lead={lead} />
      <div className={styles.seoContent__controls}>
        <p className={styles.seoContent__hint}>Листайте карточки</p>
        <div className={styles.seoContent__buttons}>
          <button
            aria-label="Показать предыдущие карточки"
            className={`${styles.seoContent__button} ${styles.seoContent__button_reverse}`}
            type="button"
            onClick={() => scrollRail(-1)}
          >
            <ArrowIcon size={16} />
          </button>
          <button
            aria-label="Показать следующие карточки"
            className={styles.seoContent__button}
            type="button"
            onClick={() => scrollRail(1)}
          >
            <ArrowIcon size={16} />
          </button>
        </div>
      </div>

      <div ref={railRef} className={styles.seoContent__grid} data-reveal>
        {items.map((item) => (
          <article className={styles.seoContent__card} key={item.title}>
            <h3 className={styles.seoContent__cardTitle}>{item.title}</h3>
            <p className={styles.seoContent__cardText}>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
