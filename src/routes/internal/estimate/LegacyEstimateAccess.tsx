import { lazy, Suspense, useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import styles from './EstimateAccess.module.scss'

const Workspace = lazy(() =>
  import('@/features/estimate-calculator').then((m) => ({
    default: m.EstimateCalculatorWorkspace,
  })),
)
const endpoint = `${import.meta.env.BASE_URL}api/estimate-auth.php`
/**
 * Только Vite (`npm run dev` / `pnpm dev`): PHP не выполняется, вход пропускаем для разработки.
 * В production/dev-стенде `import.meta.env.DEV === false` — обхода нет, нужен PHP-логин.
 */
const localViteDev = import.meta.env.DEV

type Session = { authenticated: boolean; csrf: string }

function accessErrorMessage(cause: unknown): string {
  const text = cause instanceof Error ? cause.message : ''
  if (text.includes('JSON') || text.includes('Unexpected token')) {
    return 'Сервер входа недоступен. На стенде нужен estimate.config.local.php; локально для проверки PHP используйте pnpm preview:estimate.'
  }
  return text || 'Не удалось проверить доступ.'
}

export function LegacyEstimateAccess() {
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [locked, setLocked] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const lastActivity = useRef(0)

  const check = useCallback(async () => {
    if (localViteDev) {
      setSession({ authenticated: true, csrf: 'vite-dev' })
      setLocked(false)
      setLoaded(true)
      setError('')
      return
    }
    try {
      const response = await fetch(endpoint, { credentials: 'same-origin', cache: 'no-store' })
      const data = (await response.json()) as Session & { error?: string }
      if (!response.ok || typeof data.authenticated !== 'boolean' || typeof data.csrf !== 'string')
        throw new Error(data.error || 'Вход временно недоступен.')
      setSession(data)
      setLocked(!data.authenticated)
      if (data.authenticated) setLoaded(true)
      setError('')
    } catch (cause) {
      setLocked(true)
      setError(accessErrorMessage(cause))
    }
  }, [])

  useEffect(() => {
    lastActivity.current = Date.now()
    const timer = window.setTimeout(() => void check(), 0)
    return () => window.clearTimeout(timer)
  }, [check])

  useEffect(() => {
    if (!session?.authenticated || localViteDev) return
    const activity = () => {
      lastActivity.current = Date.now()
    }
    const resume = () => {
      if (!document.hidden) {
        setLocked(true)
        void check()
      }
    }
    const timer = window.setInterval(() => {
      if (Date.now() - lastActivity.current < 120_000 && !document.hidden) void check()
      else if (Date.now() - lastActivity.current >= 1_800_000) setLocked(true)
    }, 60_000)
    window.addEventListener('pointerdown', activity)
    window.addEventListener('keydown', activity)
    document.addEventListener('visibilitychange', resume)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('pointerdown', activity)
      window.removeEventListener('keydown', activity)
      document.removeEventListener('visibilitychange', resume)
    }
  }, [session?.authenticated, check])

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (localViteDev) {
      setSession({ authenticated: true, csrf: 'vite-dev' })
      lastActivity.current = Date.now()
      setLoaded(true)
      setLocked(false)
      setError('')
      return
    }
    if (!session?.csrf || busy) return
    const form = new FormData(event.currentTarget)
    setBusy(true)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': session.csrf },
        body: JSON.stringify({
          action: 'login',
          username: form.get('username'),
          password: form.get('password'),
        }),
      })
      const data = (await response.json()) as Session & { error?: string }
      if (!response.ok || !data.authenticated) throw new Error(data.error || 'Не удалось войти.')
      setSession(data)
      lastActivity.current = Date.now()
      setLoaded(true)
      setLocked(false)
      setError('')
    } catch (cause) {
      setError(accessErrorMessage(cause) || 'Вход временно недоступен.')
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    if (!session || busy) return
    if (localViteDev) {
      window.location.reload()
      return
    }
    setBusy(true)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': session.csrf },
        body: JSON.stringify({ action: 'logout' }),
      })
      if (!response.ok) throw new Error('Не удалось завершить сеанс. Повторите выход.')
      window.location.reload()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось выйти.')
    } finally {
      setBusy(false)
    }
  }

  const granted = session?.authenticated && !locked
  return (
    <>
      {!granted && (
        <section
          className={`${styles.login} ym-hide-content`}
          aria-labelledby="estimate-access-title"
        >
          <h1 id="estimate-access-title">Вход в смету</h1>
          <form onSubmit={(e) => void login(e)}>
            <label>
              Логин
              <input name="username" autoComplete="username" required maxLength={120} />
            </label>
            <label>
              Пароль
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={512}
              />
            </label>
            <button type="submit" disabled={busy || !session?.csrf}>
              {busy ? 'Входим…' : 'Войти'}
            </button>
          </form>
          {error && <p role="alert">{error}</p>}
          {!session?.csrf && (
            <button type="button" onClick={() => void check()}>
              Проверить доступ
            </button>
          )}
        </section>
      )}
      {granted && (
        <div className={styles.session}>
          <span>{localViteDev ? 'Смета · Локальная разработка' : 'Смета · Администратор'}</span>
          <button type="button" disabled={busy} onClick={() => void logout()}>
            Выйти
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      )}
      {loaded && (
        <div hidden={!granted}>
          <Suspense fallback={<p role="status">Загружаем смету…</p>}>
            <Workspace />
          </Suspense>
        </div>
      )}
    </>
  )
}
