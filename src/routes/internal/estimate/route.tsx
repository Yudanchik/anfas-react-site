import { createSeoMeta } from '@/shared/config/seo'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { FloorEstimateWorkspace } from '@/features/floor-estimate'

import styles from './InternalEstimateRoute.module.scss'

export const meta = () =>
  createSeoMeta({
    title: 'Внутренний калькулятор сметы — Полы | Анфас',
    description:
      'Внутренний инструмент сметчика Анфас: черновые работы по полам. Материалы не учитываются.',
    path: '/internal/estimate',
    robots: 'noindex, nofollow',
  })

export default function InternalEstimateRoute() {
  return (
    <main className={styles.page}>
      <PageWrapper>
        <FloorEstimateWorkspace />
      </PageWrapper>
    </main>
  )
}
