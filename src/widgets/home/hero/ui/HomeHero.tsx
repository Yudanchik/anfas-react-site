import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import { sharedHeroSlides } from '@/shared/config/hero-media'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './HomeHero.module.scss'

const slides = sharedHeroSlides

const heroContent = {
  title: {
    start: 'Ремонт квартиры под ключ, который',
    accent: 'не забирает',
    end: 'вашу жизнь.',
  },
  lead:
    'Собираем дизайн, ремонт и комплектацию в один понятный процесс. Вы видите сроки, бюджет и результат без хаоса и бесконечных согласований.',
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

export function HomeHero({ onOpenBrief }: { onOpenBrief: () => void }) {
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
      <div className={styles.media} aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            key={slide.image}
            className={`${styles.slide} ${index === activeIndex ? styles.isActive : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
        <div className={styles.overlay} />
        <div className={styles.vignette} />
      </div>

      <div className={styles.sectionpad}>
        <PageWrapper>
          <div className={styles.inner}>
            <div className={styles.copy}>
              <div className={styles.textBlock}>
                <span className={styles.eyebrow}>{activeSlide.eyebrow}</span>
                <h1 className={styles.title}>
                  {heroContent.title.start} <span>{heroContent.title.accent}</span> {heroContent.title.end}
                </h1>
                <p className={styles.lead}>{heroContent.lead}</p>

                <div className={styles.actions}>
                  <button className={styles.primaryCta} type="button" onClick={() => onOpenBrief()}>
                    <span>Обсудить проект</span>
                    <i>
                      <ArrowIcon size={16} />
                    </i>
                  </button>

                  <Link className={styles.secondaryCta} to="/projects">
                    Смотреть проекты
                  </Link>
                </div>
              </div>

              <div className={styles.cards}>
                {heroContent.cards.map((card) => (
                  <article className={styles.card} key={card.label}>
                    <span>{card.label}</span>
                    <strong>{card.text}</strong>
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
