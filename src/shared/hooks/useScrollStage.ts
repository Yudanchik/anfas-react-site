import { useEffect, useState, type RefObject } from 'react'

function pickActiveAnchor(anchors: HTMLElement[]) {
  const viewportCenter = window.innerHeight * 0.5
  let bestIndex = 0
  let bestDistance = Number.POSITIVE_INFINITY

  anchors.forEach((anchor, index) => {
    const rect = anchor.getBoundingClientRect()
    const anchorCenter = rect.top + rect.height / 2
    const distance = Math.abs(anchorCenter - viewportCenter)

    if (rect.bottom > 0 && rect.top < window.innerHeight && distance < bestDistance) {
      bestDistance = distance
      bestIndex = index
    }
  })

  return bestIndex
}

export function useScrollStage(
  stageRef: RefObject<HTMLElement | null>,
  anchorsRef: RefObject<(HTMLElement | null)[]>,
) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const stage = stageRef.current
    const anchors = anchorsRef.current?.filter(Boolean) as HTMLElement[] | undefined
    if (!stage || !anchors?.length) return

    const update = () => {
      const stageRect = stage.getBoundingClientRect()
      if (stageRect.bottom < 0 || stageRect.top > window.innerHeight) return
      setActiveIndex(pickActiveAnchor(anchors))
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((entry) => entry.isIntersecting)
        if (intersecting.length) {
          const best = intersecting.reduce((currentBest, entry) =>
            entry.intersectionRatio > currentBest.intersectionRatio ? entry : currentBest,
          )
          const indexAttr = (best.target as HTMLElement).getAttribute('data-index')
          if (indexAttr) setActiveIndex(Number(indexAttr))
          return
        }
        update()
      },
      {
        rootMargin: '-35% 0px -35% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    anchors.forEach((anchor) => observer.observe(anchor))
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [anchorsRef, stageRef])

  return activeIndex
}
