import { Link } from 'react-router'

import { getPriceHubHref } from '@/entities/price/lib/price-helpers'
import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import styles from './PricesBreadcrumbs.module.scss'

type PricesBreadcrumbsProps = {
  current: string
}

export function PricesBreadcrumbs({ current }: PricesBreadcrumbsProps) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
      <Link to="/">Главная</Link>
      <ArrowIcon className={styles.sep} size={12} />
      <Link to={getPriceHubHref()}>Прайс-лист</Link>
      <ArrowIcon className={styles.sep} size={12} />
      <span className={styles.current}>{tieRussianShortWords(current)}</span>
    </nav>
  )
}
