import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './HomeManifesto.module.scss'

export function HomeManifesto() {
  return (
    <section className={styles.manifesto + ' ' + styles.sectionpad}>
      <PageWrapper>
        <div className={styles.statsrow} data-reveal>
          <div className={styles.metaitem}>
            <span className={styles.metanum}>13</span>
            <span className={styles.metalabel}>лет на рынке</span>
          </div>
          <div className={styles.metaitem}>
            <span className={styles.metanum}>100+</span>
            <span className={styles.metalabel}>сданных объектов</span>
          </div>
          <div className={styles.metaitem}>
            <span className={styles.metanum}>36&nbsp;мес</span>
            <span className={styles.metalabel}>гарантия на инженерку</span>
          </div>
          <div className={styles.metaitem}>
            <span className={styles.metanum}>0&nbsp;₽</span>
            <span className={styles.metalabel}>скрытых расходов</span>
          </div>
        </div>
      </PageWrapper>
    </section>
  )
}
