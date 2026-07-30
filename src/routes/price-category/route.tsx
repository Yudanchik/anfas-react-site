import { useEffect } from 'react'
import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router'

import { priceRepository } from '@/entities/price/api'
import { getPriceCategoryHref, getPriceHubHref, getRelatedPriceCategories } from '@/entities/price/lib/price-helpers'
import { getServiceHref } from '@/entities/service/model/services.data'
import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import { absoluteUrl, createSeoMeta } from '@/shared/config/seo'
import { reachGoal } from '@/shared/lib/yandex-metrika/reach-goal'
import { NotFoundState } from '@/shared/ui/not-found-state'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import {
  PricesBreadcrumbs,
  PricesCategoryGrid,
  PricesCta,
  PricesFactors,
  PricesFaq,
  PricesHero,
  PricesPreviewTable,
  PricesSeoNote,
} from '@/widgets/prices'

import styles from './PriceCategoryRoute.module.scss'

export async function loader({ params }: LoaderFunctionArgs) {
  const category = await priceRepository.getBySlug(params.categorySlug ?? '')

  if (!category) {
    throw new Response('Категория не найдена', { status: 404 })
  }

  const allCategories = await priceRepository.getAll()
  const relatedCategories = getRelatedPriceCategories(allCategories, category)

  return { category, relatedCategories }
}

export function meta({ data }: { data?: Awaited<ReturnType<typeof loader>> }) {
  if (!data) {
    return createSeoMeta({
      title: 'Категория прайс-листа не найдена — Анфас',
      path: getPriceHubHref(),
      robots: 'noindex, nofollow',
    })
  }

  return createSeoMeta({
    title: data.category.seo.title,
    description: data.category.seo.description,
    keywords: data.category.seo.keywords,
    path: getPriceCategoryHref(data.category.slug),
  })
}

export function ErrorBoundary() {
  return <NotFoundState />
}

export default function PriceCategoryRoute() {
  const { category, relatedCategories } = useLoaderData<typeof loader>()

  useEffect(() => {
    reachGoal('prices_category_view')
  }, [category.slug])

  const serviceSlug = category.related.serviceSlug
  const serviceLabel = serviceSlug === 'package' ? 'Пакетный ремонт' : 'Индивидуальный ремонт'

  const breadcrumbListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Прайс-лист', item: absoluteUrl(getPriceHubHref()) },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.title,
        item: absoluteUrl(getPriceCategoryHref(category.slug)),
      },
    ],
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: category.positions.map((position, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Offer',
        name: position.name,
        price: position.priceFrom,
        priceCurrency: 'RUB',
        url: absoluteUrl(getPriceCategoryHref(category.slug)),
      },
    })),
  }

  const faqPageJsonLd = category.faq.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: category.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }
    : null

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      {faqPageJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
        />
      ) : null}

      <PricesHero
        eyebrow={category.eyebrow}
        title={category.title}
        titleAccent={category.titleAccent}
        lead={category.lead}
      />

      <section className={styles.section}>
        <PageWrapper>
          <PricesBreadcrumbs current={category.title} />

          <div className={styles.previewIntro}>
            <h2>Популярные позиции и цены</h2>
            <p>
              Показываем {category.positions.length} востребованных позиций категории с реальными
              ценами «от». Точная стоимость зависит от объёма и особенностей объекта.
            </p>
          </div>

          <PricesPreviewTable positions={category.positions} />

          <div className={styles.noteSpacing}>
            <PricesSeoNote
              title="Это не весь прайс"
              text="В превью — только часть популярных позиций категории. Полный прайс-лист содержит значительно больше работ, включая узкоспециальные и вспомогательные позиции."
            />
          </div>
        </PageWrapper>
      </section>

      <section className={styles.section}>
        <PageWrapper>
          <PricesSeoNote title="Про ориентировочные цены" text={category.disclaimer} />
        </PageWrapper>
      </section>

      <section className={styles.section}>
        <PageWrapper>
          <PricesFactors items={category.factors} />
        </PageWrapper>
      </section>

      <section className={styles.section}>
        <PageWrapper>
          <PricesFaq items={category.faq} />
        </PageWrapper>
      </section>

      <section className={styles.section}>
        <PageWrapper>
          <PricesCta
            title="Нужен полный прайс по этой категории?"
            lead="Оставьте заявку — пришлём на почту полный прайс-лист со всеми позициями категории и остальными видами работ."
            source={`prices-${category.slug}`}
          />

          <div className={styles.consultationCard}>
            <div>
              <strong>Не готовы ждать полный прайс?</strong>
              <p>Обсудите смету на короткой консультации — уточним объект и предложим формат работ.</p>
            </div>
            <ModalTriggerButton
              intent="consultation"
              variant="outline"
              source={`prices-${category.slug}-consultation`}
            >
              Обсудить смету
            </ModalTriggerButton>
          </div>
        </PageWrapper>
      </section>

      <section className={`${styles.section} ${styles.relatedSection}`}>
        <PageWrapper>
          <h2 className={styles.relatedTitle}>Связанные материалы</h2>

          <div className={styles.relatedLinks}>
            {serviceSlug ? (
              <Link className={styles.relatedLink} to={getServiceHref(serviceSlug)}>
                <strong>Услуга</strong>
                <span>{serviceLabel}</span>
              </Link>
            ) : null}
            <Link className={styles.relatedLink} to={getPriceHubHref()}>
              <strong>Прайс-лист</strong>
              <span>Все категории цен</span>
            </Link>
            <Link className={styles.relatedLink} to="/blog">
              <strong>Журнал</strong>
              <span>Статьи об этапах ремонта</span>
            </Link>
          </div>

          {relatedCategories.length > 0 ? (
            <>
              <p className={styles.relatedCategoriesLabel}>Похожие категории</p>
              <PricesCategoryGrid categories={relatedCategories} />
            </>
          ) : null}
        </PageWrapper>
      </section>
    </main>
  )
}
