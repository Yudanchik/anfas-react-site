import { useEffect, useRef, useState } from 'react'

type CounterProps = {
  value: number
  suffix?: string
}

export function Counter({ value, suffix = '' }: CounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return

        const startedAt = performance.now()
        const duration = 1200

        const tick = (time: number) => {
          const progress = Math.min((time - startedAt) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)

          setCount(Math.round(value * eased))

          if (progress < 1) {
            requestAnimationFrame(tick)
          }
        }

        requestAnimationFrame(tick)
        observer.disconnect()
      },
      { threshold: 0.5 },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}
