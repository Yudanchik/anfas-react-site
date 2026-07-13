import { processSteps } from '@/entities/process/model/process.data'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import { SectionHeader } from '../../ui'
import styles from './HomeProcess.module.scss'

export function HomeProcess({ onOpenBrief }: { onOpenBrief: () => void }) {
  return (
    <section id="process" className={styles.process + ' ' + styles.sectionpad}>
      <PageWrapper className={styles.processshell}>
        <SectionHeader
          className={styles.processheader}
          number="09"
          label="Как идёт ремонт"
          title={
            <>
              Пять этапов
              <br />
              ремонта <em>без хаоса</em>
            </>
          }
          lead="Вместо sticky-сценария показываем весь путь сразу: от первой встречи и замера до комплектации, контроля стройки и финальной сдачи квартиры под ключ."
        />

        <div className={styles.processlist}>
          {processSteps.map((step, index) => (
            <article
              className={`${styles.processcard} ${index % 2 === 1 ? styles.processcardReverse : ''}`}
              key={step.mark}
              data-reveal
            >
              <div className={styles.cardMedia}>
                <img
                  className={styles.cardImage}
                  src={step.visualImage}
                  alt={step.visualTitle}
                  style={{ objectPosition: step.visualPosition }}
                />
                <div className={styles.cardOverlay} />
                <span className={styles.cardBadge}>{step.label}</span>
                <span className={styles.cardMark}>{step.mark}</span>
              </div>

              <div className={styles.cardBody}>
                <span className={styles.cardKicker}>Этап Anfas</span>
                <h3 className={styles.cardTitle}>{step.title}</h3>
                <p className={styles.cardText}>{step.text}</p>

                <div className={styles.cardDetail}>
                  <h4>{step.visualTitle}</h4>
                  <p>{step.visualText}</p>
                </div>

                <div className={styles.cardStats}>
                  {step.stats.map((stat) => (
                    <div className={styles.cardStat} key={stat.label}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <button className={styles.processcta} type="button" onClick={() => onOpenBrief()} data-reveal>
          <span>Обсудить свой проект</span>
          <i aria-hidden="true">
            <ArrowIcon size={16} />
          </i>
        </button>
      </PageWrapper>
    </section>
  )
}
