import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'

import styles from './ArticlePanels.module.scss'

type ArticlePanelsProps = {
  checklist: readonly string[]
  mistakes: readonly string[]
}

export function ArticlePanels({ checklist, mistakes }: ArticlePanelsProps) {
  return (
    <div className={styles.panels}>
      <article className={styles.panel}>
        <p className={styles.eyebrow}>{tieRussianShortWords('Чеклист приёмки')}</p>
        <h3>{tieRussianShortWords('Что проверить на объекте')}</h3>
        <ul>
          {checklist.map((item) => (
            <li key={item}>{tieRussianShortWords(item)}</li>
          ))}
        </ul>
      </article>

      <article className={styles.panel}>
        <p className={styles.eyebrow}>{tieRussianShortWords('Частые ошибки')}</p>
        <h3>{tieRussianShortWords('Что дорого стоит потом')}</h3>
        <ul>
          {mistakes.map((item) => (
            <li key={item}>{tieRussianShortWords(item)}</li>
          ))}
        </ul>
      </article>
    </div>
  )
}
