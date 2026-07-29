import { Link } from 'react-router'

import type { Article } from '@/entities/article/model/article.types'
import { getArticleHref } from '@/entities/article/model/article.types'
import { assetUrl } from '@/shared/lib/asset-url'
import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import styles from './ArticleRelated.module.scss'

type ArticleRelatedProps = {
  articles: readonly Article[]
}

export function ArticleRelated({ articles }: ArticleRelatedProps) {
  if (articles.length === 0) {
    return null
  }

  return (
    <section className={styles.related}>
      <h2>{tieRussianShortWords('Вам может понравиться')}</h2>
      <div className={styles.grid}>
        {articles.map((article) => (
          <Link className={styles.card} key={article.slug} to={getArticleHref(article.slug)}>
            <div className={styles.image}>
              <img src={assetUrl(article.cover)} alt={article.coverAlt} loading="lazy" />
            </div>
            <div className={styles.body}>
              <span>{tieRussianShortWords(article.category)}</span>
              <strong>{tieRussianShortWords(article.title)}</strong>
              <em>
                Читать
                <ArrowIcon size={14} />
              </em>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
