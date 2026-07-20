import { processSteps } from '@/entities/process/model/process.data'
import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import { SectionHeader } from '../../ui'
import styles from './HomeProcess.module.scss'

export function HomeProcess() {
  return (
    <section id="process" className={`${styles.process} ${styles.process_sectionPad}`}>
      <PageWrapper className={styles.process__shell}>
        <SectionHeader
          className={styles.process__header}
          number="09"
          label="Как идёт ремонт"
          title={
            <>
              Пять этапов
              <br />
              ремонта <em>без хаоса</em>
            </>
          }
          lead="Показываем путь проекта целиком: от первой встречи и замера до комплектации, контроля стройки и финальной сдачи квартиры под ключ."
        />

        <div className={styles.process__list}>
          {processSteps.map((step, index) => (
            <article
              className={`${styles.process__card} ${index % 2 === 1 ? styles.process__card_reverse : ''}`}
              key={step.mark}
              data-reveal
            >
              <div className={styles.process__cardMedia}>
                <img
                  className={styles.process__cardImage}
                  src={step.visualImage}
                  alt={step.visualTitle}
                  style={{ objectPosition: step.visualPosition }}
                />
                <div className={styles.process__cardOverlay} />
                <span className={styles.process__cardBadge}>{step.label}</span>
                <span className={styles.process__cardMark}>{step.mark}</span>
              </div>

              <div className={styles.process__cardBody}>
                <span className={styles.process__cardKicker}>Этап Анфас</span>
                <h3 className={styles.process__cardTitle}>{step.title}</h3>
                <p className={styles.process__cardText}>{step.text}</p>

                <div className={styles.process__cardDetail}>
                  <h4 className={styles.process__cardDetailTitle}>{step.visualTitle}</h4>
                  <p className={styles.process__cardDetailText}>{step.visualText}</p>
                </div>

                <div className={styles.process__cardStats}>
                  {step.stats.map((stat) => (
                    <div className={styles.process__cardStat} key={stat.label}>
                      <strong className={styles.process__cardStatValue}>{stat.value}</strong>
                      <span className={styles.process__cardStatLabel}>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <ModalTriggerButton
          className={styles.process__cta}
          intent="consultation"
          size="lg"
          source="home-process"
          data-reveal
        >
          Обсудить свой проект
        </ModalTriggerButton>
      </PageWrapper>
    </section>
  )
}
