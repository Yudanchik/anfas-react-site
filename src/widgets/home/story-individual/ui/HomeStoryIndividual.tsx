import type { CSSProperties } from 'react'

import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { SectionHeader } from '../../ui'
import {
  StoryDockedHeader,
  StoryProgressFill,
  StorySlideLayer,
  useStoryScrollTrack,
} from '../../ui/scroll-story'
import { storyIndividual } from '../model/story-individual.data'

import styles from './HomeStoryIndividual.module.scss'

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

export function HomeStoryIndividual({ onOpenBrief }: { onOpenBrief: () => void }) {
  const slideCount = storyIndividual.scenes.length
  const {
    trackRef,
    activeIndex,
    progress,
    scrollYProgress,
    slidesScrollYProgress,
    introShare,
    trackHeight,
    reduceMotion,
  } = useStoryScrollTrack(slideCount)

  return (
    <section className={styles.story + ' ' + styles.sectionpad}>
      <div
        className={styles.storytrack}
        ref={trackRef}
        style={{ '--story-slides': slideCount, height: trackHeight } as CSSProperties}
      >
        <div className={styles.sticky}>
          <div className={styles.layout}>
            <div className={styles.leftColumn}>
              <StoryDockedHeader
                className={styles.storyHeader}
                scrollYProgress={scrollYProgress}
                introShare={introShare}
                reduceMotion={reduceMotion}
              >
                <SectionHeader
                  number="05"
                  label={storyIndividual.eyebrow}
                  title={<>{renderMultiline(storyIndividual.title)}</>}
                  lead={storyIndividual.lead}
                  tone="dark"
                  reveal={false}
                />
              </StoryDockedHeader>

              <div className={styles.visual}>
                {storyIndividual.scenes.map((scene, index) => (
                  <StorySlideLayer
                    key={scene.label}
                    index={index}
                    total={slideCount}
                    activeIndex={activeIndex}
                    scrollYProgress={slidesScrollYProgress}
                    reduceMotion={reduceMotion}
                    className={styles.scene}
                    variant="scene"
                  >
                    <span className={styles.photoLabel}>{scene.label}</span>
                  </StorySlideLayer>
                ))}
              </div>
            </div>

            <aside className={styles.side}>
              <div className={styles.counter}>
                <span className={styles.counterNow}>{String(activeIndex + 1).padStart(2, '0')}</span>
                <span className={styles.counterOf}>/ {String(slideCount).padStart(2, '0')}</span>
              </div>
              <div className={styles.rail} aria-hidden="true">
                <StoryProgressFill
                  className={styles.railFill}
                  scrollYProgress={slidesScrollYProgress}
                  reduceMotion={reduceMotion}
                  fallbackWidth={`${progress}%`}
                />
              </div>

              <div className={styles.captions}>
                {storyIndividual.scenes.map((scene, index) => (
                  <StorySlideLayer
                    key={scene.label}
                    index={index}
                    total={slideCount}
                    activeIndex={activeIndex}
                    scrollYProgress={slidesScrollYProgress}
                    reduceMotion={reduceMotion}
                    className={styles.caption}
                    variant="fade"
                  >
                    <h4 className={styles.captionTitle}>{scene.title}</h4>
                    <p className={styles.captionText}>{scene.text}</p>
                  </StorySlideLayer>
                ))}
              </div>

              <button className={styles.cta} type="button" onClick={onOpenBrief}>
                <span>Хочу так же</span>
                <i>
                  <ArrowIcon size={16} />
                </i>
              </button>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
