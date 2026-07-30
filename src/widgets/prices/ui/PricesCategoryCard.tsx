import { Link } from 'react-router'

import type { PriceCategory } from '@/entities/price/model/price.types'
import { formatPriceFrom, getPriceCategoryHref } from '@/entities/price/lib/price-helpers'
import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import styles from './PricesCategoryCard.module.scss'

type PricesCategoryCardProps = {
  category: PriceCategory
}

export function PricesCategoryCard({ category }: PricesCategoryCardProps) {
  return (
    <Link className={styles.card} to={getPriceCategoryHref(category.slug)} data-reveal>
      <div className={styles.body}>
        <span className={styles.eyebrow}>{tieRussianShortWords(category.eyebrow)}</span>
        <h3 className={styles.title}>{tieRussianShortWords(category.title)}</h3>
        <p className={styles.lead}>{tieRussianShortWords(category.lead)}</p>
      </div>

      <div className={styles.footer}>
        <strong className={styles.price}>{formatPriceFrom(category.priceFrom, category.priceUnit)}</strong>
        <span className={styles.link}>
          Смотреть цены
          <ArrowIcon size={16} />
        </span>
      </div>
    </Link>
  )
}
