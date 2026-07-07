import { useMemo, useRef } from 'react'

import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { useScrollStage } from '@/shared/hooks/useScrollStage'
import { SectionHeader } from '../../ui'
import { storyCapsule } from '../model/story-capsule.data'

import styles from './HomeStoryCapsule.module.scss'

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

export function HomeStoryCapsule({ onOpenBrief }: { onOpenBrief: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const anchorsRef = useRef<Array<HTMLDivElement | null>>([])
  const activeIndex = useScrollStage(stageRef, anchorsRef)

  const total = storyCapsule.scenes.length
  const progress = useMemo(() => ((activeIndex + 1) / total) * 100, [activeIndex, total])

  return (
    <section className={styles.story + ' ' + styles.sectionpad}>
      <SectionHeader
        number="06"
        label={storyCapsule.eyebrow}
        title={<>{renderMultiline(storyCapsule.title)}</>}
        lead={storyCapsule.lead}
      />

      <div className={styles.stage} ref={stageRef}>
        <div className={styles.sticky}>
          <div className={styles.layout}>
            <div className={styles.visual}>
              {storyCapsule.scenes.map((scene, index) => (
                <div
                  key={scene.label}
                  className={styles.scene + (index === activeIndex ? ' ' + styles.sceneActive : '')}
                  data-index={index}
                >
                  <span className={styles.photoLabel}>{scene.label}</span>
                </div>
              ))}
            </div>

            <aside className={styles.side}>
              <div className={styles.counter}>
                <span className={styles.counterNow}>{String(activeIndex + 1).padStart(2, '0')}</span>
                <span className={styles.counterOf}>/ {String(total).padStart(2, '0')}</span>
              </div>
              <div className={styles.rail} aria-hidden="true">
                <div className={styles.railFill} style={{ width: `${progress}%` }} />
              </div>

              <div className={styles.captions}>
                {storyCapsule.scenes.map((scene, index) => (
                  <div
                    key={scene.label}
                    className={styles.caption + (index === activeIndex ? ' ' + styles.captionActive : '')}
                    data-index={index}
                  >
                    <h4 className={styles.captionTitle}>{scene.title}</h4>
                    <p className={styles.captionText}>{scene.text}</p>
                  </div>
                ))}
              </div>

              <button className={styles.cta} type="button" onClick={onOpenBrief}>
                <span>Обсудить капсулу</span>
                <i>
                  <ArrowIcon size={16} />
                </i>
              </button>
            </aside>
          </div>
        </div>

        <div className={styles.anchors} aria-hidden="true">
          {storyCapsule.scenes.map((_, index) => (
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
