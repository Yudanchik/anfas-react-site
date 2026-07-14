import { useEffect, useState } from 'react'

import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import styles from './ScrollToTop.module.scss'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      data-scroll-top
      className={`${styles.scrollToTop} ${visible ? styles.scrollToTop_visible : ''}`}
      aria-label="Наверх"
      onClick={scrollToTop}
    >
      <ArrowIcon size={16} />
    </button>
  )
}
