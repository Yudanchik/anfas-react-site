import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from './AuthProvider'
import styles from './AuthForm.module.scss'

export function AuthForm() {
  const [register, setRegister] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await auth.authenticate.mutateAsync({
        action: register ? 'register' : 'login',
        email: String(form.get('email')),
        password: String(form.get('password')),
      })
      navigate('/internal/estimate')
    } catch {
      /* The mutation displays the server error below. */
    }
  }

  return (
    <section className={styles.panel + ' ym-hide-content'} aria-labelledby="auth-title">
      <h1 id="auth-title">{register ? 'Регистрация' : 'Вход в аккаунт'}</h1>
      <p>Войдите или зарегистрируйтесь, чтобы составить смету ремонта.</p>
      <form onSubmit={(event) => void submit(event)}>
        <label>
          Email
          <input name="email" type="email" autoComplete="username" required maxLength={254} />
        </label>
        <label>
          Пароль
          <input
            name="password"
            type="password"
            autoComplete={register ? 'new-password' : 'current-password'}
            required
            minLength={10}
            maxLength={128}
          />
        </label>
        {register && <small>От 10 до 128 символов. Подтверждение email пока не требуется.</small>}
        <button type="submit" disabled={auth.authenticate.isPending}>
          {auth.authenticate.isPending ? 'Подождите…' : register ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </form>
      {auth.authenticate.error && <p role="alert">{auth.authenticate.error.message}</p>}
      <button
        className={styles.switchMode}
        type="button"
        disabled={auth.authenticate.isPending}
        onClick={() => {
          setRegister((value) => !value)
          auth.authenticate.reset()
        }}
      >
        {register ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
      </button>
      <small>
        Сметы пока сохраняются в этом браузере.{' '}
        <Link to="/privacy">Политика конфиденциальности</Link>
      </small>
    </section>
  )
}
