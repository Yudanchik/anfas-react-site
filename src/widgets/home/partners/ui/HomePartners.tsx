import { PageWrapper } from '@/shared/ui/page-wrapper'

import { partners } from '../model/partners.data'
import { SectionHeader } from '../../ui'
import { HomePartnersMarquee } from './HomePartnersMarquee'
import styles from './HomePartners.module.scss'

const firstRow = partners
const secondRow = [...partners].reverse()

export function HomePartners() {
  return (
    <section className={styles.partners + ' ' + styles.partners_sectionPad}>
      <PageWrapper className={styles.partners__layout}>
        <SectionHeader
          className={styles.partners__header}
          number="07"
          label="Партнёры и поставщики"
          title={
            <>
              Наши партнёры,
              <br />
              с которыми <em>мы работаем</em>
            </>
          }
          lead="Бренды и поставщики, которых наши бригады закупают на объектах: от черновых материалов до чистовой отделки, света и сантехники."
        />

        <div className={styles.partners__rail} data-reveal>
          <HomePartnersMarquee items={firstRow} />
          <HomePartnersMarquee items={secondRow} reverse />
        </div>
      </PageWrapper>
    </section>
  )
}
