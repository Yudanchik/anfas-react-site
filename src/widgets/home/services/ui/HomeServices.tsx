import { Link } from 'react-router'

import { services } from '@/entities/service/model/services.data'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import styles from './HomeServices.module.scss'

export function HomeServices() {
  return (
    <section id="services" className={styles.services + ' ' + styles.sectionpad}>
      <div className={styles.sectionhead} data-reveal>
        <div>
          <div className={styles.sectionkicker + ' ' + styles.sectionkickerlight}>
            <span>03</span>
            <p>Что мы делаем</p>
          </div>
          <h2>
            Один подрядчик.
            <br />
            <em>Весь путь.</em>
          </h2>
        </div>
        <p>
          От первой линии на плане до последней лампы: одна команда отвечает за результат целиком.
        </p>
      </div>

      <div className={styles.servicelist}>
        {services.map((service) => (
          <article className={styles.servicecard} key={service.id} data-reveal>
            <span className={styles.servicenumber}>{service.number}</span>
            <div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </div>
            <ul>
              {service.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <Link to={`/services#${service.id}`} aria-label={`Подробнее: ${service.title}`}>
              <ArrowIcon />
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
