import { Link } from 'react-router'

import { assetUrl } from '@/shared/lib/asset-url'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { SectionHeader } from '../../ui'
import styles from './HomeProjects.module.scss'

export function HomeProjects({
  projects,
}: {
  projects: ReadonlyArray<{
    slug: string
    size: string
    image: string
    type: string
    title: string
    area: string
    term: string
    price: string
  }>
}) {
  return (
    <section id="projects" className={`${styles.projects} ${styles.projects_sectionPad}`}>
      <SectionHeader
        tone="dark"
        number="05"
        label="Реализованные проекты"
        title="Говорим работами."
        lead="Готовые интерьеры после сдачи — пространства, в которых уже живут люди."
      />

      <div className={styles.projects__grid}>
        {projects.map((project, index) => (
          <Link
            className={`${styles.projects__card} ${project.size === 'wide' ? styles.projects__card_wide : styles.projects__card_standard}`}
            key={project.slug}
            to={`/projects/${project.slug}`}
            data-reveal
          >
            <div className={styles.projects__imageWrap}>
              <img className={styles.projects__image} src={assetUrl(project.image)} alt={project.type} />
              <span className={styles.projects__index}>0{index + 1}</span>
              <div className={styles.projects__action}>
                <ArrowIcon size={18} />
              </div>
            </div>
            <div className={styles.projects__copy}>
              <div className={styles.projects__copyMain}>
                <p className={styles.projects__type}>{project.type}</p>
                <h3 className={styles.projects__title}>{project.title}</h3>
              </div>
              <dl className={styles.projects__meta}>
                <div className={styles.projects__metaItem}>
                  <dt className={styles.projects__metaLabel}>Площадь</dt>
                  <dd className={styles.projects__metaValue}>{project.area}</dd>
                </div>
                <div className={styles.projects__metaItem}>
                  <dt className={styles.projects__metaLabel}>Срок</dt>
                  <dd className={styles.projects__metaValue}>{project.term}</dd>
                </div>
                <div className={styles.projects__metaItem}>
                  <dt className={styles.projects__metaLabel}>Бюджет работ</dt>
                  <dd className={styles.projects__metaValue}>{project.price}</dd>
                </div>
              </dl>
            </div>
          </Link>
        ))}
      </div>

      <Link className={styles.projects__textLink} to="/projects" data-reveal>
        <span>Посмотреть все проекты</span>
        <ArrowIcon size={16} />
      </Link>
    </section>
  )
}
