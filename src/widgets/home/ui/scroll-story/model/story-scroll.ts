export const STORY_SCROLL = {
  headerOffset: 88,
  headerOffsetMobile: 24,
  introVh: 72,
  slideVh: 88,
  releaseVh: 14,
} as const

export function storyTrackTotalVh(slideCount: number, withIntro = false) {
  const intro = withIntro ? STORY_SCROLL.introVh : 0
  return intro + slideCount * STORY_SCROLL.slideVh + STORY_SCROLL.releaseVh
}

export function storyTrackHeight(slideCount: number, withIntro = false) {
  return `${storyTrackTotalVh(slideCount, withIntro)}vh`
}

export function storyIntroShare(slideCount: number) {
  return STORY_SCROLL.introVh / storyTrackTotalVh(slideCount, true)
}

export function storySlidesProgress(progress: number, slideCount: number, withIntro = false) {
  if (!withIntro) {
    return progress
  }

  const introShare = storyIntroShare(slideCount)
  const slidesShare = (slideCount * STORY_SCROLL.slideVh) / storyTrackTotalVh(slideCount, true)

  if (progress <= introShare) {
    return 0
  }

  return Math.min(1, (progress - introShare) / slidesShare)
}

export function storySlideRange(index: number, total: number) {
  const segment = 1 / total
  const start = index * segment
  const end = (index + 1) * segment
  const pad = segment * 0.14

  return {
    start,
    enter: start + pad,
    exit: end - pad,
    end,
  }
}

export function storyIndexFromProgress(progress: number, total: number) {
  return Math.min(total - 1, Math.max(0, Math.floor(progress * total * 0.999)))
}
