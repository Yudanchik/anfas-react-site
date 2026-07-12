import { useBrief } from '@/features/brief/model/BriefContext'
import { company } from '@/shared/config/company'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from '../_shared/InnerPage.module.scss'

const contactCards = [
  {
    label: 'Телефон',
    title: company.phone,
    text: 'Позвоните, если хотите быстро обсудить ремонт квартиры, сроки, бюджет или формат работы.',
    href: company.phoneHref,
  },
  {
    label: 'Почта',
    title: company.email,
    text: 'Удобно для планировок, референсов, смет, технических заданий и подробных вопросов.',
    href: company.emailHref,
  },
  {
    label: 'Офис',
    title: company.addressShort,
    text: `${company.office}. Встречу лучше согласовать заранее, чтобы команда была готова к вашему проекту.`,
    href: company.mapHref,
  },
] as const

const contactSteps = [
  'Расскажите, какая квартира и на каком этапе объект.',
  'Пришлите планировку, метраж или несколько фото, если они уже есть.',
  'Мы подскажем, подходит ли индивидуальный проект или капсульный ремонт.',
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

  return (
    <main className={styles.page}>
      <PageWrapper>
        <section className={styles.contactHero}>
          <div>
            <p className={styles.eyebrow}>Контакты</p>
            <h1 className={styles.title}>
              Давайте обсудим
              <br />
              <em>ваш ремонт.</em>
            </h1>
            <p className={styles.lead}>
              Свяжитесь с Anfas, если хотите ремонт квартиры под ключ в Санкт-Петербурге без
              хаоса: с понятной сметой, календарным планом, комплектацией и ответственностью одной
              команды.
            </p>
            <div className={styles.buttonRow}>
              <button className={styles.button} type="button" onClick={() => openBrief('general')}>
                Оставить заявку
              </button>
              <a className={styles.buttonGhost} href={company.phoneHref}>
                Позвонить
              </a>
            </div>
          </div>

          <aside className={styles.contactAccent} aria-label="Основные контакты">
            <span>Быстрая связь</span>
            <a href={company.phoneHref}>{company.phone}</a>
            <a href={company.emailHref}>{company.email}</a>
            <p>{company.workHours}</p>
          </aside>
        </section>

        <section className={styles.contactCards} aria-label="Способы связи">
          {contactCards.map((card) => (
            <a className={styles.contactCard} href={card.href} key={card.label} target={card.href.startsWith('http') ? '_blank' : undefined} rel={card.href.startsWith('http') ? 'noreferrer' : undefined}>
              <span>{card.label}</span>
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </a>
          ))}
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
    </main>
  )
}
