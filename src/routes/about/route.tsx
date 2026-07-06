import { SeoContentBlock, seoContentPages } from '@/widgets/seo-content'

import styles from '../_shared/InnerPage.module.scss'

export const meta = () => [
  { title: 'О компании Анфас — дизайн и ремонт квартир в Санкт-Петербурге' },
  {
    name: 'description',
    content:
      'Команда Анфас проектирует и ведет ремонт квартир в Санкт-Петербурге. Прозрачный процесс, понятные сроки и аккуратный результат.',
  },
  {
    name: 'keywords',
    content:
      'о компании анфас, ремонт квартир спб, дизайн интерьера, ремонт под ключ, команда дизайнеров и строителей',
  },
  { property: 'og:title', content: 'О компании Анфас — дизайн и ремонт квартир в Санкт-Петербурге' },
  {
    property: 'og:description',
    content:
      'Команда Анфас проектирует и ведет ремонт квартир в Санкт-Петербурге. Прозрачный процесс, понятные сроки и аккуратный результат.',
  },
]

export default function AboutRoute() {
  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>О компании</p>
      <h1 className={styles.title}>
        Просто, честно,
        <br />
        <em>по делу.</em>
      </h1>
      <SeoContentBlock {...seoContentPages.about} />

      <div className={styles.content}>
        <h2>Кирилл и Антон</h2>
        <p>
          Мы берём на себя дизайн и ремонт квартиры под ключ. Клиент не должен разбираться в
          стройке, координировать подрядчиков и ездить на объект каждый день.
        </p>
      </div>
    </main>
  )
}

