import { company } from '@/shared/config/company'
import { useBrief } from '@/features/brief/model/BriefContext'

import { SeoContentBlock, seoContentPages } from '@/widgets/seo-content'

import styles from '../_shared/InnerPage.module.scss'

export const meta = () => [
  { title: 'Контакты Анфас — ремонт квартир под ключ в Санкт-Петербурге' },
  {
    name: 'description',
    content:
      'Свяжитесь с Анфас: телефон, почта и адрес в Санкт-Петербурге. Поможем выбрать формат ремонта и обсудим ваш проект.',
  },
  {
    name: 'keywords',
    content:
      'контакты анфас, ремонт квартир спб, консультация по ремонту, дизайнерский ремонт, пакетный ремонт',
  },
  { property: 'og:title', content: 'Контакты Анфас — ремонт квартир под ключ в Санкт-Петербурге' },
  {
    property: 'og:description',
    content:
      'Свяжитесь с Анфас: телефон, почта и адрес в Санкт-Петербурге. Поможем выбрать формат ремонта и обсудим ваш проект.',
  },
]

export default function ContactsRoute() {
  const { openBrief } = useBrief()

  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>Контакты</p>
      <h1 className={styles.title}>
        Давайте обсудим
        <br />
        <em>ваш интерьер.</em>
      </h1>
      <SeoContentBlock embedded {...seoContentPages.contacts} />

      <div className={styles.content}>
        <h2>Связаться</h2>
        <p>
          {company.phone}
          <br />
          {company.email}
          <br />
          {company.address}
        </p>
      </div>
      <button className={styles.button} type="button" onClick={openBrief}>
        Заполнить короткий бриф
      </button>
    </main>
  )
}

