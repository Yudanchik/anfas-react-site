import { services } from '@/entities/service/model/services.data'
import { useBrief } from '@/features/brief/model/BriefContext'

import { SeoContentBlock, seoContentPages } from '@/widgets/seo-content'

import styles from '../_shared/InnerPage.module.scss'

export const meta = () => [
  { title: 'Услуги ремонта квартир под ключ | Анфас' },
  {
    name: 'description',
    content:
      'Ремонт квартир под ключ, дизайнерский ремонт, пакетные решения и комплексный подход в Санкт-Петербурге. Понятные этапы и прозрачные условия.',
  },
]

export default function ServicesRoute() {
  const { openBrief } = useBrief()

  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>Услуги</p>
      <h1 className={styles.title}>
        Один подрядчик.
        <br />
        <em>Весь путь.</em>
      </h1>

      <SeoContentBlock {...seoContentPages.services} />

      <div className={styles.grid}>
        {services.map((service) => (
          <article className={styles.card} id={service.id} key={service.id}>
            <div className={styles.cardHeader}>
              <h2>{service.title}</h2>
              <span>{service.number}</span>
            </div>
            <p className={styles.lead}>{service.text}</p>
          </article>
        ))}
      </div>

      <button className={styles.button} type="button" onClick={openBrief}>
        Обсудить проект
      </button>
    </main>
  )
}
