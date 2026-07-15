import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './HomeManifesto.module.scss'

export function HomeManifesto() {
  return (
    <section className={styles.manifesto + ' ' + styles.manifesto_sectionPad}>
      <PageWrapper>
        <div className={styles.manifesto__statsRow} data-reveal>
          <div className={styles.manifesto__metaItem}>
            <span className={styles.manifesto__metaNumber}>13</span>
            <span className={styles.manifesto__metaLabel}>лет на рынке</span>
          </div>
          <div className={styles.manifesto__metaItem}>
            <span className={styles.manifesto__metaNumber}>100+</span>
            <span className={styles.manifesto__metaLabel}>сданных объектов</span>
          </div>
          <div className={styles.manifesto__metaItem}>
            <span className={styles.manifesto__metaNumber}>36&nbsp;мес</span>
            <span className={styles.manifesto__metaLabel}>гарантия на инженерку</span>
          </div>
          <div className={styles.manifesto__metaItem}>
            <span className={styles.manifesto__metaNumber}>0&nbsp;₽</span>
            <span className={styles.manifesto__metaLabel}>скрытых расходов</span>
          </div>
        </div>
      </PageWrapper>
    </section>
  )
}
