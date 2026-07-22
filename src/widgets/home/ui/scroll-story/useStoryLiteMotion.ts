import { useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

const LITE_MOTION_QUERY = '(max-width: 768px), (pointer: coarse)'

export function useStoryLiteMotion() {
  const reduceMotion = useReducedMotion()
  const [liteMotion, setLiteMotion] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.matchMedia(LITE_MOTION_QUERY).matches
  })

  useEffect(() => {
    const media = window.matchMedia(LITE_MOTION_QUERY)
    const update = () => setLiteMotion(media.matches)

    update()
    media.addEventListener('change', update)

    return () => media.removeEventListener('change', update)
  }, [])

  return Boolean(reduceMotion || liteMotion)
}
