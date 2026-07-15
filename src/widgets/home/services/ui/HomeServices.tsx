import { Link } from 'react-router'

import { services } from '@/entities/service/model/services.data'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '../../ui'
import styles from './HomeServices.module.scss'

export function HomeServices() {
  return (
    <section id="services" className={styles.services + ' ' + styles.services_sectionPad}>
      <PageWrapper className={styles.container}>
        <SectionHeader
          tone="dark"
          number="02"
          label="Что мы делаем"
          title={
            <>
              Один подрядчик.
              <br />
              <em>Весь путь.</em>
            </>
          }
          lead="От первой линии на плане до последней лампы: одна команда отвечает за результат целиком."
        />

        <div className={styles.services__list}>
          {services.map((service) => (
            <article className={styles.services__card} key={service.id} data-reveal="scale">
              <span className={styles.services__number}>{service.number}</span>
              <div className={styles.services__cardBody}>
                <h3 className={styles.services__cardTitle}>{service.title}</h3>
                <p className={styles.services__cardText}>{service.text}</p>
              </div>
              <ul className={styles.services__tags}>
                {service.tags.map((tag) => (
                  <li className={styles.services__tag} key={tag}>
                    {tag}
                  </li>
                ))}
              </ul>
              <Link
                className={styles.services__link}
                to={`/services#${service.id}`}
                aria-label={`Подробнее: ${service.title}`}
              >
                <ArrowIcon size={16} />
              </Link>
            </article>
          ))}
        </div>
      </PageWrapper>
    </section>
  )
}
