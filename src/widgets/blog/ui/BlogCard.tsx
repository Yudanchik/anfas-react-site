import { Link } from 'react-router'

import type { Article } from '@/entities/article/model/article.types'
import { getArticleHref } from '@/entities/article/model/article.types'
import { formatArticleDate } from '@/entities/article/lib/article-helpers'
import { assetUrl } from '@/shared/lib/asset-url'
import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import styles from './BlogCard.module.scss'

type BlogCardProps = {
  article: Article
}

export function BlogCard({ article }: BlogCardProps) {
  return (
    <Link className={styles.card} to={getArticleHref(article.slug)}>
      <div className={styles.image}>
        <img src={assetUrl(article.cover)} alt={article.coverAlt} loading="lazy" />
      </div>

      <div className={styles.body}>
        <div className={styles.bodyTop}>
          <div className={styles.metaRow}>
            <span>{tieRussianShortWords(article.category)}</span>
            <span>{article.readTime}</span>
          </div>
          <h3 className={styles.title}>{tieRussianShortWords(article.title)}</h3>
          <p className={styles.description}>{tieRussianShortWords(article.lead)}</p>
        </div>

        <dl className={styles.meta}>
          <div>
            <dt>Дата</dt>
            <dd>{formatArticleDate(article.publishedAt)}</dd>
          </div>
          <div>
            <dt>Тема</dt>
            <dd>{tieRussianShortWords(article.eyebrow)}</dd>
          </div>
        </dl>

        <div className={styles.footer}>
          <span>Читать статью</span>
          <ArrowIcon size={16} />
        </div>
      </div>
    </Link>
  )
}
