export const STORY_SCROLL = {
  headerOffset: 88,
  slideVh: 88,
  releaseVh: 14,
} as const

export function storyTrackHeight(slideCount: number) {
  return `calc(${slideCount} * ${STORY_SCROLL.slideVh}vh + ${STORY_SCROLL.releaseVh}vh)`
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
