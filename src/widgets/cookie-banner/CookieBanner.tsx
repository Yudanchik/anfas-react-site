import { useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router'

import styles from './CookieBanner.module.scss'

const STORAGE_KEY = 'anfas-cookie-notice-v1'

const subscribeToCookieNotice = () => () => undefined

const getCookieNoticeSnapshot = () => {
  if (typeof window === 'undefined') {
    return true
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

const getServerCookieNoticeSnapshot = () => true

export function CookieBanner() {
  const isStoredClosed = useSyncExternalStore(
    subscribeToCookieNotice,
    getCookieNoticeSnapshot,
    getServerCookieNoticeSnapshot,
  )
  const [isClosed, setIsClosed] = useState(false)

  const handleClose = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // Баннер скрывается в текущем состоянии интерфейса, даже если storage недоступен.
    }

    setIsClosed(true)
  }

  if (isStoredClosed || isClosed) {
    return null
  }

  return (
    <section className={styles.cookieBanner} aria-label="Уведомление о локальном хранении данных">
      <p className={styles.cookieBanner__text}>
        Сайт использует{' '}
        <Link className={styles.cookieBanner__link} to="/cookies">
          cookies
        </Link>
        , это <br />
        помогает улучшить его работу
      </p>
      <button className={styles.cookieBanner__button} type="button" onClick={handleClose}>
        Понятно
      </button>
    </section>
  )
}
