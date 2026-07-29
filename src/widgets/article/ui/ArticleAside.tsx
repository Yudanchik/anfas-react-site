import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import type { ArticleSection } from '@/entities/article/model/article.types'
import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import styles from './ArticleAside.module.scss'

type ArticleAsideProps = {
  sections: readonly ArticleSection[]
  serviceHref: string
  serviceLabel: string
}

export function ArticleAside({ sections, serviceHref, serviceLabel }: ArticleAsideProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const ids = sections.map((section) => section.id)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) {
      return
    }

    const visible = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio)
          } else {
            visible.delete(entry.target.id)
          }
        }

        if (visible.size === 0) {
          return
        }

        const nextActive = [...visible.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
        if (nextActive) {
          setActiveId(nextActive)
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    for (const element of elements) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [sections])

  return (
    <aside className={styles.aside}>
      <div className={`${styles.card} ${styles.navCard}`}>
        <span>{tieRussianShortWords('Навигация по статье')}</span>
        <nav aria-label="Содержание статьи">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={section.id === activeId ? styles.active : undefined}
              aria-current={section.id === activeId ? 'true' : undefined}
            >
              {tieRussianShortWords(section.heading)}
            </a>
          ))}
        </nav>
      </div>

      <div className={styles.card}>
        <span>{tieRussianShortWords('Связанная услуга')}</span>
        <p className={styles.cardTitle}>{tieRussianShortWords(serviceLabel)}</p>
        <p>
          {tieRussianShortWords(
            'Если нужна команда и понятный график — переходите к формату работ.',
          )}
        </p>
        <Link to={serviceHref}>
          Открыть услугу
          <ArrowIcon size={14} />
        </Link>
      </div>

      <div className={styles.card}>
        <span>{tieRussianShortWords('Примеры работ')}</span>
        <p className={styles.cardTitle}>{tieRussianShortWords('Реализованные проекты')}</p>
        <p>
          {tieRussianShortWords(
            'Посмотрите, как инженерия и комплектация выглядят в готовых квартирах.',
          )}
        </p>
        <Link to="/projects">
          Смотреть проекты
          <ArrowIcon size={14} />
        </Link>
      </div>
    </aside>
  )
}
