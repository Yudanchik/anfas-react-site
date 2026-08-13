import { useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { youtubeVideos } from '@/shared/content/youtube'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '@/widgets/home/ui'

import { YoutubeVideoCard } from './YoutubeVideoCard'
import styles from './AboutVideos.module.scss'
import 'swiper/css'

export function AboutVideos() {
  const swiperRef = useRef<SwiperInstance | null>(null)
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)

  const syncNavState = (swiper: SwiperInstance) => {
    setIsBeginning(swiper.isBeginning)
    setIsEnd(swiper.isEnd)
  }

  return (
    <section className={styles.section} aria-labelledby="about-videos-title">
      <PageWrapper>
        <SectionHeader
          className={styles.header}
          reveal={false}
          tone="dark"
          titleId="about-videos-title"
          title={
            <>
              Показываем ремонт <em>без постановки</em>
            </>
          }
          lead="На видео показываем реальные ремонты квартир в Санкт-Петербурге: демонтаж, инженерные и черновые работы, подбор материалов, промежуточные этапы и готовые интерьеры."
          titleClassName={styles.title}
          leadClassName={styles.lead}
        />

        <div className={styles.sliderWrap}>
          <div className={styles.sliderControls}>
            <div className={styles.sliderButtons}>
              <button
                className={`${styles.sliderButton} ${styles.sliderButtonPrev}`}
                type="button"
                aria-label="Предыдущее видео"
                disabled={isBeginning}
                onClick={() => swiperRef.current?.slidePrev()}
              >
                <ArrowIcon size={15} />
              </button>
              <button
                className={`${styles.sliderButton} ${styles.sliderButtonNext}`}
                type="button"
                aria-label="Следующее видео"
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
              1100: { slidesPerView: 3, spaceBetween: 24 },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper
              syncNavState(swiper)
            }}
            onSlideChange={syncNavState}
            onResize={syncNavState}
            onBreakpoint={syncNavState}
          >
            {youtubeVideos.map((video) => (
              <SwiperSlide className={styles.slide} key={video.id}>
                <YoutubeVideoCard video={video} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </PageWrapper>
    </section>
  )
}
