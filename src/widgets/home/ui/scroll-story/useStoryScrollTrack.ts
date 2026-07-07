import {
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import {
  STORY_SCROLL,
  storyIndexFromProgress,
  storyIntroShare,
  storySlidesProgress,
  storyTrackHeight,
} from './model/story-scroll'

const DESKTOP_INTRO_QUERY = '(min-width: 901px)'

export function useStoryScrollTrack(slideCount: number, options?: { withIntro?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [withIntro, setWithIntro] = useState(false)
  const reduceMotion = useReducedMotion()
  const enableIntro = options?.withIntro !== false

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_INTRO_QUERY)
    const update = () => setWithIntro(enableIntro && media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [enableIntro])

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: [`start ${STORY_SCROLL.headerOffset}px`, 'end end'],
  })

  const slidesScrollYProgress = useTransform(scrollYProgress, (progress) =>
    storySlidesProgress(progress, slideCount, withIntro),
  )

  const introShare = withIntro ? storyIntroShare(slideCount) : 0

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const slidesProgress = storySlidesProgress(progress, slideCount, withIntro)
    const next = storyIndexFromProgress(slidesProgress, slideCount)
    setActiveIndex((current) => (current === next ? current : next))
  })

  const progress = ((activeIndex + 1) / slideCount) * 100

  return {
    trackRef,
    activeIndex,
    progress,
    scrollYProgress,
    slidesScrollYProgress,
    introShare,
    withIntro,
    trackHeight: storyTrackHeight(slideCount, withIntro),
    reduceMotion,
    slideCount,
  }
}

export type StoryScrollMotion = {
  activeIndex: number
  scrollYProgress: MotionValue<number>
  slidesScrollYProgress: MotionValue<number>
  introShare: number
  slideCount: number
  reduceMotion: boolean | null
}
