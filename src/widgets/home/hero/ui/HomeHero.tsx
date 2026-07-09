import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link } from 'react-router'

import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './HomeHero.module.scss'

const heroSlides = [
  {
    src: '/images/hero/hero-living.png',
    alt: 'Светлая гостиная в премиальном интерьере после ремонта',
  },
  {
    src: '/images/hero/hero-kitchen.png',
    alt: 'Дорогая кухня с каменным островом и мягким светом',
  },
  {
    src: '/images/hero/hero-bedroom.png',
    alt: 'Спальня в спокойной люксовой отделке',
  },
] as const

export function HomeHero({ onOpenBrief }: { onOpenBrief: () => void }) {
  const heroRef = useRef<HTMLElement>(null)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [])

  const handleHeroMove = (event: MouseEvent<HTMLElement>) => {
    const hero = heroRef.current

    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const rect = hero.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5

    hero.style.setProperty('--mouse-x', `${x * 18}px`)
    hero.style.setProperty('--mouse-y', `${y * 14}px`)
  }

  return (
    <section id="top" className={styles.hero} ref={heroRef} onMouseMove={handleHeroMove}>
      <div className={styles.heroMedia} aria-hidden="true">
        {heroSlides.map((slide, index) => (
          <div
            className={[
              styles.heroSlide,
              index === activeSlide ? styles.heroSlideActive : '',
            ]
              .filter(Boolean)
              .join(' ')}
            key={slide.src}
          >
            <img className={styles.heroSlideImage} src={slide.src} alt={slide.alt} />
          </div>
        ))}
      </div>
      <div className={styles.herowash} aria-hidden="true" />

      <PageWrapper className={styles.heroWrapper}>
        <div className={styles.herogrid}>
          <div className={styles.herocopy}>
            <p className={styles.heroeyebrow}>
              <span />
              Санкт-Петербург · с 2012 года
            </p>
            <h1>
              Интерьер,
              <br />
              который <em>выглядит</em>
              <br />
              как вы
            </h1>
            <div className={styles.heroBackdrop}>
              <p className={styles.herolead}>
                Проектируем и реализуем пространства, в которых красиво не только на рендерах, но
                и каждый день.
              </p>
              <div className={styles.herofeatures} aria-label="Ключевые преимущества">
                <div>
                  <strong>Сроки</strong>
                  <span>Понятный план работ и прозрачные этапы</span>
                </div>
                <div>
                  <strong>Контроль</strong>
                  <span>Фото, отчёты и связь с объектом без хаоса</span>
                </div>
                <div>
                  <strong>Формат</strong>
                  <span>Дизайн-проект или пакетное решение под задачу</span>
                </div>
              </div>
            </div>
            <button className={styles.primarybutton} type="button" onClick={onOpenBrief}>
              <span>Обсудить проект</span>
              <i>
                <ArrowIcon />
              </i>
            </button>
          </div>

          <div className={styles.heroside}>
            <div className={styles.herobadge}>
              <span>Дизайн</span>
              <span>Ремонт</span>
              <span>Комплектация</span>
            </div>
            <Link className={styles.herocaselink} to="/projects">
              <span>
                Смотреть
                <br />
                проекты
              </span>
              <i>
                <ArrowIcon />
              </i>
            </Link>
          </div>
        </div>
      </PageWrapper>

      <div className={styles.herometa}>
        <span>59.9343° N</span>
        <span>30.3351° E</span>
        <span className={styles.scrollnote}>
          Листайте вниз <i />
        </span>
      </div>
    </section>
  )
}
