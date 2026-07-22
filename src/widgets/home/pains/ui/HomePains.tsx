import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '../../ui'
import { pains } from '../model/pains.data'

import styles from './HomePains.module.scss'

export function HomePains() {
  return (
    <section id="pains" className={styles.pains + ' ' + styles.sectionpad}>
      <PageWrapper>
        <SectionHeader
          className={styles.header}
          number="01"
          label={pains.eyebrow}
          title={
            <>
              Ремонт пугает.
              <br />
              Мы знаем — <em>почему.</em>
            </>
          }
          lead={pains.lead}
          titleClassName={styles.headerTitle}
          leadClassName={styles.headerLead}
          tone="dark"
          reveal={false}
        />

        <div className={styles.list}>
          {pains.items.map((item, index) => (
            <article
              key={item.number}
              className={`${styles.item} ${index % 2 === 1 ? styles.itemOffset : ''}`}
            >
              <div className={styles.itemRail} aria-hidden="true" />

              <div className={styles.itemGrid}>
                <div className={styles.visual}>
                  <img className={styles.visualImage} src={item.image} alt={item.imageAlt} />
                  <div className={styles.visualOverlay}>
                    <div className={styles.visualMeta}>
                      <span className={styles.number}>{item.number}</span>
                      <span className={styles.label}>{item.label}</span>
                    </div>
                    <p className={styles.quote}>{item.quote}</p>
                  </div>
                </div>

                <div className={styles.content}>
                  <div className={styles.contentHead}>
                    <span className={styles.kicker}>Боль</span>
                    <h3 className={styles.painTitle}>{item.pain}</h3>
                  </div>

                  <div className={styles.solution}>
                    <span className={styles.solutionTag}>Как решаем</span>
                    <h4 className={styles.solutionTitle}>{item.solveTitle}</h4>
                    <p className={styles.solutionText}>{item.solveText}</p>
                  </div>

                  <div className={styles.stats}>
                    {item.stats.map((stat) => (
                      <div className={styles.stat} key={stat.label}>
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.footer}>
          <ModalTriggerButton
            className={styles.cta}
            intent="consultation"
            size="lg"
            source="home-pains"
          >
            Обсудить проект без хаоса и сюрпризов
          </ModalTriggerButton>
        </div>
      </PageWrapper>
    </section>
  )
}
