import type { ServiceIncluded as ServiceIncludedData } from '@/entities/service/model/services.data'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '@/widgets/home/ui/SectionHeader'

import styles from './ServiceIncluded.module.scss'

type ServiceIncludedProps = {
  included: ServiceIncludedData
}

export function ServiceIncluded({ included }: ServiceIncludedProps) {
  return (
    <section className={styles.section}>
      <PageWrapper>
        <div className={styles.intro}>
          <p className={styles.label}>{included.label}</p>
          <SectionHeader
            className={styles.header}
            title={
              <>
                {included.titleMain}
                <br />
                <em>{included.titleAccent}</em>
              </>
            }
            lead={included.lead}
          />
        </div>

        <div className={styles.layout}>
          <aside className={styles.fitCard} data-reveal>
            <span className={styles.fitLabel}>{included.fit.label}</span>
            <h2 className={styles.fitTitle}>{included.fit.title}</h2>
            <p className={styles.fitText}>{included.fit.text}</p>
            <ul className={styles.fitList}>
              {included.fit.points.map((point) => (
                <li className={styles.fitItem} key={point}>
                  {point}
                </li>
              ))}
            </ul>
          </aside>

          <div className={styles.groups}>
            {included.groups.map((group) => (
              <article className={styles.group} key={group.title} data-reveal>
                <div className={styles.groupHead}>
                  <h3 className={styles.groupTitle}>{group.title}</h3>
                  <p className={styles.groupText}>{group.text}</p>
                </div>
                <ul className={styles.list}>
                  {group.items.map((item) => (
                    <li className={styles.item} key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <p className={styles.note}>{included.note}</p>
      </PageWrapper>
    </section>
  )
}
