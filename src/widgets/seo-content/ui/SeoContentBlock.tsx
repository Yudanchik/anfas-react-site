import { SectionHeader } from '@/widgets/home/ui'

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
  return (
    <section className={`${styles.section} ${embedded ? styles.embedded : ''}`}>
      <SectionHeader title={title} lead={lead} />
      <div className={styles.grid} data-reveal>
        {items.map((item) => (
          <article className={styles.card} key={item.title}>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardText}>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
