import { useBrief } from '@/features/brief/model/BriefContext'
import { innerHeroImages } from '@/shared/config/hero-media'
import { company } from '@/shared/config/company'
import { createSeoMeta } from '@/shared/config/seo'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './route.module.scss'

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

const contactSteps = [
  'Расскажите, какая квартира, какой метраж и на каком этапе объект.',
  'Пришлите планировку, фото или референсы, если они уже есть.',
  'Мы подскажем, подходит ли индивидуальный ремонт или пакетный ремонт.',
] as const

const heroMeta = [
  { label: 'Город', value: 'Санкт-Петербург' },
  { label: 'Старт', value: 'короткая консультация' },
  { label: 'Форматы', value: 'ремонт под ключ' },
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
    title: 'Контакты Анфас — ремонт квартир под ключ в Санкт-Петербурге',
    description:
      'Контакты Анфас: телефон, почта, офис в Санкт-Петербурге и реквизиты компании. Обсудим ремонт квартиры под ключ, дизайн-проект или пакетный формат.',
    keywords:
      'контакты анфас, ремонт квартир спб контакты, ремонт под ключ санкт-петербург, дизайн проект квартиры спб, пакетный ремонт',
    path: '/contacts',
  })

export default function ContactsRoute() {
  const { openBrief } = useBrief()
  const hero = innerHeroImages.contacts

  return (
    <main className={styles.heroPage}>
      <section className={styles.heroSection}>
        <img className={styles.heroMedia} src={hero.image} alt={hero.alt} />
        <PageWrapper className={styles.heroWrap}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>Контакты</p>
            <h1 className={styles.heroTitle}>
              Давайте обсудим
              <br />
              <em>ваш ремонт</em>
            </h1>
            <p className={styles.heroLead}>
              Свяжитесь с Анфас, если хотите ремонт квартиры под ключ в Санкт-Петербурге без хаоса:
              с понятной сметой, календарным планом, комплектацией и ответственностью одной команды.
            </p>

            <div className={styles.heroActions}>
              <button className={styles.heroPrimaryAction} type="button" onClick={() => openBrief('general')}>
                Оставить заявку
              </button>
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

      <section className={styles.darkSection}>
        <PageWrapper>
          <section className={styles.contactPanel} aria-labelledby="contacts-main-title">
            <div className={styles.contactPanel__content}>
              <div className={styles.contactPanel__details}>
                <span>Связаться с Анфас</span>
                <h2 id="contacts-main-title">Один блок для звонка, письма и встречи.</h2>
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

                <button className={styles.buttonLight} type="button" onClick={() => openBrief('general')}>
                  Заполнить короткий бриф
                </button>
              </div>

              <div className={styles.contactPanel__steps}>
                <span>Как начать</span>
                <ol>
                  {contactSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <article className={styles.contactPanel__map} aria-label="Карта офиса Анфас">
              <span>Карта</span>
              <h2>Маршрут до офиса</h2>
              <p>Откройте карту и согласуйте время встречи, чтобы команда заранее подготовилась к вашему объекту.</p>
              <a href={company.mapHref} target="_blank" rel="noreferrer">
                Открыть маршрут
              </a>
            </article>
          </section>
        </PageWrapper>
      </section>

      <section className={styles.lightSection}>
        <PageWrapper>
          <section className={styles.legalPanel} aria-label="Реквизиты компании">
            <div>
              <p className={styles.eyebrow}>Реквизиты</p>
              <h2>Юридическая информация.</h2>
            </div>
            <dl>
              {legalRows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </PageWrapper>
      </section>
    </main>
  )
}
