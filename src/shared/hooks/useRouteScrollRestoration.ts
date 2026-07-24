import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router'

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function useRouteScrollRestoration() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const savedPositionsRef = useRef<Map<string, number>>(new Map())
  const hydratedPathRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.history.scrollRestoration) {
      return
    }

    const previousValue = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    return () => {
      window.history.scrollRestoration = previousValue
    }
  }, [])

  useEffect(() => {
    const savedPositions = savedPositionsRef.current

    return () => {
      if (typeof window === 'undefined') {
        return
      }

      savedPositions.set(location.pathname, window.scrollY)
    }
  }, [location.pathname])

  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (hydratedPathRef.current === null) {
      hydratedPathRef.current = location.pathname
      return
    }

    if (navigationType === 'POP') {
      window.scrollTo(0, savedPositionsRef.current.get(location.pathname) ?? 0)
      return
    }

    window.scrollTo(0, 0)
  }, [location.pathname, navigationType])
}
