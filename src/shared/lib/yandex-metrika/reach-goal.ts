import { YANDEX_METRIKA_ID } from '@/shared/config/analytics'

/**
 * Безопасно отправляет цель в Яндекс Метрику.
 * Ничего не делает, если `window.ym` недоступен (prerender, SSR, блокировщики,
 * ещё не загруженный тег), и не бросает исключений наружу.
 */
export function reachGoal(goal: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || typeof window.ym !== 'function') {
    return
  }

  try {
    window.ym(YANDEX_METRIKA_ID, 'reachGoal', goal, params)
  } catch {
    // Аналитика не должна ломать пользовательский сценарий.
  }
}
