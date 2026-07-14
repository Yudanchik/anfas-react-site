import { PageWrapper } from '@/shared/ui/page-wrapper'

import { partners } from '../model/partners.data'
import { SectionHeader } from '../../ui'
import { HomePartnersMarquee } from './HomePartnersMarquee'
import styles from './HomePartners.module.scss'

const firstRow = partners
const secondRow = [...partners].reverse()

export function HomePartners() {
  return (
    <section className={styles.partners + ' ' + styles.sectionpad}>
      <PageWrapper className={styles.partnerslayout}>
        <SectionHeader
          className={styles.partnersheader}
          number="07"
          label="Партнёры и поставщики"
          title={
            <>
              Проверенные бренды,
              <br />
              команды и <em>комплектация без хаоса</em>
            </>
          }
          lead="Собираем ремонт квартиры под ключ вместе с архитекторами, студиями и поставщиками, которые умеют держать срок, качество и предсказуемый результат. Это даёт спокойную реализацию без лишних провалов по материалам и логистике."
        />

        <div className={styles.partnersrail} data-reveal>
          <HomePartnersMarquee items={firstRow} />
          <HomePartnersMarquee items={secondRow} reverse />
        </div>
      </PageWrapper>
    </section>
  )
}
