import { useCallback, useEffect, useRef, useState } from 'react'

export type EstimateStatusKind = 'success' | 'error' | 'info'

export type EstimateStatusState = {
  kind: EstimateStatusKind
  message: string
}

/** Success/info auto-hide; errors stay until replaced or cleared. */
export const ESTIMATE_STATUS_SUCCESS_CLEAR_MS = 4500

type UseEstimateStatusMessageOptions = {
  /** When any token changes, status is cleared (e.g. section / full reset). */
  clearTokens?: readonly number[]
}

export type EstimateStatusMessageApi = {
  status: EstimateStatusState | null
  setSuccess: (message: string) => void
  setError: (message: string) => void
  setInfo: (message: string) => void
  clear: () => void
}

export function useEstimateStatusMessage(
  options: UseEstimateStatusMessageOptions = {},
): EstimateStatusMessageApi {
  const { clearTokens = [] } = options
  const [status, setStatus] = useState<EstimateStatusState | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tokensKey = clearTokens.join(':')
  const prevTokensKeyRef = useRef(tokensKey)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const clear = useCallback(() => {
    clearTimer()
    setStatus(null)
  }, [clearTimer])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  useEffect(() => {
    if (prevTokensKeyRef.current === tokensKey) return
    prevTokensKeyRef.current = tokensKey
    clearTimer()
    setStatus(null)
  }, [tokensKey, clearTimer])

  const setWithOptionalTimeout = useCallback(
    (kind: EstimateStatusKind, message: string) => {
      clearTimer()
      setStatus({ kind, message })
      if (kind === 'error') return
      timerRef.current = setTimeout(() => {
        setStatus((prev) => (prev?.kind === kind && prev.message === message ? null : prev))
        timerRef.current = null
      }, ESTIMATE_STATUS_SUCCESS_CLEAR_MS)
    },
    [clearTimer],
  )

  return {
    status,
    setSuccess: useCallback(
      (message: string) => setWithOptionalTimeout('success', message),
      [setWithOptionalTimeout],
    ),
    setError: useCallback(
      (message: string) => setWithOptionalTimeout('error', message),
      [setWithOptionalTimeout],
    ),
    setInfo: useCallback(
      (message: string) => setWithOptionalTimeout('info', message),
      [setWithOptionalTimeout],
    ),
    clear,
  }
}
