import { useEffect } from 'react'

const VISIBLE_ATTR = 'data-visible'

export function useScrollEffects(routeKey: string) {
  useEffect(() => {
    const markVisible = (element: HTMLElement) => {
      element.setAttribute(VISIBLE_ATTR, '')
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          markVisible(entry.target as HTMLElement)
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px 8% 0px' },
    )

    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
    elements.forEach((element) => observer.observe(element))

    requestAnimationFrame(() => {
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
          markVisible(element)
        }
      })
    })

    const updateProgress = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight
      const progress = height > 0 ? window.scrollY / height : 0
      document.documentElement.style.setProperty('--scroll-progress', `${progress}`)
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updateProgress)
    }
  }, [routeKey])
}
