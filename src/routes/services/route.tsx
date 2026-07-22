import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import { services } from '@/entities/service/model/services.data'
import { innerHeroImages } from '@/shared/config/hero-media'
import { createSeoMeta } from '@/shared/config/seo'
import { OpenLeadForm } from '@/shared/ui/open-lead-form'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './ServicesRoute.module.scss'

export const meta = () =>
  createSeoMeta({
    title: 'Услуги ремонта квартир под ключ | Анфас',
    description:
      'Индивидуальный и пакетный ремонт квартир под ключ в Санкт-Петербурге. Понятные сроки, прозрачная смета, комплектация и одна команда на весь проект.',
    keywords:
      'ремонт квартир под ключ спб, индивидуальный ремонт, пакетный ремонт, дизайн и ремонт квартиры, ремонт квартиры с комплектацией',
    path: '/services',
  })

const heroCards = [
  {
    label: 'Индивидуальный формат',
    text: 'Подходит, если нужен интерьер под вас, гибкая планировка и точная работа с деталями без шаблонных решений.',
  },
  {
    label: 'Пакетный формат',
    text: 'Подходит, если важны быстрый старт, понятный бюджет и собранные решения без перегруза и лишних согласований.',
  },
] as const

export default function ServicesRoute() {
  const hero = innerHeroImages.services

  return (
    <main className={styles.servicesPage}>
      <section className={styles.servicesPage__hero}>
        <img className={styles.servicesPage__heroMedia} src={hero.image} alt={hero.alt} />
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
              Сейчас у нас два основных формата: индивидуальный и пакетный ремонт. Оба ведут к
              готовому интерьеру под ключ, но отличаются глубиной проектирования, количеством
              решений и темпом запуска.
            </p>
          </div>

          <div className={styles.servicesPage__heroAside}>
            {heroCards.map((card) => (
              <article className={styles.servicesPage__heroCard} key={card.label}>
                <span className={styles.servicesPage__heroCardLabel}>{card.label}</span>
                <p className={styles.servicesPage__heroCardText}>{card.text}</p>
              </article>
            ))}
          </div>
        </PageWrapper>
      </section>

      <section className={styles.servicesPage__surfaceLight}>
        <PageWrapper>
          <section className={styles.servicesPage__section}>
            <div className={styles.servicesPage__sectionHeader}>
              <p className={styles.servicesPage__sectionLabel}>Два формата работы</p>
              <h2 className={styles.servicesPage__sectionTitle}>
                Выбирайте путь,
                <br />
                который <em>подходит именно вам</em>
              </h2>
              <p className={styles.servicesPage__sectionLead}>
                Мы не перегружаем страницу десятком псевдоуслуг. Сейчас фокус на двух направлениях,
                которые закрывают основные сценарии клиента: персональный интерьер под себя и
                пакетный ремонт квартиры с быстрым стартом.
              </p>
            </div>

            <div className={styles.servicesPage__servicesGrid}>
              {services.map((service, index) => (
                <article
                  className={`${styles.servicesPage__serviceCard} ${
                    index % 2 === 1 ? styles.servicesPage__serviceCard_reverse : ''
                  }`}
                  id={service.id}
                  key={service.id}
                  data-reveal
                >
                  <div className={styles.servicesPage__serviceMedia}>
                    <img className={styles.servicesPage__serviceImage} src={service.image} alt={service.title} />
                    <span className={styles.servicesPage__serviceBadge}>{service.tags[0]}</span>
                    <span className={styles.servicesPage__serviceNumber}>{service.number}</span>
                  </div>

                  <div className={styles.servicesPage__serviceBody}>
                    <h2 className={styles.servicesPage__serviceTitle}>{service.title}</h2>
                    <p className={styles.servicesPage__serviceText}>{service.text}</p>
                    <p className={styles.servicesPage__serviceLead}>{service.lead}</p>

                    <ul className={styles.servicesPage__serviceTags}>
                      {service.tags.map((tag) => (
                        <li className={styles.servicesPage__serviceTag} key={tag}>
                          {tag}
                        </li>
                      ))}
                    </ul>

                    <ul className={styles.servicesPage__serviceBullets}>
                      {service.bullets.map((bullet) => (
                        <li className={styles.servicesPage__serviceBullet} key={bullet}>
                          {bullet}
                        </li>
                      ))}
                    </ul>

                    <div className={styles.servicesPage__serviceMetrics}>
                      {service.metrics.map((metric) => (
                        <div className={styles.servicesPage__serviceMetric} key={metric.label}>
                          <strong className={styles.servicesPage__serviceMetricValue}>{metric.value}</strong>
                          <span className={styles.servicesPage__serviceMetricLabel}>{metric.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.servicesPage__serviceFoot}>
                      <div className={styles.servicesPage__serviceMeta}>
                        <strong className={styles.servicesPage__servicePrice}>{service.price}</strong>
                        <span className={styles.servicesPage__serviceDuration}>{service.duration}</span>
                      </div>
                      <ModalTriggerButton
                        className={styles.servicesPage__serviceButton}
                        intent={service.id}
                        source={`services-${service.id}`}
                      >
                        {service.ctaLabel}
                      </ModalTriggerButton>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </PageWrapper>
      </section>

      <section className={styles.servicesPage__surfaceDark}>
        <PageWrapper>
          <section className={styles.servicesPage__section}>
            <div className={styles.servicesPage__sectionHeader}>
              <p className={styles.servicesPage__sectionLabel}>Как понять, что ближе</p>
              <h2 className={styles.servicesPage__sectionTitle}>
                Кому подходит
                <br />
                <em>каждый формат</em>
              </h2>
            </div>

            <div className={styles.servicesPage__compare}>
              <article className={styles.servicesPage__compareCard} data-reveal>
                <span className={styles.servicesPage__compareLabel}>Индивидуальный ремонт</span>
                <h3 className={styles.servicesPage__compareTitle}>Когда важны уникальность и гибкость</h3>
                <p className={styles.servicesPage__compareText}>
                  Подходит, если вы хотите интерьер не по шаблону, готовы прорабатывать детали и
                  хотите собрать пространство под свой ритм жизни, привычки и долгий горизонт
                  использования.
                </p>
              </article>

              <article className={styles.servicesPage__compareCard} data-reveal>
                <span className={styles.servicesPage__compareLabel}>Пакетный ремонт</span>
                <h3 className={styles.servicesPage__compareTitle}>Когда важны скорость и предсказуемость</h3>
                <p className={styles.servicesPage__compareText}>
                  Подходит, если вы хотите быстрее перейти к результату, заранее понимать бюджет и
                  не тратить недели на сравнение каждого материала, света и позиции вручную.
                </p>
              </article>
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
            lead="Если пока неясно, что лучше для вашей квартиры, оставьте имя и телефон. Мы свяжемся, уточним задачу и подскажем, с чего лучше начать: с индивидуального проекта или с пакетного ремонта."
            successMessage="Спасибо. Форма прошла клиентскую валидацию. Следующим шагом можно подключить отправку заявок в Telegram, почту или CRM."
          />
        </PageWrapper>
      </section>
    </main>
  )
}
