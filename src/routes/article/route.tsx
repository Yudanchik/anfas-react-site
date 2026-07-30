import { useLoaderData, type LoaderFunctionArgs } from 'react-router'

import { articleRepository } from '@/entities/article/api'
import { getSuggestedArticles } from '@/entities/article/lib/article-helpers'
import { getArticleHref } from '@/entities/article/model/article.types'
import { getServiceHref } from '@/entities/service/model/services.data'
import { createSeoMeta } from '@/shared/config/seo'
import { tieRussianShortWords, tieRussianShortWordsInNode } from '@/shared/lib/tie-russian-short-words'
import { NotFoundState } from '@/shared/ui/not-found-state'
import { OpenLeadForm } from '@/shared/ui/open-lead-form'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import {
  ArticleAside,
  ArticleBreadcrumbs,
  ArticleCtaBlock,
  ArticleHero,
  ArticlePanels,
  ArticleProjectsPromo,
  ArticleRelated,
  ArticleSections,
  ArticleServicePromo,
  ArticleShare,
} from '@/widgets/article'

import styles from './ArticleRoute.module.scss'

export async function loader({ params }: LoaderFunctionArgs) {
  const article = await articleRepository.getBySlug(params.slug ?? '')

  if (!article) {
    throw new Response('Статья не найдена', { status: 404 })
  }

  const allArticles = await articleRepository.getAll()
  const suggested = getSuggestedArticles(allArticles, article.slug, 4)

  return { article, suggested }
}

export function meta({ data }: { data?: Awaited<ReturnType<typeof loader>> }) {
  if (!data) {
    return createSeoMeta({
      title: 'Статья не найдена — Анфас',
      path: '/blog',
      robots: 'noindex, nofollow',
    })
  }

  return createSeoMeta({
    title: data.article.seo.title,
    description: data.article.seo.description,
    keywords: data.article.seo.keywords,
    path: getArticleHref(data.article.slug),
    image: `/${data.article.cover}`,
    type: 'article',
  })
}

export function ErrorBoundary() {
  return <NotFoundState />
}

export default function ArticleRoute() {
  const { article, suggested } = useLoaderData<typeof loader>()
  const serviceHref = getServiceHref(article.relatedService)
  const serviceLabel =
    article.relatedService === 'package' ? 'Пакетный ремонт' : 'Ремонт по дизайн-проекту'

  const serviceInsertIndex = Math.min(1, Math.max(0, article.sections.length - 1))
  const projectsInsertIndex = Math.min(
    Math.max(serviceInsertIndex + 2, 3),
    Math.max(0, article.sections.length - 1),
  )

  return (
    <main className={styles.page}>
      <ArticleHero article={article} />

      <section className={styles.body}>
        <PageWrapper>
          <div className={styles.layout}>
            <div className={styles.content}>
              <ArticleBreadcrumbs article={article} />

              <ArticleSections
                sections={article.sections}
                injectAfter={[
                  {
                    afterIndex: serviceInsertIndex,
                    node: (
                      <ArticleServicePromo serviceHref={serviceHref} serviceLabel={serviceLabel} />
                    ),
                  },
                  {
                    afterIndex: projectsInsertIndex,
                    node: <ArticleProjectsPromo />,
                  },
                ]}
              />

              <ArticlePanels checklist={article.checklist} mistakes={article.mistakes} />
              <ArticleCtaBlock
                title={article.cta.title}
                text={article.cta.text}
                href={article.cta.href}
              />
              <ArticleShare title={article.title} path={getArticleHref(article.slug)} />
            </div>

            <ArticleAside
              sections={article.sections}
              serviceHref={serviceHref}
              serviceLabel={serviceLabel}
            />
          </div>

          <ArticleRelated articles={suggested} />

          <OpenLeadForm
            className={styles.form}
            defaultService={article.relatedService}
            title={tieRussianShortWordsInNode(
              <>
                Нужна помощь
                <br />
                <em>на вашем объекте?</em>
              </>,
            )}
            lead={tieRussianShortWords(
              'Оставьте имя и телефон — обсудим задачу, подскажем формат работ и следующие шаги без лишней воды.',
            )}
            submitLabel="Получить консультацию"
          />
        </PageWrapper>
      </section>
    </main>
  )
}
