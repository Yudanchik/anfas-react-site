import { useLoaderData, type LoaderFunctionArgs } from 'react-router'

import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import { serviceRepository } from '@/entities/service/api'
import { getServiceHref } from '@/entities/service/model/services.data'
import { absoluteUrl, createSeoMeta } from '@/shared/config/seo'
import { NotFoundState } from '@/shared/ui/not-found-state'
import { OpenLeadForm } from '@/shared/ui/open-lead-form'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SplitTitle } from '@/shared/ui/split-title'
import { ServiceIncluded } from '@/widgets/service/included'
import { HomeStoryIndividual } from '@/widgets/home/story-individual/ui/HomeStoryIndividual'
import { HomeStoryPackage } from '@/widgets/home/story-package/ui/HomeStoryPackage'

import styles from './ServiceRoute.module.scss'

export async function loader({ params }: LoaderFunctionArgs) {
  const service = await serviceRepository.getBySlug(params.slug ?? '')

  if (!service) {
    throw new Response('Услуга не найдена', { status: 404 })
  }

  return { service }
}

export function meta({ data }: { data?: Awaited<ReturnType<typeof loader>> }) {
  if (!data) {
    return createSeoMeta({
      title: 'Услуга не найдена — Анфас',
      path: '/services',
      robots: 'noindex, nofollow',
    })
  }

  return createSeoMeta({
    title: data.service.seo.title,
    description: data.service.seo.description,
    keywords: data.service.seo.keywords,
    path: getServiceHref(data.service.slug),
    image: data.service.image,
  })
}

export function ErrorBoundary() {
  return <NotFoundState />
}

export default function ServiceRoute() {
  const { service } = useLoaderData<typeof loader>()
  const serviceUrl = absoluteUrl(getServiceHref(service.slug))
  const priceFrom = service.id === 'package' ? 49000 : 55000
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${serviceUrl}#service`,
        name: service.title,
        description: service.seo.description,
        url: serviceUrl,
        image: absoluteUrl(service.image),
        areaServed: {
          '@type': 'City',
          name: 'Санкт-Петербург',
        },
        provider: { '@id': absoluteUrl('/#organization') },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'RUB',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: priceFrom,
            priceCurrency: 'RUB',
            unitCode: 'MTK',
            unitText: 'м²',
          },
          description: `${service.price}; срок ${service.duration}`,
          url: serviceUrl,
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
            name: 'Услуги',
            item: absoluteUrl('/services'),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: service.title,
            item: serviceUrl,
          },
        ],
      },
    ],
  }

  return (
    <main className={styles.servicePage}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className={styles.servicePage__hero}>
        <img
          className={styles.servicePage__heroMedia}
          src={service.image}
          alt={service.title}
          width={service.imageWidth}
          height={service.imageHeight}
          loading="eager"
          decoding="sync"
        />

        <PageWrapper className={styles.servicePage__heroWrap}>
          <div className={styles.servicePage__heroCopy}>
            <p className={styles.servicePage__heroEyebrow}>{service.hero.eyebrow}</p>
            <h1 className={styles.servicePage__heroTitle}>
              <SplitTitle line={service.hero.titleLine} accent={service.hero.titleAccent} />
            </h1>
            <p className={styles.servicePage__heroLead}>{service.hero.lead}</p>

            <div className={styles.servicePage__heroActions}>
              <ModalTriggerButton
                className={styles.servicePage__heroPrimaryAction}
                intent={service.id}
                size="lg"
                source={`service-hero-${service.id}`}
              >
                {service.ctaLabel}
              </ModalTriggerButton>
            </div>

            <div className={styles.servicePage__heroStats}>
              {service.hero.stats.map((item) => (
                <div key={item.label}>
                  <span>{item.label}{' '}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <aside className={styles.servicePage__heroAside}>
            <article className={styles.servicePage__heroCard}>
              <span className={styles.servicePage__heroCardEyebrow}>{service.hero.aside.eyebrow}</span>
              <strong className={styles.servicePage__heroCardTitle}>{service.hero.aside.title}</strong>
              <p className={styles.servicePage__heroCardText}>{service.hero.aside.text}</p>
            </article>
          </aside>
        </PageWrapper>
      </section>

      <ServiceIncluded included={service.included} />

      {service.id === 'individual' ? (
        <HomeStoryIndividual service={service} />
      ) : (
        <HomeStoryPackage service={service} tone="dark" />
      )}

      <section className={styles.servicePage__surfaceLight}>
        <PageWrapper>
          <OpenLeadForm
            key={service.id}
            className={styles.servicePage__formSection}
            defaultService={service.id}
            title={
              service.id === 'individual' ? (
                <SplitTitle
                  line="Обсудим индивидуальный"
                  accent="проект вашей квартиры"
                />
              ) : (
                <SplitTitle line="Рассчитаем пакетный" accent="ремонт под вашу площадь" />
              )
            }
            lead={
              service.id === 'individual'
                ? 'Оставьте имя и телефон — разберём задачу, площадь и подскажем, с чего начать дизайн-проект.'
                : 'Оставьте имя и телефон — уточним площадь, подберём эстетику и назовём фиксированную рамку бюджета.'
            }
            submitLabel={service.ctaLabel}
          />
        </PageWrapper>
      </section>
    </main>
  )
}
