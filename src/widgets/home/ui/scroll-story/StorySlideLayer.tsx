import { motion, useTransform, type MotionValue } from 'framer-motion'
import type { ReactNode } from 'react'

import { storySlideRange } from './model/story-scroll'

type StorySlideLayerProps = {
  index: number
  total: number
  activeIndex: number
  scrollYProgress: MotionValue<number>
  reduceMotion: boolean | null
  className?: string
  children: ReactNode
  variant?: 'fade' | 'rise' | 'scene'
}

export function StorySlideLayer({
  index,
  total,
  activeIndex,
  scrollYProgress,
  reduceMotion,
  className,
  children,
  variant = 'fade',
}: StorySlideLayerProps) {
  const { start, enter, exit, end } = storySlideRange(index, total)

  const opacity = useTransform(scrollYProgress, [start, enter, exit, end], [0, 1, 1, 0], {
    clamp: true,
  })

  const y = useTransform(
    scrollYProgress,
    [start, enter, exit, end],
    variant === 'rise' ? [40, 0, 0, -16] : variant === 'scene' ? [28, 0, 0, -12] : [24, 0, 0, -12],
    { clamp: true },
  )

  const scale = useTransform(
    scrollYProgress,
    [start, enter, exit, end],
    variant === 'scene' ? [1.08, 1, 1, 0.98] : [1, 1, 1, 1],
    { clamp: true },
  )

  const blur = useTransform(opacity, (value) => `blur(${(1 - value) * (variant === 'scene' ? 10 : 8)}px)`)

  if (reduceMotion) {
    if (index !== activeIndex) return null

    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      style={{
        opacity,
        y,
        scale,
        filter: blur,
      }}
    >
      {children}
    </motion.div>
  )
}

type StoryProgressFillProps = {
  scrollYProgress: MotionValue<number>
  reduceMotion: boolean | null
  fallbackWidth: string
  className?: string
}

export function StoryProgressFill({
  scrollYProgress,
  reduceMotion,
  fallbackWidth,
  className,
}: StoryProgressFillProps) {
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  if (reduceMotion) {
    return <div className={className} style={{ width: fallbackWidth }} />
  }

  return <motion.div className={className} style={{ width }} />
}
