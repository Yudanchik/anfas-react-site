import { createContext, useContext, type PropsWithChildren } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const backendAuthEnabled = import.meta.env.VITE_AUTH_MODE === 'nest'
type User = { id: number; email: string; createdAt: string }
type Session = { user: User | null }

async function request(
  action: string,
  body?: { email: string; password: string },
): Promise<Session> {
  const response = await fetch(import.meta.env.BASE_URL + 'api/auth/' + action, {
    method: action === 'me' ? 'GET' : 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers:
      action === 'me' ? undefined : { 'Content-Type': 'application/json', 'X-Anfas-Client': 'web' },
    body: action === 'me' ? undefined : JSON.stringify(body || {}),
  })
  if (action === 'me' && response.status === 401) return { user: null }
  let data: Session & { message?: string | string[] }
  try {
    data = (await response.json()) as typeof data
  } catch {
    throw new Error('Сервер входа недоступен. Повторите позже.')
  }
  if (!response.ok) {
    if (response.status === 429) throw new Error('Слишком много попыток. Подождите минуту.')
    if (response.status === 400)
      throw new Error('Проверьте email. Пароль должен содержать от 10 до 128 символов.')
    throw new Error(
      typeof data.message === 'string' ? data.message : 'Не удалось выполнить запрос.',
    )
  }
  return data
}

function useAuthState() {
  const client = useQueryClient()
  const session = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: () => request('me'),
    enabled: backendAuthEnabled,
    retry: false,
    staleTime: 0,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
  const authenticate = useMutation({
    mutationFn: ({
      action,
      email,
      password,
    }: {
      action: 'register' | 'login'
      email: string
      password: string
    }) => request(action, { email, password }),
    onSuccess: (data) => client.setQueryData(['auth', 'session'], data),
  })
  const logout = useMutation({
    mutationFn: () => request('logout'),
    onSuccess: (data) => client.setQueryData(['auth', 'session'], data),
  })
  return {
    user: session.isError ? null : (session.data?.user ?? null),
    loading: backendAuthEnabled && session.isPending,
    error: session.error,
    retry: session.refetch,
    authenticate,
    logout,
  }
}

const AuthContext = createContext<ReturnType<typeof useAuthState> | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const auth = useAuthState()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('AuthProvider is missing')
  return auth
}
