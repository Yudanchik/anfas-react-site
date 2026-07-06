import { processSteps } from '@/entities/process/model/process.data'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import type { CSSProperties } from 'react'

import { SectionHeader } from '../../ui'
import styles from './HomeProcess.module.scss'

export function HomeProcess({ onOpenBrief }: { onOpenBrief: () => void }) {
  return (
    <section id="process" className={styles.process + ' ' + styles.sectionpad}>
      <div className={styles.processintro}>
        <SectionHeader
          number="07"
          label="Как всё устроено"
          title={
            <>
              Пять понятных
              <br />
              шагов до <em>дома.</em>
            </>
          }
          lead="Без туманных формулировок и «разберёмся по ходу». Каждый этап имеет результат, срок и ответственного."
        />
        <div className={styles.processvisual} data-reveal aria-label="Плейсхолдер визуала приложения">
          <span className={styles.processvisualtag}>Скоро</span>
          <p className={styles.processvisualtext}>
            Скрин интерфейса с этапами, фото, отчётами и комментариями с объекта.
          </p>
        </div>
        <button className={styles.processcta} type="button" onClick={onOpenBrief} data-reveal>
          <span>Начать с первого шага</span>
          <ArrowIcon size={16} />
        </button>
      </div>

      <div className={styles.processsteps}>
        {processSteps.map((step, index) => (
          <article
            className={styles.processstep}
            key={step.title}
            data-reveal
            style={
              {
                '--reveal-delay': `${index * 100}ms`,
                '--step-index': index,
              } as CSSProperties
            }
          >
            <div className={styles.processstepicon} aria-hidden="true">
              <span className={styles.processstepmark}>{step.mark}</span>
            </div>
            <div className={styles.processstepbody}>
              <h3 className={styles.processsteptitle}>{step.title}</h3>
              <p className={styles.processsteptext}>{step.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
