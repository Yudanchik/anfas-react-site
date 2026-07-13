import { useBrief } from '@/features/brief/model/BriefContext'
import { innerHeroImages } from '@/shared/config/hero-media'
import { company } from '@/shared/config/company'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from '../_shared/InnerPage.module.scss'

const contactCards = [
  {
    mark: '01',
    label: 'Телефон',
    title: company.phone,
    action: 'Позвонить',
    text: 'Быстрый способ обсудить ремонт квартиры под ключ, сроки, бюджет и подходящий формат работы.',
    href: company.phoneHref,
  },
  {
    mark: '02',
    label: 'Почта',
    title: company.email,
    action: 'Написать',
    text: 'Подходит для планировок, референсов, смет, технических заданий и подробных вопросов по проекту.',
    href: company.emailHref,
  },
  {
    mark: '03',
    label: 'Офис',
    title: company.addressShort,
    action: 'Открыть карту',
    text: `${company.office}. Встречу лучше согласовать заранее, чтобы команда подготовилась к вашему объекту.`,
    href: company.mapHref,
  },
] as const

const contactSteps = [
  'Расскажите, какая квартира, какой метраж и на каком этапе объект.',
  'Пришлите планировку, фото или референсы, если они уже есть.',
  'Мы подскажем, подходит ли индивидуальный проект или капсульный ремонт.',
] as const

const heroMeta = [
  { label: 'Город', value: 'Санкт-Петербург' },
  { label: 'Форматы', value: 'индивидуальный и капсульный ремонт' },
  { label: 'Ответ', value: 'в рабочее время' },
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

export const meta = () => [
  { title: 'Контакты Анфас — ремонт квартир под ключ в Санкт-Петербурге' },
  {
    name: 'description',
    content:
      'Контакты Anfas: телефон, почта, офис в Санкт-Петербурге и реквизиты компании. Обсудим ремонт квартиры под ключ, дизайн-проект или капсульный формат.',
  },
  {
    name: 'keywords',
    content:
      'контакты анфас, ремонт квартир спб контакты, ремонт под ключ санкт-петербург, дизайн проект квартиры спб, капсульный ремонт',
  },
  { property: 'og:title', content: 'Контакты Анфас — ремонт квартир под ключ в Санкт-Петербурге' },
  {
    property: 'og:description',
    content:
      'Телефон, почта, офис и реквизиты Anfas. Поможем выбрать формат ремонта и обсудим ваш проект.',
  },
]

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
              Свяжитесь с Anfas, если хотите ремонт квартиры под ключ в Санкт-Петербурге без хаоса:
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
          <section className={styles.contactCards} aria-label="Способы связи">
            {contactCards.map((card) => {
              const isExternal = card.href.startsWith('http')

              return (
                <a
                  className={styles.contactCard}
                  href={card.href}
                  key={card.label}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noreferrer' : undefined}
                >
                  <b className={styles.contactCardMark}>{card.mark}</b>
                  <span>{card.label}</span>
                  <h2>{card.title}</h2>
                  <p>{card.text}</p>
                  <strong className={styles.contactCardAction}>{card.action}</strong>
                </a>
              )
            })}
          </section>

          <section className={styles.contactInfoGrid}>
            <article className={styles.contactDarkCard}>
              <span>Как начать</span>
              <h2>Три шага до понятного разговора.</h2>
              <ol>
                {contactSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <button className={styles.buttonLight} type="button" onClick={() => openBrief('general')}>
                Заполнить короткий бриф
              </button>
            </article>

            <article className={styles.contactMapCard}>
              <span>Офис Anfas</span>
              <h2>{company.addressShort}</h2>
              <p>
                {company.office}. Приезжайте на встречу после согласования времени: так мы заранее
                подготовим вопросы по вашей квартире, ремонту и бюджету.
              </p>
              <a href={company.mapHref} target="_blank" rel="noreferrer">
                Открыть маршрут
              </a>
            </article>
          </section>

          <section className={styles.contactSocials} aria-label="Социальные сети">
            <div>
              <span>Соцсети</span>
              <h2>Показываем проекты, процессы и детали ремонта.</h2>
            </div>
            <nav aria-label="Социальные сети Anfas">
              {socialLinks.map((link) => (
                <a href={link.href} key={link.label} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ))}
            </nav>
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
