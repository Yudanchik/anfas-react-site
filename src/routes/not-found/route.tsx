import { createSeoMeta } from '@/shared/config/seo'
import { NotFoundState } from '@/shared/ui/not-found-state'

export const meta = () =>
  createSeoMeta({
    title: 'Страница не найдена — Анфас',
    path: '/',
    robots: 'noindex, nofollow',
  })

export default function NotFoundRoute() {
  return <NotFoundState />
}
