import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { processSteps } from '@/entities/process/model/process.data'
import { useEffect, useState, type CSSProperties } from 'react'

import { SectionHeader } from '../../ui'
import { HomeProcessStack } from './HomeProcessStack'
import styles from './HomeProcess.module.scss'

export function HomeProcess({ onOpenBrief }: { onOpenBrief: () => void }) {
  const [isDesktopStack, setIsDesktopStack] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 821px)')
    const sync = () => setIsDesktopStack(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

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

      {isDesktopStack ? (
        <HomeProcessStack />
      ) : (
        <div className={styles.processstepslist}>
          {processSteps.map((step, index) => (
            <article
              className={styles.processstep}
              key={step.title}
              data-reveal
              style={{ '--reveal-delay': `${index * 100}ms` } as CSSProperties}
            >
              <div className={styles.processstepinner}>
                <div className={styles.processstephead}>
                  <h3 className={styles.processsteptitle}>{step.title}</h3>
                  <span className={styles.processstepmark}>{step.mark}</span>
                </div>
                <p className={styles.processsteptext}>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
