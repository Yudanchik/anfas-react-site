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
const MOBILE_SCROLL_QUERY = '(max-width: 900px)'

function getScrollHeaderOffset() {
  if (typeof window === 'undefined') {
    return STORY_SCROLL.headerOffset
  }

  return window.matchMedia(MOBILE_SCROLL_QUERY).matches
    ? STORY_SCROLL.headerOffsetMobile
    : STORY_SCROLL.headerOffset
}

export function useStoryScrollTrack(slideCount: number, options?: { withIntro?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [withIntro, setWithIntro] = useState(false)
  const [headerOffset, setHeaderOffset] = useState(getScrollHeaderOffset)
  const reduceMotion = useReducedMotion()
  const enableIntro = options?.withIntro !== false

  useEffect(() => {
    const introMedia = window.matchMedia(DESKTOP_INTRO_QUERY)
    const scrollMedia = window.matchMedia(MOBILE_SCROLL_QUERY)

    const update = () => {
      setWithIntro(enableIntro && introMedia.matches)
      setHeaderOffset(
        scrollMedia.matches ? STORY_SCROLL.headerOffsetMobile : STORY_SCROLL.headerOffset,
      )
    }

    update()
    introMedia.addEventListener('change', update)
    scrollMedia.addEventListener('change', update)

    return () => {
      introMedia.removeEventListener('change', update)
      scrollMedia.removeEventListener('change', update)
    }
  }, [enableIntro])

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: [`start ${headerOffset}px`, 'end end'],
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
