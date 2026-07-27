import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import { innerHeroImages } from '@/shared/config/hero-media'
import { company } from '@/shared/config/company'
import { absoluteUrl, createSeoMeta } from '@/shared/config/seo'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { YandexOfficeMap } from '@/shared/ui/yandex-office-map'

import styles from './ContactsRoute.module.scss'

const contactDetails = [
  {
    label: 'Телефон',
    value: company.phone,
    href: company.phoneHref,
  },
  {
    label: 'Почта',
    value: company.email,
    href: company.emailHref,
  },
  {
    label: 'Адрес',
    value: `${company.addressShort}, ${company.office}`,
  },
  {
    label: 'График',
    value: company.workHours,
  },
] as const

const heroMeta = [
  { label: 'Город', value: 'Санкт-Петербург' },
  { label: 'Старт', value: 'короткая консультация' },
  { label: 'Форматы', value: 'индивидуальный, пакетный' },
] as const

const socialLinks = [
  { label: 'Telegram', href: company.telegramHref },
  { label: 'VK', href: company.vkHref },
  { label: 'YouTube', href: company.youtubeHref },
  { label: 'Instagram', href: company.instagramHref },
] as const

const legalRows = [
  ['Юридическое лицо', company.legalOwner],
  ['ИНН', company.legalInn],
  ['КПП', company.legalKpp],
  [company.legalRegLabel, company.legalRegNumber],
  ['Юридический адрес', company.legalAddress],
] as const

export const meta = () =>
  createSeoMeta({
    title: 'Контакты Анфас — ремонт и дизайн квартир в Санкт-Петербурге',
    description:
      'Телефон, почта и офис Анфас в Санкт-Петербурге. Обсудим дизайн-проект, пакетный или индивидуальный ремонт — подберём формат под вашу задачу.',
    keywords:
      'контакты анфас, ремонт квартир спб, ремонт под ключ санкт-петербург, дизайн-проект квартиры спб, пакетный ремонт, офис анфас',
    path: '/contacts',
  })

export default function ContactsRoute() {
  const hero = innerHeroImages.contacts
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.name,
    legalName: company.legalOwner,
    url: absoluteUrl('/contacts'),
    telephone: company.phone,
    email: company.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${company.addressShort}, ${company.office}`,
      addressLocality: 'Санкт-Петербург',
      addressCountry: 'RU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: company.mapCenter.lat,
      longitude: company.mapCenter.lon,
    },
    openingHours: 'Mo-Fr 10:00-19:00',
    sameAs: [company.vkHref, company.telegramHref, company.youtubeHref, company.instagramHref],
  }

  return (
    <main className={styles.heroPage}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <section className={styles.heroSection}>
        <img
          className={styles.heroMedia}
          src={hero.image}
          alt={hero.alt}
          width={hero.width}
          height={hero.height}
          loading="eager"
          decoding="sync"
        />
        <PageWrapper className={styles.heroWrap}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>Контакты</p>
            <h1 className={styles.heroTitle}>
              Давайте обсудим
              <br />
              <em>ваш ремонт</em>
            </h1>
            <p className={styles.heroLead}>
              Свяжитесь с Анфас, если планируете ремонт квартиры в Санкт-Петербурге. Обсудим задачу,
              подберём формат и назовём понятные сроки и бюджет.
            </p>

            <div className={styles.heroActions}>
              <ModalTriggerButton
                className={styles.heroPrimaryAction}
                intent="consultation"
                size="lg"
                source="contacts-hero"
              >
                Оставить заявку
              </ModalTriggerButton>
              <a className={styles.heroSecondaryAction} href={company.phoneHref}>
                Позвонить
              </a>
            </div>

            <div className={styles.heroStats}>
              {heroMeta.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <aside className={styles.heroAside}>
            <article className={styles.heroCard}>
              <span>Быстрая связь</span>
              <h2>{company.phone}</h2>
              <p>{company.email}</p>
              <p>{company.workHours}</p>
            </article>
          </aside>
        </PageWrapper>
      </section>

      <section className={styles.lightSection}>
        <PageWrapper>
          <section className={styles.contactPanel} aria-labelledby="contacts-main-title">
            <div className={styles.contactPanel__content}>
              <div className={styles.contactPanel__details}>
                <span>Связаться с Анфас</span>
                <h2 id="contacts-main-title">Контакты</h2>
                <dl>
                  {contactDetails.map((item) => (
                    <div key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>
                        {'href' in item ? (
                          <a href={item.href}>{item.value}</a>
                        ) : (
                          <span>{item.value}</span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>

                <nav className={styles.contactPanel__socials} aria-label="Социальные сети Анфас">
                  {socialLinks.map((link) => (
                    <a href={link.href} key={link.label} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ))}
                </nav>

                <ModalTriggerButton
                  className={styles.buttonLight}
                  intent="brief"
                  source="contacts-panel"
                >
                  Заполнить короткий бриф
                </ModalTriggerButton>
              </div>
            </div>

            <article className={styles.contactPanel__legal} aria-label="Реквизиты компании">
              <span>Реквизиты</span>
              <h2>Юридическая информация</h2>
              <dl>
                {legalRows.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          </section>

          <section className={styles.officeMapPanel} aria-labelledby="office-map-title">
            <div className={styles.officeMapPanel__copy}>
              <span>Карта</span>
              <h2 id="office-map-title">Офис Анфас на карте</h2>
              <p>
                {company.address}. Приезжайте по предварительной договорённости — команда заранее
                подготовится к встрече и разбору вашего объекта.
              </p>
              <a href={company.mapHref} target="_blank" rel="noreferrer">
                Построить маршрут
              </a>
            </div>

            <div className={styles.officeMapPanel__map}>
              <YandexOfficeMap />
            </div>
          </section>
        </PageWrapper>
      </section>
    </main>
  )
}
