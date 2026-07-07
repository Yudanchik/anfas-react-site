import {
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  type MotionValue,
} from 'framer-motion'
import { useRef, useState } from 'react'

import { STORY_SCROLL, storyIndexFromProgress } from './model/story-scroll'

export function useStoryScrollTrack(slideCount: number) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: [`start ${STORY_SCROLL.headerOffset}px`, 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const next = storyIndexFromProgress(progress, slideCount)
    setActiveIndex((current) => (current === next ? current : next))
  })

  const progress = ((activeIndex + 1) / slideCount) * 100

  return {
    trackRef,
    activeIndex,
    progress,
    scrollYProgress,
    reduceMotion,
    slideCount,
  }
}

export type StoryScrollMotion = {
  activeIndex: number
  scrollYProgress: MotionValue<number>
  slideCount: number
  reduceMotion: boolean | null
}
