import { services } from '@/entities/service/model/services.data'
import { useBrief } from '@/features/brief/model/BriefContext'

import styles from '../_shared/InnerPage.module.scss'

export const meta = () => [
  { title: 'Услуги — Анфас' },
  {
    name: 'description',
    content: 'Дизайн-проект, ремонт под ключ и авторский надзор в Санкт-Петербурге.',
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
