import { useEffect } from 'react'

export function useScrollEffects(routeKey: string) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12 },
    )

    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
    elements.forEach((element) => observer.observe(element))

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
