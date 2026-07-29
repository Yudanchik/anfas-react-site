import { Link } from 'react-router'

import type { Article, ArticleCategorySlug } from '@/entities/article/model/article.types'
import { ARTICLE_CATEGORY_LABELS } from '@/entities/article/model/article.types'
import { tieRussianShortWords, tieRussianShortWordsInNode } from '@/shared/lib/tie-russian-short-words'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import { BlogCard } from './BlogCard'
import styles from './BlogList.module.scss'

type BlogListProps = {
  articles: readonly Article[]
  activeCategory?: ArticleCategorySlug | null
}

export function BlogList({ articles, activeCategory = null }: BlogListProps) {
  const categories = Object.entries(ARTICLE_CATEGORY_LABELS) as Array<
    [ArticleCategorySlug, string]
  >

  return (
    <section className={styles.section}>
      <PageWrapper>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{tieRussianShortWords('Свежие материалы')}</p>
          <h2 className={styles.title}>
            {tieRussianShortWordsInNode(
              <>
                Статьи, которые помогают
                <br />
                принять <em>решения</em>
              </>,
            )}
          </h2>
          <p className={styles.lead}>
            {tieRussianShortWords(
              'Каждый материал собран по одному шаблону: зачем это важно, как делают правильно, чеклист приёмки и ошибки, которые дорого стоят.',
            )}
          </p>
        </div>

        <div className={styles.filters} aria-label="Темы журнала">
          <Link
            className={`${styles.filter} ${activeCategory == null ? styles.filterActive : ''}`}
            to="/blog"
          >
            Все темы
          </Link>
          {categories.map(([slug, label]) => (
            <Link
              key={slug}
              className={`${styles.filter} ${activeCategory === slug ? styles.filterActive : ''}`}
              to={`/blog?tema=${slug}`}
            >
              {tieRussianShortWords(label)}
            </Link>
          ))}
        </div>

        {articles.length > 0 ? (
          <div className={styles.grid}>
            {articles.map((article) => (
              <BlogCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>
            {tieRussianShortWords('В этой теме пока нет статей — скоро появятся.')}
          </p>
        )}
      </PageWrapper>
    </section>
  )
}
