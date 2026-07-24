import { useRef, useState, type CSSProperties } from 'react'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import projectControlAppImage from '@/assets/images/home/project-control-app.webp'
import projectControlApprovalImage from '@/assets/images/home/project-control-approval.webp'
import projectControlImage from '@/assets/images/home/project-control-v2.webp'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '../../ui'
import { projectControlFeatures } from '../model/project-control.data'

import styles from './HomeProjectControl.module.scss'
import 'swiper/css'
import 'swiper/css/navigation'

type FeatureStyle = CSSProperties & {
  '--feature-y': string
}

const renderHotspots = (
  activeFeature: number | null,
  selectFeature: (index: number) => void,
  className?: string,
) => (
  <div className={`${styles.hotspots} ${className ?? ''}`} aria-label="Разделы личного кабинета">
    {projectControlFeatures.map((item, index) => (
      <button
        className={`${styles.hotspot} ${index === activeFeature ? styles.hotspotActive : ''} ${activeFeature === null && index === 0 ? styles.hotspotInviting : ''}`}
        style={{ '--feature-y': item.position } as FeatureStyle}
        type="button"
        key={item.id}
        onClick={() => selectFeature(index)}
        aria-label={`${item.label}: ${item.title}`}
        aria-pressed={index === activeFeature}
      />
    ))}
  </div>
)

export function HomeProjectControl() {
  const prevButtonRef = useRef<HTMLButtonElement | null>(null)
  const nextButtonRef = useRef<HTMLButtonElement | null>(null)
  const [activeFeature, setActiveFeature] = useState<number | null>(null)
  const feature = activeFeature === null ? null : projectControlFeatures[activeFeature]

  const selectFeature = (index: number) => {
    setActiveFeature((current) => (current === index ? null : index))
  }

  return (
    <section className={styles.section} aria-labelledby="project-control-title">
      <PageWrapper className={styles.layout}>
        <div className={styles.copy}>
          <SectionHeader
            titleId="project-control-title"
            title={
              <>
                Ремонт может быть понятным и <em>спокойным событием</em> в вашей жизни.
              </>
            }
            lead="Всё, что происходит на объекте, вы видите в одном месте. Финансы, фотоотчёты, документы и цены на работы всегда под рукой. Нажмите на разделы в телефоне и посмотрите, как устроен прозрачный контроль ремонта."
            titleClassName={styles.title}
            leadClassName={styles.lead}
          />

          <div className={styles.legend} aria-label="Возможности личного кабинета">
            <span>Финансы</span>
            <span>Фото и видео</span>
            <span>Документы</span>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoHeader}>
            <span>Личный кабинет проекта</span>
            <span>Нажмите на раздел</span>
          </div>

          <div className={`${styles.viewport} ${styles.desktopViewport}`}>
            <div className={styles.canvas}>
              <img
                className={styles.image}
                src={projectControlImage}
                alt="Два экрана приложения для контроля ремонта: кабинет проекта и согласование работ"
                width={1270}
                height={1239}
                loading="lazy"
                decoding="async"
              />

              {renderHotspots(activeFeature, selectFeature)}

              {feature && (
                <article
                  className={styles.tooltip}
                  style={{ '--feature-y': feature.position } as FeatureStyle}
                  aria-live="polite"
                >
                  <span>Раздел приложения</span>
                  <strong>{feature.label}</strong>
                  <p>{feature.text}</p>
                </article>
              )}
            </div>
          </div>

          <div className={styles.mobileSliderWrap}>
            <div className={styles.mobileControls}>
              <button ref={prevButtonRef} type="button" aria-label="Предыдущий экран">
                <ArrowIcon size={15} />
              </button>
              <button ref={nextButtonRef} type="button" aria-label="Следующий экран">
                <ArrowIcon size={15} />
              </button>
            </div>

            <Swiper
              className={styles.mobileSlider}
              modules={[Navigation]}
              slidesPerView={1}
              spaceBetween={12}
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
              <SwiperSlide className={styles.mobileSlide}>
                <div className={styles.mobileScreen}>
                  <img
                    className={styles.mobileScreenImage}
                    src={projectControlAppImage}
                    alt="Кабинет проекта в приложении для контроля ремонта"
                    width={635}
                    height={1239}
                    loading="lazy"
                    decoding="async"
                  />
                  {renderHotspots(activeFeature, selectFeature, styles.mobileHotspots)}

                  {feature && (
                    <article
                      className={`${styles.tooltip} ${styles.mobileTooltip}`}
                      style={{ '--feature-y': feature.position } as FeatureStyle}
                      aria-live="polite"
                    >
                      <span>Раздел приложения</span>
                      <strong>{feature.label}</strong>
                      <p>{feature.text}</p>
                    </article>
                  )}
                </div>
              </SwiperSlide>

              <SwiperSlide className={styles.mobileSlide}>
                <div className={styles.mobileScreen}>
                  <img
                    className={styles.mobileScreenImage}
                    src={projectControlApprovalImage}
                    alt="Согласование работ в приложении для контроля ремонта"
                    width={635}
                    height={1239}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </PageWrapper>
    </section>
  )
}
