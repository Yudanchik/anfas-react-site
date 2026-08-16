import { useLoaderData, type LoaderFunctionArgs } from 'react-router'

import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import { serviceRepository } from '@/entities/service/api'
import { getServiceHref } from '@/entities/service/model/services.data'
import { createSeoMeta } from '@/shared/config/seo'
import { assetUrl } from '@/shared/lib/asset-url'
import { NotFoundState } from '@/shared/ui/not-found-state'
import { OpenLeadForm } from '@/shared/ui/open-lead-form'
import { PageWrapper } from '@/shared/ui/page-wrapper'
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
    image: `/${data.service.image.replace(/^\/+/, '')}`,
  })
}

export function ErrorBoundary() {
  return <NotFoundState />
}

export default function ServiceRoute() {
  const { service } = useLoaderData<typeof loader>()

  return (
    <main className={styles.servicePage}>
      <section className={styles.servicePage__hero}>
        <img
          className={styles.servicePage__heroMedia}
          src={assetUrl(service.image)}
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
              {service.hero.titleLine}
              <br />
              <em>{service.hero.titleAccent}</em>
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
                  <span>{item.label}</span>
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
                <>
                  Обсудим индивидуальный
                  <br />
                  <em>проект вашей квартиры</em>
                </>
              ) : (
                <>
                  Рассчитаем пакетный
                  <br />
                  <em>ремонт под вашу площадь</em>
                </>
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
