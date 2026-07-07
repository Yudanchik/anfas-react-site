import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion'
import { useState, type ReactNode } from 'react'

type StoryDockedHeaderProps = {
  scrollYProgress: MotionValue<number>
  introShare: number
  reduceMotion: boolean | null
  className?: string
  children: ReactNode
}

function getDocked(progress: number, introShare: number) {
  if (introShare === 0) {
    return true
  }

  return progress >= introShare * 0.92
}

export function StoryDockedHeader({
  scrollYProgress,
  introShare,
  reduceMotion,
  className,
  children,
}: StoryDockedHeaderProps) {
  const [docked, setDocked] = useState(() => getDocked(scrollYProgress.get(), introShare))

  const dock = useTransform(
    scrollYProgress,
    introShare > 0 ? [0, introShare] : [0, 1],
    introShare > 0 ? [0, 1] : [1, 1],
    { clamp: true },
  )

  const scale = useTransform(dock, [0, 1], reduceMotion || introShare === 0 ? [1, 1] : [1.03, 1])

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const nextDocked = getDocked(progress, introShare)
    setDocked((current) => (current === nextDocked ? current : nextDocked))
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
