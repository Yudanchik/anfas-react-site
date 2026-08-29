import { createSeoMeta } from '@/shared/config/seo'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { EstimateCalculatorWorkspace } from '@/features/estimate-calculator'

import styles from './InternalEstimateRoute.module.scss'

export const meta = () =>
  createSeoMeta({
    title: 'Внутренний калькулятор сметы — Полы и стены | Анфас',
    description:
      'Внутренний инструмент сметчика Анфас: черновые работы по полам и стенам. Материалы не учитываются.',
    path: '/internal/estimate',
    robots: 'noindex, nofollow',
  })

export default function InternalEstimateRoute() {
  return (
    <main className={styles.page}>
      <PageWrapper>
        <EstimateCalculatorWorkspace />
      </PageWrapper>
    </main>
  )
}
