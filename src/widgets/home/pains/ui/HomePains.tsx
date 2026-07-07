import type { CSSProperties } from 'react'

import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { SectionHeader } from '../../ui'
import {
  StoryProgressFill,
  StorySlideLayer,
  storyTrackHeight,
  useStoryScrollTrack,
} from '../../ui/scroll-story'
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
  const slideCount = pains.items.length
  const { trackRef, activeIndex, progress, scrollYProgress, reduceMotion } =
    useStoryScrollTrack(slideCount)
  const activeItem = pains.items[activeIndex]

  return (
    <section id="pains" className={styles.pains + ' ' + styles.sectionpad}>
      <SectionHeader
        number="01"
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

      <div
        className={styles.storytrack}
        ref={trackRef}
        style={{ '--story-slides': slideCount, height: storyTrackHeight(slideCount) } as CSSProperties}
      >
        <div className={styles.sticky}>
          <div className={styles.top}>
            <span className={styles.counter}>
              <span className={styles.counterNow}>{activeItem.number}</span>
              <span className={styles.counterOf}>/ {String(slideCount).padStart(2, '0')}</span>
            </span>
            <div className={styles.rail} aria-hidden="true">
              <StoryProgressFill
                className={styles.railFill}
                scrollYProgress={scrollYProgress}
                reduceMotion={reduceMotion}
                fallbackWidth={`${progress}%`}
              />
            </div>
            <span className={styles.progressText}>Страх · {activeItem.label}</span>
          </div>

          <div className={styles.grid}>
            <div className={styles.left}>
              <div className={styles.quoteStack}>
                {pains.items.map((pain, index) => (
                  <StorySlideLayer
                    key={pain.number}
                    index={index}
                    total={slideCount}
                    activeIndex={activeIndex}
                    scrollYProgress={scrollYProgress}
                    reduceMotion={reduceMotion}
                    className={styles.quote}
                    variant="rise"
                  >
                    <span className={styles.quoteNum}>
                      {pain.number} · {pain.label}
                    </span>
                    <p className={styles.quoteText}>{pain.quote}</p>
                  </StorySlideLayer>
                ))}
              </div>
            </div>

            <aside className={styles.right}>
              <div className={styles.solveStack}>
                {pains.items.map((pain, index) => (
                  <StorySlideLayer
                    key={pain.number}
                    index={index}
                    total={slideCount}
                    activeIndex={activeIndex}
                    scrollYProgress={scrollYProgress}
                    reduceMotion={reduceMotion}
                    className={styles.solve}
                    variant="fade"
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
                  </StorySlideLayer>
                ))}
              </div>

              <div className={styles.ctaRow}>
                <button className={styles.cta} type="button" onClick={onOpenBrief}>
                  <span>Закрыть все 6 страхов разом</span>
                  <i>
                    <ArrowIcon size={16} />
                  </i>
                </button>
                <span className={styles.ctaHint}>— оставьте заявку, перезвоним за час</span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
