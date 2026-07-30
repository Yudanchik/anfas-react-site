import type { ReactNode } from 'react'

import type { ArticleSection } from '@/entities/article/model/article.types'
import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'

import styles from './ArticleSections.module.scss'

type ArticleSectionsProps = {
  sections: readonly ArticleSection[]
  injectAfter?: ReadonlyArray<{ afterIndex: number; node: ReactNode }>
}

export function ArticleSections({ sections, injectAfter = [] }: ArticleSectionsProps) {
  return (
    <>
      {sections.map((section, index) => (
        <section className={styles.section} key={section.id} id={section.id}>
          <h2>{tieRussianShortWords(section.heading)}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{tieRussianShortWords(paragraph)}</p>
          ))}
          {section.list ? (
            <ul>
              {section.list.map((item) => (
                <li key={item}>{tieRussianShortWords(item)}</li>
              ))}
            </ul>
          ) : null}
          {injectAfter
            .filter((item) => item.afterIndex === index)
            .map((item, injectIndex) => (
              <div className={styles.inject} key={`inject-${index}-${injectIndex}`}>
                {item.node}
              </div>
            ))}
        </section>
      ))}
    </>
  )
}
