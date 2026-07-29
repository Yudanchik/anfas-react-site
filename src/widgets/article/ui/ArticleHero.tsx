import type { Article } from '@/entities/article/model/article.types'
import { formatArticleDate } from '@/entities/article/lib/article-helpers'
import { assetUrl } from '@/shared/lib/asset-url'
import { tieRussianShortWords, tieRussianShortWordsInNode } from '@/shared/lib/tie-russian-short-words'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './ArticleHero.module.scss'

type ArticleHeroProps = {
  article: Article
}

function titleWithAccent(title: string, accent: string) {
  const index = title.indexOf(accent)
  if (index < 0) {
    return tieRussianShortWords(title)
  }

  return tieRussianShortWordsInNode(
    <>
      {title.slice(0, index)}
      <em>{accent}</em>
      {title.slice(index + accent.length)}
    </>,
  )
}

export function ArticleHero({ article }: ArticleHeroProps) {
  return (
    <section className={styles.hero}>
      <img
        className={styles.media}
        src={assetUrl(article.cover)}
        alt={article.coverAlt}
        loading="eager"
        decoding="sync"
      />
      <PageWrapper className={styles.wrap}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{tieRussianShortWords(article.eyebrow)}</p>
          <h1 className={styles.title}>{titleWithAccent(article.title, article.titleAccent)}</h1>
          <p className={styles.lead}>{tieRussianShortWords(article.lead)}</p>
          <dl className={styles.meta}>
            <div>
              <dt>Тема</dt>
              <dd>{tieRussianShortWords(article.category)}</dd>
            </div>
            <div>
              <dt>Дата</dt>
              <dd>{formatArticleDate(article.publishedAt)}</dd>
            </div>
            <div>
              <dt>Чтение</dt>
              <dd>{article.readTime}</dd>
            </div>
          </dl>
        </div>
      </PageWrapper>
    </section>
  )
}
