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
    <section id="projects" className={styles.projects + ' ' + styles.sectionpad}>
      <SectionHeader
        tone="dark"
        number="05"
        label="Реализованные проекты"
        title="Говорим работами."
        lead="Здесь не визуализации. Это пространства, которые уже живут вместе со своими владельцами."
      />

      <div className={styles.projectgrid}>
        {projects.map((project, index) => (
          <Link
            className={`${styles.projectcard} ${project.size === 'wide' ? styles.projectwide : styles.projectstandard}`}
            key={project.slug}
            to={`/projects/${project.slug}`}
            data-reveal
          >
            <div className={styles.projectimagewrap}>
              <img src={assetUrl(project.image)} alt={project.type} />
              <span className={styles.projectindex}>0{index + 1}</span>
              <div className={styles.projectaction}>
                <ArrowIcon size={18} />
              </div>
            </div>
            <div className={styles.projectcopy}>
              <div className={styles.projectcopymain}>
                <p className={styles.projecttype}>{project.type}</p>
                <h3 className={styles.projecttitle}>{project.title}</h3>
              </div>
              <dl className={styles.projectmeta}>
                <div className={styles.projectmetaitem}>
                  <dt className={styles.projectmetalabel}>Площадь</dt>
                  <dd className={styles.projectmetavalue}>{project.area}</dd>
                </div>
                <div className={styles.projectmetaitem}>
                  <dt className={styles.projectmetalabel}>Срок</dt>
                  <dd className={styles.projectmetavalue}>{project.term}</dd>
                </div>
                <div className={styles.projectmetaitem}>
                  <dt className={styles.projectmetalabel}>Бюджет работ</dt>
                  <dd className={styles.projectmetavalue}>{project.price}</dd>
                </div>
              </dl>
            </div>
          </Link>
        ))}
      </div>

      <Link className={styles.textlink} to="/projects" data-reveal>
        <span>Посмотреть все проекты</span>
        <ArrowIcon size={16} />
      </Link>
    </section>
  )
}
