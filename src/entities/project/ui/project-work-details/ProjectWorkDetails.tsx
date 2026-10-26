import { projectWorkBlocks } from '@/entities/project/model/project-work-blocks'
import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'

import styles from './ProjectWorkDetails.module.scss'

export function ProjectWorkDetails({ details }: { details: readonly string[] }) {
  const blocks = projectWorkBlocks(details)
  if (blocks.length === 0) return null

  return (
    <section className={styles.work} aria-labelledby="project-work-title">
      <p className={styles.eyebrow}>Описание проекта</p>
      <h2 id="project-work-title">Что сделали на объекте</h2>
      <div className={styles.blocks}>
        {blocks.map((block, index) => {
          if (block.kind === 'work') {
            return (
              <div className={styles.item} key={index}>
                <h3>{tieRussianShortWords(block.title)}</h3>
                <p>{tieRussianShortWords(block.text)}</p>
              </div>
            )
          }
          return (
            <p
              className={block.kind === 'heading' ? styles.label : styles.paragraph}
              key={index}
            >
              {tieRussianShortWords(block.text)}
            </p>
          )
        })}
      </div>
    </section>
  )
}
