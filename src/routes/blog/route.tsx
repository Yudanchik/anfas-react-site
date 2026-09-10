import { useLoaderData, useSearchParams } from 'react-router'

import { articleRepository } from '@/entities/article/api'
import type { ArticleCategorySlug } from '@/entities/article/model/article.types'
import {
  ARTICLE_CATEGORY_LABELS,
  getArticleHref,
} from '@/entities/article/model/article.types'
import { absoluteUrl, createSeoMeta } from '@/shared/config/seo'
import { BlogHero, BlogList } from '@/widgets/blog'

import styles from './BlogRoute.module.scss'

const categorySlugs = Object.keys(ARTICLE_CATEGORY_LABELS) as ArticleCategorySlug[]

function parseCategory(value: string | null): ArticleCategorySlug | null {
  if (!value) {
    return null
  }

  return categorySlugs.includes(value as ArticleCategorySlug)
    ? (value as ArticleCategorySlug)
    : null
}

export async function loader() {
  return {
    articles: await articleRepository.getAll(),
  }
}

export const meta = () =>
  createSeoMeta({
    title: 'Журнал о ремонте квартир | Анфас',
    description:
      'Практические статьи о ремонте квартир в Санкт-Петербурге: электрика, полы, сантехника и комплектация. Понятные разборы без хаоса — от студии Анфас.',
    keywords:
      'журнал о ремонте квартир, статьи о ремонте, электрика при ремонте, ровнитель пола, выбор сантехники, ремонт квартир спб советы',
    path: '/blog',
  })

export default function BlogRoute() {
  const { articles } = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const activeCategory = parseCategory(searchParams.get('tema'))
  const visibleArticles = activeCategory
    ? articles.filter((article) => article.categorySlug === activeCategory)
    : articles
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': absoluteUrl('/blog#webpage'),
        name: 'Журнал о ремонте квартир',
        url: absoluteUrl('/blog'),
        isPartOf: { '@id': absoluteUrl('/#website') },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: visibleArticles.map((article, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: article.title,
            url: absoluteUrl(getArticleHref(article.slug)),
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Главная',
            item: absoluteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Журнал',
            item: absoluteUrl('/blog'),
          },
        ],
      },
    ],
  }

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BlogHero />
      <BlogList articles={visibleArticles} activeCategory={activeCategory} />
    </main>
  )
}
