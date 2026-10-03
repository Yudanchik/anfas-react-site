import { lazy, Suspense, useState } from 'react'
import { AuthForm } from '@/features/auth/AuthForm'
import { backendAuthEnabled, useAuth } from '@/features/auth/AuthProvider'
import { LegacyEstimateAccess } from './LegacyEstimateAccess'
import styles from './EstimateAccess.module.scss'

const Workspace = lazy(() =>
  import('@/features/estimate-calculator').then((module) => ({
    default: module.EstimateLibrary,
  })),
)

export function EstimateAccess() {
  const auth = useAuth()
  const [dirty, setDirty] = useState(false)
  if (!backendAuthEnabled) return <LegacyEstimateAccess />
  if (auth.loading) return <p role="status">Проверяем доступ…</p>
  if (auth.error)
    return (
      <section>
        <p role="alert">Сервер входа недоступен. Доступ к смете временно закрыт.</p>
        <button type="button" onClick={() => void auth.retry()}>
          Повторить
        </button>
      </section>
    )
  if (!auth.user) return <AuthForm />
  return (
    <>
      <div className={styles.session + ' ym-hide-content'}>
        <span>Смета · {auth.user.email}</span>
        <button
          type="button"
          disabled={auth.logout.isPending}
          onClick={() => {
            if (
              !dirty ||
              window.confirm('Последние изменения сметы не сохранены. Выйти без сохранения?')
            )
              auth.logout.mutate()
          }}
        >
          Выйти
        </button>
        {auth.logout.error && <p role="alert">{auth.logout.error.message}</p>}
      </div>
      <Suspense fallback={<p role="status">Загружаем смету…</p>}>
        <Workspace key={auth.user.id} userId={auth.user.id} onDirtyChange={setDirty} />
      </Suspense>
    </>
  )
}
