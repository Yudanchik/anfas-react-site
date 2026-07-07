import { useMemo, useRef } from 'react'

import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { useScrollStage } from '@/shared/hooks/useScrollStage'
import { SectionHeader } from '../../ui'
import { pains } from '../model/pains.data'

import styles from './HomePains.module.scss'

function renderMultiline(text: string) {
  const lines = text.split('\n')
  return lines.map((line, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: Static presentation text
    <span key={index}>
      {line}
      {index === lines.length - 1 ? null : <br />}
    </span>
  ))
}

export function HomePains({ onOpenBrief }: { onOpenBrief: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const anchorsRef = useRef<Array<HTMLDivElement | null>>([])
  const activeIndex = useScrollStage(stageRef, anchorsRef)

  const total = pains.items.length
  const activeItem = pains.items[activeIndex]

  const progress = useMemo(() => ((activeIndex + 1) / total) * 100, [activeIndex, total])

  return (
    <section id="pains" className={styles.pains + ' ' + styles.sectionpad}>
      <div className={styles.intro} data-reveal>
        <SectionHeader
          number="04"
          label={pains.eyebrow}
          title={
            <>
              Ремонт пугает.
              <br />
              Мы знаем — <em>почему.</em>
            </>
          }
          lead={pains.lead}
        />
      </div>

      <div className={styles.stage} ref={stageRef}>
        <div className={styles.sticky}>
          <div className={styles.top}>
            <span className={styles.counter}>
              <span className={styles.counterNow}>{activeItem.number}</span>
              <span className={styles.counterOf}>/ {String(total).padStart(2, '0')}</span>
            </span>
            <div className={styles.rail} aria-hidden="true">
              <div className={styles.railFill} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.progressText}>Страх · {activeItem.label}</span>
          </div>

          <div className={styles.grid}>
            <div className={styles.left}>
              {pains.items.map((pain, index) => (
                <div
                  key={pain.number}
                  className={styles.quote + (index === activeIndex ? ' ' + styles.quoteActive : '')}
                  data-index={index}
                >
                  <span className={styles.quoteNum}>
                    {pain.number} · {pain.label}
                  </span>
                  <p className={styles.quoteText}>{pain.quote}</p>
                </div>
              ))}
            </div>

            <div className={styles.right}>
              {pains.items.map((pain, index) => (
                <div
                  key={pain.number}
                  className={styles.solve + (index === activeIndex ? ' ' + styles.solveActive : '')}
                  data-index={index}
                >
                  <span className={styles.solveTag}>Решение Anfas</span>
                  <h3 className={styles.solveTitle}>{renderMultiline(pain.solveTitle)}</h3>
                  <p className={styles.solveText}>{pain.solveText}</p>
                  <div className={styles.solveStats}>
                    {pain.stats.map((stat) => (
                      <div className={styles.solveStat} key={stat.label}>
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className={styles.ctaRow}>
                <button className={styles.cta} type="button" onClick={onOpenBrief}>
                  <span>Закрыть все 6 страхов разом</span>
                  <i>
                    <ArrowIcon size={16} />
                  </i>
                </button>
                <span className={styles.ctaHint}>— оставьте заявку, перезвоним за час</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.anchors} aria-hidden="true">
          {pains.items.map((_, index) => (
            <div
              key={index}
              className={styles.anchor}
              data-index={index}
              ref={(el) => {
                anchorsRef.current[index] = el
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
