import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'

type StoryDockedHeaderProps = {
  scrollYProgress: MotionValue<number>
  introShare: number
  reduceMotion: boolean | null
  className?: string
  children: ReactNode
}

export function StoryDockedHeader({
  scrollYProgress,
  introShare,
  reduceMotion,
  className,
  children,
}: StoryDockedHeaderProps) {
  const [docked, setDocked] = useState(introShare === 0)

  const dock = useTransform(
    scrollYProgress,
    introShare > 0 ? [0, introShare] : [0, 1],
    introShare > 0 ? [0, 1] : [1, 1],
    { clamp: true },
  )

  const scale = useTransform(dock, [0, 1], reduceMotion || introShare === 0 ? [1, 1] : [1.03, 1])

  useEffect(() => {
    if (introShare === 0) {
      setDocked(true)
      return
    }

    const progress = scrollYProgress.get()
    setDocked(progress >= introShare * 0.92)
  }, [introShare, scrollYProgress])

  useMotionValueEvent(dock, 'change', (value) => {
    setDocked(value >= 0.92 || introShare === 0)
  })

  if (reduceMotion || introShare === 0) {
    return (
      <div className={className} data-docked={docked || undefined}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      data-docked={docked || undefined}
      style={{ scale, transformOrigin: 'top left' }}
    >
      {children}
    </motion.div>
  )
}
