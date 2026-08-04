import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import { sharedHeroSlides } from '@/shared/config/hero-media'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './HomeHero.module.scss'

const slides = sharedHeroSlides

const heroContent = {
  title: {
    main: 'Ремонт квартиры под ключ',
    accent: 'с понятным бюджетом, сроком и результатом',
  },
  lead: 'Берём на себя весь процесс — от дизайн-проекта и ремонта до комплектации и мебели. Вы заранее понимаете, сколько будет стоить квартира, когда она будет готова и какой результат получите.',
} as const

export function HomeHero() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 6000)

    return () => window.clearInterval(intervalId)
  }, [])

  const activeSlide = slides[activeIndex]

  return (
    <section className={styles.hero} id="top">
      <div className={styles.hero__media}>
        {slides.map((slide, index) => {
          const isActive = index === activeIndex
          const isLcpSlide = index === 0

          return (
            <div
              key={slide.image}
              className={`${styles.hero__slide} ${isActive ? styles.hero__slide_active : ''}`}
              aria-hidden={!isActive}
            >
              <img
                className={styles.hero__slideImage}
                src={slide.image}
                alt={isActive ? slide.alt : ''}
                width={slide.width}
                height={slide.height}
                loading={isLcpSlide ? 'eager' : 'lazy'}
                fetchPriority={isLcpSlide ? 'high' : 'auto'}
                decoding={isLcpSlide ? 'sync' : 'async'}
              />
            </div>
          )
        })}
        <div className={styles.hero__overlay} />
        <div className={styles.hero__vignette} />
      </div>

      <div className={styles.hero__sectionPad}>
        <PageWrapper>
          <div className={styles.hero__inner}>
            <div className={styles.hero__copy}>
              <span className={styles.hero__eyebrow}>{activeSlide.eyebrow}</span>
              <div className={styles.hero__textBlock}>
                <h1 className={styles.hero__title}>
                  {heroContent.title.main}
                  <br />
                  <span className={styles.hero__titleAccent}>{heroContent.title.accent}</span>
                </h1>
                <p className={styles.hero__lead}>{heroContent.lead}</p>

                <div className={styles.hero__actions}>
                  <ModalTriggerButton
                    className={styles.hero__primaryCta}
                    intent="consultation"
                    size="lg"
                    source="home-hero"
                  >
                    Обсудить проект
                  </ModalTriggerButton>

                  <Link className={styles.hero__secondaryCta} to="/projects">
                    Смотреть проекты
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </PageWrapper>
      </div>
    </section>
  )
}
