import { Link, useLoaderData } from 'react-router'

import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import { serviceRepository } from '@/entities/service/api'
import { getServiceHref } from '@/entities/service/model/services.data'
import { innerHeroImages } from '@/shared/config/hero-media'
import { createSeoMeta } from '@/shared/config/seo'
import { assetUrl } from '@/shared/lib/asset-url'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { OpenLeadForm } from '@/shared/ui/open-lead-form'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './ServicesRoute.module.scss'

export async function loader() {
  return {
    services: await serviceRepository.getAll(),
  }
}

export const meta = () =>
  createSeoMeta({
    title: 'Услуги по ремонту и дизайну квартир в СПб | Анфас',
    description:
      'Индивидуальный и пакетный ремонт квартир в Санкт-Петербурге. Фиксированные сроки, согласованный бюджет и одна команда на весь проект.',
    keywords:
      'ремонт квартир под ключ спб, индивидуальный ремонт, пакетный ремонт, дизайн-проект квартиры, ремонт квартиры спб',
    path: '/services',
  })

export default function ServicesRoute() {
  const { services } = useLoaderData<typeof loader>()
  const hero = innerHeroImages.services

  return (
    <main className={styles.servicesPage}>
      <section className={styles.servicesPage__hero}>
        <img
          className={styles.servicesPage__heroMedia}
          src={hero.image}
          alt={hero.alt}
          width={hero.width}
          height={hero.height}
          loading="eager"
          decoding="sync"
        />
        <div className={styles.servicesPage__heroOverlay} />

        <PageWrapper className={styles.servicesPage__heroShell}>
          <div className={styles.servicesPage__heroContent}>
            <p className={styles.servicesPage__eyebrow}>Услуги Анфас</p>
            <h1 className={styles.servicesPage__title}>
              Ремонт квартиры
              <br />
              <em>под ваш сценарий жизни</em>
            </h1>
            <p className={styles.servicesPage__lead}>
              Два формата — индивидуальный и пакетный. Оба ведут к готовому интерьеру, но
              отличаются глубиной проектирования и темпом запуска.
            </p>
          </div>
        </PageWrapper>
      </section>

      <section className={styles.servicesPage__surfaceLight}>
        <PageWrapper>
          <section className={styles.servicesPage__section}>
            <div className={styles.servicesPage__sectionHeader}>
              <p className={styles.servicesPage__sectionLabel}>Форматы работы</p>
              <h2 className={styles.servicesPage__sectionTitle}>
                Выберите услугу
                <br />
                и <em>узнайте подробности</em>
              </h2>
            </div>

            <div className={styles.servicesPage__list}>
              {services.map((service) => (
                <article className={styles.servicesPage__card} key={service.id} data-reveal>
                  <Link
                    className={styles.servicesPage__cardMedia}
                    to={getServiceHref(service.slug)}
                    aria-label={`Подробнее: ${service.title}`}
                  >
                    <img
                      className={styles.servicesPage__cardImage}
                      src={assetUrl(service.image)}
                      alt={service.title}
                      width={service.imageWidth}
                      height={service.imageHeight}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className={styles.servicesPage__cardNumber}>{service.number}</span>
                  </Link>

                  <div className={styles.servicesPage__cardBody}>
                    <div className={styles.servicesPage__cardTop}>
                      <h2 className={styles.servicesPage__cardTitle}>
                        <Link to={getServiceHref(service.slug)}>{service.title}</Link>
                      </h2>
                      <ul className={styles.servicesPage__cardTags}>
                        {service.tags.map((tag) => (
                          <li className={styles.servicesPage__cardTag} key={tag}>
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className={styles.servicesPage__cardText}>{service.shortText}</p>

                    <div className={styles.servicesPage__cardFoot}>
                      <div className={styles.servicesPage__cardMeta}>
                        <strong className={styles.servicesPage__cardPrice}>{service.price}</strong>
                        <span className={styles.servicesPage__cardDuration}>{service.duration}</span>
                      </div>

                      <div className={styles.servicesPage__cardActions}>
                        <Link className={styles.servicesPage__cardLink} to={getServiceHref(service.slug)}>
                          Подробнее
                          <ArrowIcon size={16} />
                        </Link>
                        <ModalTriggerButton
                          className={styles.servicesPage__cardButton}
                          intent={service.id}
                          source={`services-index-${service.id}`}
                        >
                          {service.ctaLabel}
                        </ModalTriggerButton>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </PageWrapper>
      </section>

      <section className={styles.servicesPage__surfaceLight}>
        <PageWrapper>
          <OpenLeadForm
            className={styles.servicesPage__formSection}
            defaultService="individual"
            title={
              <>
                Оставьте заявку и мы поможем
                <br />
                <em>выбрать формат</em>
              </>
            }
            lead="Если пока неясно, что лучше для вашей квартиры, оставьте имя и телефон. Свяжемся, уточним задачу и подскажем, с чего начать — с индивидуального проекта или пакетного ремонта."
            successMessage="Спасибо. Форма прошла клиентскую валидацию. Следующим шагом можно подключить отправку заявок в Telegram, почту или CRM."
          />
        </PageWrapper>
      </section>
    </main>
  )
}
