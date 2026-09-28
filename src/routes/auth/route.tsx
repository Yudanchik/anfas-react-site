import { Link } from 'react-router'
import styles from '@/features/auth/AuthForm.module.scss'
import { AuthForm } from '@/features/auth/AuthForm'
import { backendAuthEnabled, useAuth } from '@/features/auth/AuthProvider'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { createSeoMeta } from '@/shared/config/seo'

export const meta = () =>
  createSeoMeta({
    title: 'Вход | Анфас',
    description: 'Вход в аккаунт Анфас.',
    path: '/auth',
    robots: 'noindex, nofollow',
  })

export default function AuthRoute() {
  const auth = useAuth()
  return (
    <main>
      <PageWrapper>
        {!backendAuthEnabled ? (
          <p>Пользовательский вход пока не включён.</p>
        ) : auth.loading ? (
          <p role="status">Проверяем вход…</p>
        ) : auth.user ? (
          <section className={styles.panel + ' ym-hide-content'}>
            <h1>Ваш аккаунт</h1>
            <p>{auth.user.email}</p>
            <p>
              <Link to="/internal/estimate">Открыть смету</Link>
            </p>
            <button
              type="button"
              disabled={auth.logout.isPending}
              onClick={() => auth.logout.mutate()}
            >
              Выйти
            </button>
            {auth.logout.error && <p role="alert">{auth.logout.error.message}</p>}
          </section>
        ) : (
          <AuthForm />
        )}
      </PageWrapper>
    </main>
  )
}
