import { useRef, type MouseEvent } from 'react'
import { Link } from 'react-router'

import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

export function HomeHero({ onOpenBrief }: { onOpenBrief: () => void }) {
  const heroRef = useRef<HTMLElement>(null)

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
<section id="top" className="hero" ref={heroRef} onMouseMove={handleHeroMove}>
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-wash" aria-hidden="true" />
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">
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
            <p className="hero-lead">
              Проектируем и реализуем пространства, в которых красиво не только на рендерах, но и
              каждый день.
            </p>
            <button className="primary-button" type="button" onClick={onOpenBrief}>
              <span>Обсудить проект</span>
              <i>
                <ArrowIcon />
              </i>
            </button>
          </div>

          <div className="hero-side">
            <div className="hero-badge">
              <span>Дизайн</span>
              <span>Ремонт</span>
              <span>Комплектация</span>
            </div>
            <Link className="hero-case-link" to="/projects">
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

        <div className="hero-meta">
          <span>59.9343° N</span>
          <span>30.3351° E</span>
          <span className="scroll-note">
            Листайте вниз <i />
          </span>
        </div>
      </section>

      
  )
}
