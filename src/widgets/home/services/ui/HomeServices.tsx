import { Link } from 'react-router'

import { services } from '@/entities/service/model/services.data'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { SectionHeader } from '../../ui'
import styles from './HomeServices.module.scss'

export function HomeServices() {
  return (
    <section id="services" className={styles.services + ' ' + styles.sectionpad}>
      <SectionHeader
        tone="dark"
        number="02"
        label="??? ?? ??????"
        title={
          <>
            ???? ?????????.
            <br />
            <em>???? ????.</em>
          </>
        }
        lead="?? ?????? ????? ?? ????? ?? ????????? ?????: ???? ??????? ???????? ?? ????????? ???????."
      />

      <div className={styles.servicelist}>
        {services.map((service) => (
          <article className={styles.servicecard} key={service.id} data-reveal="scale">
            <span className={styles.servicenumber}>{service.number}</span>
            <div className={styles.servicecardbody}>
              <h3 className={styles.servicecardtitle}>{service.title}</h3>
              <p className={styles.servicecardtext}>{service.text}</p>
            </div>
            <ul className={styles.servicecardtags}>
              {service.tags.map((tag) => (
                <li className={styles.servicecardtag} key={tag}>
                  {tag}
                </li>
              ))}
            </ul>
            <Link to={`/services#${service.id}`} aria-label={`?????????: ${service.title}`}>
              <ArrowIcon size={16} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
