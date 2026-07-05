import { partners } from '../model/partners.data'
import styles from './HomePartners.module.scss'

const firstRow = partners.slice(0, 6)
const secondRow = partners.slice(6)

function PartnerTrack({
  items,
  reverse = false,
}: {
  items: ReadonlyArray<(typeof partners)[number]>
  reverse?: boolean
}) {
  return (
    <div className={styles.track + (reverse ? ` ${styles.reverse}` : '')} aria-hidden="true">
      {[0, 1].map((group) => (
        <div className={styles.group} key={group}>
          {items.map((partner) => (
            <article className={styles.card} key={`${group}-${partner.name}`}>
              <span>{partner.name}</span>
              <small>{partner.label}</small>
            </article>
          ))}
        </div>
      ))}
    </div>
  )
}

export function HomePartners() {
  return (
    <section className={styles.partners + ' ' + styles.sectionpad}>
      <div className={styles.partnerslayout}>
        <div className={styles.partnersintro} data-reveal>
          <div className={styles.sectionkicker}>
            <span>07</span>
            <p>Наши партнёры</p>
          </div>
          <h2>
            Дизайн, комплектация
            <br />
            и <em>сильная команда</em>
          </h2>
          <p>
            Мы работаем с архитекторами, студиями и поставщиками, которые помогают держать качество
            и скорость на высоком уровне. Такой круг партнёров делает процесс спокойнее и понятнее.
          </p>
        </div>

        <div className={styles.partnersrail} data-reveal>
          <PartnerTrack items={firstRow} />
          <PartnerTrack items={secondRow} reverse />
        </div>
      </div>
    </section>
  )
}
