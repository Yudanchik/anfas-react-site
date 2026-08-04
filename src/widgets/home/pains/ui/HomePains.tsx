import { useRef } from 'react'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

// import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '../../ui'
import { pains } from '../model/pains.data'

import styles from './HomePains.module.scss'
import 'swiper/css'
import 'swiper/css/navigation'

export function HomePains() {
  const prevButtonRef = useRef<HTMLButtonElement | null>(null)
  const nextButtonRef = useRef<HTMLButtonElement | null>(null)

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

        <div className={styles.sliderWrap}>
          <div className={styles.sliderControls}>
            <div className={styles.sliderButtons}>
              <button
                ref={prevButtonRef}
                className={`${styles.sliderButton} ${styles.sliderButtonPrev}`}
                type="button"
                aria-label="Предыдущая боль"
              >
                <ArrowIcon size={15} />
              </button>
              <button
                ref={nextButtonRef}
                className={`${styles.sliderButton} ${styles.sliderButtonNext}`}
                type="button"
                aria-label="Следующая боль"
              >
                <ArrowIcon size={15} />
              </button>
            </div>
          </div>

          <Swiper
            className={styles.slider}
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
            {pains.items.map((item) => (
              <SwiperSlide className={styles.slide} key={item.number}>
                <article className={styles.item}>
                  <div className={styles.visual}>
                    <img
                      className={styles.visualImage}
                      src={item.image}
                      alt={item.imageAlt}
                      width={item.imageWidth}
                      height={item.imageHeight}
                      loading="lazy"
                      decoding="async"
                    />
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
                      <span className={styles.kicker}>{item.kicker}</span>
                      <h3 className={styles.painTitle}>{item.pain}</h3>
                    </div>

                    <div className={styles.solution}>
                      <span className={styles.solutionTag}>Как решаем</span>
                      {item.solveTitle ? (
                        <h4 className={styles.solutionTitle}>{item.solveTitle}</h4>
                      ) : null}
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
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* <div className={styles.footer}>
          <ModalTriggerButton
            className={styles.cta}
            intent="consultation"
            size="lg"
            source="home-pains"
          >
            Обсудить проект без хаоса и сюрпризов
          </ModalTriggerButton>
        </div> */}
      </PageWrapper>
    </section>
  )
}
