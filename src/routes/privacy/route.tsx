import { company } from '@/shared/config/company'
import { createSeoMeta } from '@/shared/config/seo'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './PrivacyRoute.module.scss'

const privacySummary = [
  { label: 'Оператор', value: company.legalOwner },
  { label: 'Связь по данным', value: company.email },
  { label: 'Последнее обновление', value: '12 июля 2026' },
] as const

const privacyCards = [
  {
    title: 'Что собираем',
    text: 'Имя, телефон, email, выбранный формат ремонта, сообщение из формы и технические данные сайта, если они нужны для работы аналитики и безопасности.',
  },
  {
    title: 'Зачем используем',
    text: 'Чтобы связаться с вами, обсудить ремонт квартиры под ключ, подготовить смету, записать на консультацию и улучшать работу сайта.',
  },
  {
    title: 'Как защищаем',
    text: 'Ограничиваем доступ к данным, используем их только для заявленных целей и не продаем третьим лицам.',
  },
] as const

const privacySections = [
  {
    title: '1. Общие положения',
    text: [
      `Настоящая политика объясняет, как ${company.legalOwner} обрабатывает персональные данные посетителей сайта Анфас и клиентов, которые оставляют заявки на ремонт, дизайн-проект, комплектацию или консультацию.`,
      'Оставляя заявку, звоня по телефону или отправляя сообщение на почту, вы подтверждаете, что ознакомились с политикой и даете согласие на обработку данных в объеме, необходимом для ответа на обращение.',
    ],
  },
  {
    title: '2. Какие данные могут обрабатываться',
    text: [
      'Мы можем обрабатывать имя, номер телефона, email, город, адрес объекта, выбранную услугу, комментарий к заявке, историю коммуникации, а также техническую информацию: IP-адрес, cookie, сведения о браузере и устройстве.',
      'Мы не запрашиваем специальные категории персональных данных и просим не передавать через формы сведения о здоровье, политических взглядах, религии и другие чувствительные данные.',
    ],
  },
  {
    title: '3. Цели обработки',
    text: [
      'Данные используются для обработки заявки, обратного звонка, подготовки предложения, расчета стоимости ремонта, согласования встречи или замера, ведения проекта и выполнения обязательств перед клиентом.',
      'Технические данные помогают анализировать работу сайта, защищать формы от спама, улучшать интерфейс и понимать, какие страницы удобнее для пользователей.',
    ],
  },
  {
    title: '4. Передача третьим лицам',
    text: [
      'Данные могут передаваться сервисам, которые обеспечивают работу сайта, хостинга, почты, CRM, аналитики, телефонии и форм обратной связи. Такие сервисы получают только тот объем данных, который нужен для выполнения технической или организационной задачи.',
      'Мы не продаем персональные данные и не передаем их для посторонней рекламы.',
    ],
  },
  {
    title: '5. Срок хранения',
    text: [
      'Данные хранятся столько, сколько требуется для обработки обращения, ведения коммуникации, выполнения договора, соблюдения требований закона и защиты законных интересов компании.',
      'Если данные больше не нужны для этих целей, мы удаляем их или обезличиваем.',
    ],
  },
  {
    title: '6. Права пользователя',
    text: [
      'Вы можете запросить информацию об обработке ваших данных, попросить уточнить, заблокировать или удалить данные, а также отозвать согласие на обработку.',
      `Для обращения напишите на ${company.email} или свяжитесь по телефону ${company.phone}. Мы обработаем запрос в порядке и сроки, предусмотренные законодательством РФ.`,
    ],
  },
] as const

export const meta = () =>
  createSeoMeta({
    title: 'Политика конфиденциальности — Анфас',
    description:
      'Политика обработки персональных данных Анфас: какие данные собирает сайт, зачем они нужны, как защищаются и как отозвать согласие.',
    path: '/privacy',
    robots: 'noindex, nofollow',
  })

export default function PrivacyRoute() {
  return (
    <main className={styles.page}>
      <PageWrapper>
        <section className={styles.documentHero}>
          <div>
            <p className={styles.eyebrow}>Документы</p>
            <h1 className={styles.title}>
              Политика
              <br />
              <em>конфиденциальности.</em>
            </h1>
            <p className={styles.lead}>
              Документ объясняет, какие персональные данные мы получаем через сайт, зачем они нужны
              и как вы можете управлять своим согласием.
            </p>
          </div>

          <aside className={styles.documentSummary} aria-label="Краткая информация о политике">
            {privacySummary.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </aside>
        </section>

        <section className={styles.documentCards} aria-label="Кратко о персональных данных">
          {privacyCards.map((card) => (
            <article className={styles.documentCard} key={card.title}>
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className={styles.documentLayout}>
          <aside className={styles.documentAside}>
            <span>Реквизиты оператора</span>
            <p>{company.legalOwner}</p>
            <p>ИНН {company.legalInn}</p>
            <p>КПП {company.legalKpp}</p>
            <p>
              {company.legalRegLabel} {company.legalRegNumber}
            </p>
            <p>{company.legalAddress}</p>
          </aside>

          <div className={styles.documentSections}>
            {privacySections.map((section) => (
              <section className={styles.documentSection} key={section.title}>
                <h2>{section.title}</h2>
                {section.text.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>
        </section>
      </PageWrapper>
    </main>
  )
}
