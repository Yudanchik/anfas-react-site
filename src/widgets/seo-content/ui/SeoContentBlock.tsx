import styles from './SeoContentBlock.module.scss'

type SeoItem = {
  title: string
  text: string
}

type SeoContentBlockProps = {
  eyebrow: string
  title: string
  lead: string
  items: readonly SeoItem[]
}

export function SeoContentBlock({ eyebrow, title, lead, items }: SeoContentBlockProps) {
  return (
    <section>
      <div className={styles.header} data-reveal>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.lead}>{lead}</p>
        </div>
      </div>
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
