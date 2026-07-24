import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import { sharedHeroSlides } from '@/shared/config/hero-media'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './HomeHero.module.scss'

const slides = sharedHeroSlides

const heroContent = {
  title: {
    start: 'Ремонт квартиры под ключ, который',
    accent: 'не забирает',
    end: 'вашу жизнь.',
  },
  lead: 'Собираем дизайн, ремонт и комплектацию в один понятный процесс. Вы видите сроки, бюджет и результат без хаоса и бесконечных согласований.',
  cards: [
    {
      label: 'Дизайн-проект',
      text: 'Собираем образ пространства до старта работ.',
    },
    {
      label: 'Комплектация',
      text: 'Материалы, свет и мебель в одной системе.',
    },
    {
      label: 'Реализация',
      text: 'Одна команда доводит объект до финала.',
    },
  ],
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
                  {heroContent.title.start}{' '}
                  <span className={styles.hero__titleAccent}>{heroContent.title.accent}</span>{' '}
                  {heroContent.title.end}
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

              <div className={styles.hero__cards}>
                {heroContent.cards.map((card) => (
                  <article className={styles.hero__card} key={card.label}>
                    <span className={styles.hero__cardLabel}>{card.label}</span>
                    <strong className={styles.hero__cardText}>{card.text}</strong>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </PageWrapper>
      </div>
    </section>
  )
}
