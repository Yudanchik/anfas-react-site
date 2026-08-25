import { FloorEstimateIntro } from '@/features/floor-estimate'
import { buildFloorEstimate, FLOOR_PRICE_MAPPING } from '@/entities/estimate'
import { createSeoMeta } from '@/shared/config/seo'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './InternalEstimateRoute.module.scss'

const EMPTY_INPUT = {
  totalFloorArea: 0,
  demolitionArea: 0,
  screedArea: 0,
  wetZonesArea: 0,
  avgDeltaMm: 0,
} as const

export const meta = () =>
  createSeoMeta({
    title: 'Внутренний калькулятор сметы — Полы | Анфас',
    description:
      'Внутренний инструмент сметчика Анфас: черновые работы по полам. Материалы не учитываются.',
    path: '/internal/estimate',
    robots: 'noindex, nofollow',
  })

export default function InternalEstimateRoute() {
  const preview = buildFloorEstimate(EMPTY_INPUT)

  return (
    <main className={styles.page}>
      <PageWrapper>
        <FloorEstimateIntro
          availableWorksCount={FLOOR_PRICE_MAPPING.length}
          recommendation={preview.recommendation}
          selectedCount={preview.selectedCount}
          totalRub={preview.totalRub}
        />

        <section className={styles.placeholder} aria-label="Таблица сметы">
          <p className={styles.placeholderEyebrow}>Следующий шаг</p>
          <h2 className={styles.placeholderTitle}>Таблица строк сметы</h2>
          <p className={styles.placeholderText}>
            Редактирование строк, коэффициентов и итогов появится на следующем этапе. Сейчас
            подключены domain-формулы и mapping черновых работ по полу.
          </p>
        </section>
      </PageWrapper>
    </main>
  )
}
