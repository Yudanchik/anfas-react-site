import { partners } from '../model/partners.data'
import { SectionHeader } from '../../ui'
import { HomePartnersMarquee } from './HomePartnersMarquee'
import styles from './HomePartners.module.scss'

const firstRow = partners.slice(0, 6)
const secondRow = partners.slice(6)

export function HomePartners() {
  return (
    <section className={styles.partners + ' ' + styles.sectionpad}>
      <div className={styles.partnerslayout}>
        <SectionHeader
          number="09"
          label="Наши партнёры"
          title={
            <>
              Дизайн, комплектация
              <br />
              и <em>сильная команда</em>
            </>
          }
          lead="Мы работаем с архитекторами, студиями и поставщиками, которые помогают держать качество и скорость на высоком уровне. Такой круг партнёров делает процесс спокойнее и понятнее."
        />

        <div className={styles.partnersrail} data-reveal>
          <HomePartnersMarquee items={firstRow} />
          <HomePartnersMarquee items={secondRow} reverse />
        </div>
      </div>
    </section>
  )
}
