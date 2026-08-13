import { useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { company } from '@/shared/config/company'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '@/widgets/home/ui'
import { META_DISCLAIMER } from '@/widgets/home/socials/model/socials.data'

import { instagramReels } from '../model/instagram-reels.data'
import styles from './AboutInstagram.module.scss'
import 'swiper/css'

export function AboutInstagram() {
  const swiperRef = useRef<SwiperInstance | null>(null)
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)

  const syncNavState = (swiper: SwiperInstance) => {
    setIsBeginning(swiper.isBeginning)
    setIsEnd(swiper.isEnd)
  }

  return (
    <section className={styles.section} aria-labelledby="about-instagram-title">
      <PageWrapper>
        <SectionHeader
          className={styles.header}
          reveal={false}
          titleId="about-instagram-title"
          title={
            <>
              Ремонт в <em>коротком формате</em>
            </>
          }
          lead="В Instagram показываем текущие объекты Анфас, этапы ремонта квартир, рабочие решения, детали интерьеров и моменты со стройки, которые обычно остаются за кадром большого видеообзора."
          titleClassName={styles.title}
          leadClassName={styles.lead}
        />

        <div className={styles.sliderWrap}>
          <div className={styles.sliderControls}>
            <div className={styles.sliderButtons}>
              <button
                className={`${styles.sliderButton} ${styles.sliderButtonPrev}`}
                type="button"
                aria-label="Предыдущий Reel"
                disabled={isBeginning}
                onClick={() => swiperRef.current?.slidePrev()}
              >
                <ArrowIcon size={15} />
              </button>
              <button
                className={`${styles.sliderButton} ${styles.sliderButtonNext}`}
                type="button"
                aria-label="Следующий Reel"
                disabled={isEnd}
                onClick={() => swiperRef.current?.slideNext()}
              >
                <ArrowIcon size={15} />
              </button>
            </div>
          </div>

          <Swiper
            className={styles.slider}
            slidesPerView={1}
            spaceBetween={16}
            watchOverflow
            breakpoints={{
              768: { slidesPerView: 2, spaceBetween: 20 },
              1100: { slidesPerView: 4, spaceBetween: 20 },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper
              syncNavState(swiper)
            }}
            onSlideChange={syncNavState}
            onResize={syncNavState}
            onBreakpoint={syncNavState}
          >
            {instagramReels.map((reel) => (
              <SwiperSlide className={styles.slide} key={reel.href}>
                <a
                  className={styles.card}
                  href={reel.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Смотреть Reel в Instagram: ${reel.title ?? 'ролик Анфас'}`}
                >
                  <div className={styles.media}>
                    <img
                      className={styles.cover}
                      src={reel.cover}
                      alt={reel.coverAlt}
                      width={640}
                      height={1138}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className={styles.playIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
                        <path d="M8.5 6.8v10.4L18 12 8.5 6.8Z" />
                      </svg>
                    </span>
                  </div>
                  {reel.title ? <span className={styles.cardTitle}>{reel.title}</span> : null}
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className={styles.footer}>
          <a
            className={styles.cta}
            href={company.instagramHref}
            target="_blank"
            rel="noreferrer"
          >
            Смотреть Instagram
            <ArrowIcon size={15} />
          </a>
          <p className={styles.disclaimer}>{META_DISCLAIMER}</p>
        </div>
      </PageWrapper>
    </section>
  )
}
