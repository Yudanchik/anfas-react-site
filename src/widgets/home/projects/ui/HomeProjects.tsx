import { Link } from 'react-router'

import { assetUrl } from '@/shared/lib/asset-url'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
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
      <div className={styles.projectshead}>
        <div className={styles.sectionkicker + ' ' + styles.sectionkickerlight} data-reveal>
          <span>04</span>
          <p>Реализованные проекты</p>
        </div>
        <h2 data-reveal>Говорим работами.</h2>
        <p data-reveal>
          Здесь не визуализации. Это пространства, которые уже живут вместе со своими владельцами.
        </p>
      </div>

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
                <ArrowIcon />
              </div>
            </div>
            <div className={styles.projectcopy}>
              <div>
                <p>{project.type}</p>
                <h3>{project.title}</h3>
              </div>
              <dl>
                <div>
                  <dt>Площадь</dt>
                  <dd>{project.area}</dd>
                </div>
                <div>
                  <dt>Срок</dt>
                  <dd>{project.term}</dd>
                </div>
                <div>
                  <dt>Бюджет работ</dt>
                  <dd>{project.price}</dd>
                </div>
              </dl>
            </div>
          </Link>
        ))}
      </div>

      <Link className={styles.textlink} to="/projects" data-reveal>
        <span>Посмотреть все проекты</span>
        <ArrowIcon />
      </Link>
    </section>
  )
}
