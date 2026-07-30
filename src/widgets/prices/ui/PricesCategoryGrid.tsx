import type { PriceCategory } from '@/entities/price/model/price.types'

import { PricesCategoryCard } from './PricesCategoryCard'
import styles from './PricesCategoryGrid.module.scss'

type PricesCategoryGridProps = {
  categories: readonly PriceCategory[]
}

export function PricesCategoryGrid({ categories }: PricesCategoryGridProps) {
  return (
    <div className={styles.grid}>
      {categories.map((category) => (
        <PricesCategoryCard key={category.slug} category={category} />
      ))}
    </div>
  )
}
