import { processSteps } from '@/entities/process/model/process.data'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { type CSSProperties, useRef } from 'react'

import { PROCESS_STACK, cardSegmentRange, easeInOutCubic, targetScale } from '../model/process.stack'
import styles from './HomeProcess.module.scss'

type ProcessStackCardProps = {
  index: number
  total: number
  scrollYProgress: MotionValue<number>
  mark: string
  title: string
  text: string
}

function ProcessStackCard({
  index,
  total,
  scrollYProgress,
  mark,
  title,
  text,
}: ProcessStackCardProps) {
  const reduceMotion = useReducedMotion()
  const { start, end } = cardSegmentRange(index, total)
  const minScale = targetScale(index, total)

  const settle = useTransform(scrollYProgress, [start, end], [0, 1], { clamp: true })
  const scale = useTransform(settle, (value) => 1 - easeInOutCubic(value) * (1 - minScale))

  return (
    <article
      className={styles.processstep}
      style={{ '--step-i': index } as CSSProperties}
    >
      <motion.div
        className={styles.processstepinner}
        style={
          reduceMotion
            ? undefined
            : {
                scale,
                transformOrigin: 'top center',
              }
        }
      >
        <div className={styles.processstephead}>
          <h3 className={styles.processsteptitle}>{title}</h3>
          <span className={styles.processstepmark}>{mark}</span>
        </div>
        <p className={styles.processsteptext}>{text}</p>
      </motion.div>
    </article>
  )
}

export function HomeProcessStack() {
  const trackRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const frozenHeightRef = useRef(false)

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: [`start ${PROCESS_STACK.base}px`, 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const track = trackRef.current
    const viewport = viewportRef.current
    if (!track || !viewport) return

    const shouldHold = progress >= PROCESS_STACK.stackPhase - 0.004

    if (shouldHold) {
      track.setAttribute('data-stack-hold', '')

      if (!frozenHeightRef.current) {
        const articles = viewport.querySelectorAll('article')
        const first = articles[0]?.getBoundingClientRect()
        const last = articles[articles.length - 1]?.getBoundingClientRect()

        if (first && last) {
          viewport.style.setProperty('--stack-frozen-height', `${last.bottom - first.top}px`)
        }

        frozenHeightRef.current = true
      }

      return
    }

    track.removeAttribute('data-stack-hold')
    viewport.style.removeProperty('--stack-frozen-height')
    frozenHeightRef.current = false
  })

  if (reduceMotion) {
    return (
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
    )
  }

  return (
    <div className={styles.processtrack} ref={trackRef}>
      <div className={styles.processstackviewport} ref={viewportRef}>
        {processSteps.map((step, index) => (
          <ProcessStackCard
            key={step.title}
            index={index}
            total={processSteps.length}
            scrollYProgress={scrollYProgress}
            mark={step.mark}
            title={step.title}
            text={step.text}
          />
        ))}
      </div>
      <div className={styles.processstackrelease} aria-hidden="true" />
    </div>
  )
}
