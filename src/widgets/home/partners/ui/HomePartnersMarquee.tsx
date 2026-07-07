import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'

import styles from './HomePartners.module.scss'

const MARQUEE_SPEED = 48
const MIN_COPIES = 2

type Partner = {
  name: string
  label: string
}

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <article className={styles.card}>
      <span>{partner.name}</span>
      <small>{partner.label}</small>
    </article>
  )
}

function measureSegmentWidth(track: HTMLDivElement, itemCount: number) {
  const gap = Number.parseFloat(getComputedStyle(track).gap) || 0
  let width = 0

  for (let index = 0; index < itemCount; index += 1) {
    const child = track.children[index] as HTMLElement | undefined
    if (!child) return 0
    width += child.offsetWidth + gap
  }

  return width
}

function copiesForWidth(containerWidth: number, segmentWidth: number) {
  if (segmentWidth <= 0 || containerWidth <= 0) return MIN_COPIES

  return Math.max(MIN_COPIES, Math.ceil((containerWidth + segmentWidth) / segmentWidth))
}

export function HomePartnersMarquee({
  items,
  reverse = false,
}: {
  items: ReadonlyArray<Partner>
  reverse?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const segmentWidthRef = useRef(0)
  const [copyCount, setCopyCount] = useState(MIN_COPIES)
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)

  const cards = useMemo(
    () =>
      Array.from({ length: copyCount }, (_, copyIndex) =>
        items.map((partner, itemIndex) => ({
          partner,
          key: `${copyIndex}-${itemIndex}-${partner.name}`,
        })),
      ).flat(),
    [copyCount, items],
  )

  useLayoutEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    const update = () => {
      const segment = measureSegmentWidth(track, items.length)
      segmentWidthRef.current = segment

      const nextCopies = copiesForWidth(container.offsetWidth, segment)
      setCopyCount((prev) => (prev === nextCopies ? prev : nextCopies))
    }

    update()

    const observer = new ResizeObserver(update)
    observer.observe(container)
    observer.observe(track)

    Array.from(track.children)
      .slice(0, items.length)
      .forEach((child) => observer.observe(child))

    return () => observer.disconnect()
  }, [items])

  useAnimationFrame((_, delta) => {
    if (reduceMotion) return

    const segment = segmentWidthRef.current
    if (segment <= 0) return

    const step = (MARQUEE_SPEED * delta) / 1000
    const direction = reverse ? 1 : -1
    let next = x.get() + direction * step

    if (reverse) {
      while (next >= segment) next -= segment
    } else {
      while (next <= -segment) next += segment
    }

    x.set(next)
  })

  return (
    <div ref={containerRef} className={styles.marquee}>
      <motion.div ref={trackRef} className={styles.marqueeTrack} style={{ x }}>
        {cards.map(({ partner, key }) => (
          <PartnerCard key={key} partner={partner} />
        ))}
      </motion.div>
    </div>
  )
}
