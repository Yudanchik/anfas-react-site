import { useRef } from 'react'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { processSteps } from '@/entities/process/model/process.data'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import { SectionHeader } from '../../ui'
import styles from './HomeProcess.module.scss'
import 'swiper/css'
import 'swiper/css/navigation'

export function HomeProcess() {
  const prevButtonRef = useRef<HTMLButtonElement | null>(null)
  const nextButtonRef = useRef<HTMLButtonElement | null>(null)

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
              от замера <em>до сдачи</em>
            </>
          }
          lead="Показываем путь проекта целиком: от первой встречи и замера до комплектации, контроля стройки и финальной сдачи."
        />

        <div className={styles.process__sliderWrap} data-reveal>
          <div className={styles.process__sliderControls}>
            <div className={styles.process__sliderButtons}>
              <button
                ref={prevButtonRef}
                className={`${styles.process__sliderButton} ${styles.process__sliderButton_prev}`}
                type="button"
                aria-label="Предыдущий этап"
              >
                <ArrowIcon size={15} />
              </button>
              <button
                ref={nextButtonRef}
                className={`${styles.process__sliderButton} ${styles.process__sliderButton_next}`}
                type="button"
                aria-label="Следующий этап"
              >
                <ArrowIcon size={15} />
              </button>
            </div>
          </div>

          <Swiper
            className={styles.process__slider}
            modules={[Navigation]}
            slidesPerView={1}
            spaceBetween={18}
            navigation
            onBeforeInit={(swiper) => {
              if (typeof swiper.params.navigation === 'boolean') {
                swiper.params.navigation = {
                  prevEl: prevButtonRef.current,
                  nextEl: nextButtonRef.current,
                }
              } else {
                swiper.params.navigation = {
                  ...swiper.params.navigation,
                  prevEl: prevButtonRef.current,
                  nextEl: nextButtonRef.current,
                }
              }
            }}
          >
            {processSteps.map((step) => (
              <SwiperSlide className={styles.process__slide} key={step.mark}>
                <article className={styles.process__card}>
                  <div className={styles.process__cardMedia}>
                    <img
                      className={styles.process__cardImage}
                      src={step.visualImage}
                      alt={step.visualTitle}
                      width={step.visualWidth}
                      height={step.visualHeight}
                      loading="lazy"
                      decoding="async"
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
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* <ModalTriggerButton
          className={styles.process__cta}
          intent="consultation"
          size="lg"
          source="home-process"
          data-reveal
        >
          Обсудить свой проект
        </ModalTriggerButton> */}
      </PageWrapper>
    </section>
  )
}
