import { Link, useLoaderData } from 'react-router'

import { faqRepository } from '@/entities/faq/api'
import { priceRepository } from '@/entities/price/api'
import { getPriceCategoryHref, getPriceHubHref } from '@/entities/price/lib/price-helpers'
import { absoluteUrl, createSeoMeta } from '@/shared/config/seo'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '@/widgets/home/ui'
import {
  PricesCategoryGrid,
  PricesCta,
  PricesFaq,
  PricesHero,
  PricesSeoNote,
} from '@/widgets/prices'

import styles from './PricesRoute.module.scss'

export async function loader() {
  const [categories, hubFaqGroup] = await Promise.all([
    priceRepository.getAll(),
    faqRepository.getByKey('prices-hub'),
  ])

  return {
    categories,
    hubFaq: hubFaqGroup?.items ?? [],
  }
}

export const meta = () =>
  createSeoMeta({
    title: 'Прайс-лист на ремонт квартир в Санкт-Петербурге | Анфас',
    description:
      'Ориентировочные цены на ремонт квартир в Санкт-Петербурге по категориям работ: демонтаж, штукатурка, электромонтаж, сантехника, полы, потолки и другие. Оставьте заявку и получите полный прайс-лист со всеми позициями.',
    keywords:
      'прайс-лист ремонт квартир, цены на ремонт квартиры спб, стоимость ремонта квартиры, расценки на ремонт, сколько стоит ремонт квартиры',
    path: '/prices',
  })

const secondaryLinks = [
  {
    to: '/services',
    label: 'Услуги',
    text: 'Индивидуальный и пакетный формат ремонта — команда и понятный график от старта до сдачи.',
  },
  {
    to: '/projects',
    label: 'Проекты',
    text: 'Реализованные квартиры и интерьеры: площадь, срок, бюджет и фотографии готового результата.',
  },
  {
    to: '/blog',
    label: 'Журнал',
    text: 'Практические статьи об этапах ремонта, инженерии и комплектации без лишней воды.',
  },
] as const

export default function PricesRoute() {
  const { categories, hubFaq } = useLoaderData<typeof loader>()

  const offerCatalogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Прайс-лист Анфас — категории работ',
    url: absoluteUrl(getPriceHubHref()),
    itemListElement: categories.map((category) => ({
      '@type': 'Offer',
      name: category.title,
      price: category.priceFrom,
      priceCurrency: 'RUB',
      url: absoluteUrl(getPriceCategoryHref(category.slug)),
    })),
  }

  const faqPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: hubFaq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <main className={styles.pricesPage}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerCatalogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
      />

      <PricesHero
        eyebrow="Прайс-лист Анфас"
        title="Ориентировочные цены на ремонт квартир"
        titleAccent="ремонт квартир"
        lead={`${categories.length} категорий работ с ценами «от»: от демонтажа и штукатурки до электромонтажа и потолков. Изучите ориентиры по стоимости и получите полный прайс-лист по заявке.`}
      />

      <section className={styles.section}>
        <PageWrapper className={styles.contentFlow}>
          <SectionHeader
            className={styles.sectionHeader}
            label="Категории работ"
            title={
              <>
                Выберите вид работ
                <br />и <em>узнайте цену</em>
              </>
            }
            lead="У каждой категории — собственная страница с превью популярных позиций, пояснениями и ценами «от»."
          />
          <PricesCategoryGrid categories={categories} />
          <PricesSeoNote
            title="Про ориентировочные цены"
            text="Все цены на сайте — ориентир и зависят от состояния объекта, материалов и объёма работ. Итоговую стоимость фиксируем в смете после бесплатного замера."
          />
          <PricesFaq items={hubFaq} />
          <PricesCta
            title="Нужен точный расчёт по вашей квартире?"
            lead="Оставьте заявку — пришлём на почту полный прайс-лист со всеми категориями и позициями, без ограничений превью."
            source="prices-hub"
          />

          <div className={styles.linksSection}>
            <h2 className={styles.linksTitle}>Смотрите также</h2>
            <div className={styles.links}>
              {secondaryLinks.map((link) => (
                <Link className={styles.linkCard} key={link.to} to={link.to}>
                  <strong>{link.label}</strong>
                  <p>{link.text}</p>
                  <span>
                    Перейти
                    <ArrowIcon size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </PageWrapper>
      </section>
    </main>
  )
}
