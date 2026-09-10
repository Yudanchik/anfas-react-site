import { createSeoMeta } from '@/shared/config/seo'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { EstimateAccess } from './EstimateAccess'

import styles from './InternalEstimateRoute.module.scss'

export const meta = () =>
  createSeoMeta({
    title: 'Смета | Анфас',
    description: 'Внутренний инструмент составления сметы Анфас.',
    path: '/internal/estimate',
    robots: 'noindex, nofollow',
  })

export default function InternalEstimateRoute() {
  return (
    <main className={styles.page}>
      <PageWrapper>
        <EstimateAccess />
      </PageWrapper>
    </main>
  )
}
