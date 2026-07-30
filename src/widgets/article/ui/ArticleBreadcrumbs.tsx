import { Link } from 'react-router'

import type { Article } from '@/entities/article/model/article.types'
import { getArticleCategoryHref } from '@/entities/article/model/article.types'
import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import styles from './ArticleBreadcrumbs.module.scss'

type ArticleBreadcrumbsProps = {
  article: Article
}

export function ArticleBreadcrumbs({ article }: ArticleBreadcrumbsProps) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
      <Link to="/blog">Журнал</Link>
      <ArrowIcon className={styles.sep} size={12} />
      <Link to={getArticleCategoryHref(article.categorySlug)}>
        {tieRussianShortWords(article.category)}
      </Link>
      <ArrowIcon className={styles.sep} size={12} />
      <span className={styles.current}>{tieRussianShortWords(article.title)}</span>
    </nav>
  )
}
