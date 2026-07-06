import { useRef, type MouseEvent } from 'react'
import { Link } from 'react-router'

import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import styles from './HomeHero.module.scss'

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
    <section id="top" className={styles.hero} ref={heroRef} onMouseMove={handleHeroMove}>
      <div className={styles.heroimage} aria-hidden="true" />
      <div className={styles.herowash} aria-hidden="true" />
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
          <p className={styles.herolead}>
            Проектируем и реализуем пространства, в которых красиво не только на рендерах, но и
            каждый день.
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
