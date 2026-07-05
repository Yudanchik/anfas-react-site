import { Link } from 'react-router'

import { assetUrl } from '@/shared/lib/asset-url'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

export function HomeProjects({ projects }: {
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
<section id="projects" className="projects section-pad">
        <div className="projects-head">
          <div className="section-kicker light" data-reveal>
            <span>03</span>
            <p>Реализованные проекты</p>
          </div>
          <h2 data-reveal>Говорим работами.</h2>
          <p data-reveal>
            Здесь не визуализации. Это пространства, которые уже живут вместе со своими владельцами.
          </p>
        </div>

        <div className="project-grid">
          {projects.map((project, index) => (
            <Link
              className={`project-card project-${project.size}`}
              key={project.slug}
              to={`/projects/${project.slug}`}
              data-reveal
            >
              <div className="project-image-wrap">
                <img src={assetUrl(project.image)} alt={project.type} />
                <span className="project-index">0{index + 1}</span>
                <div className="project-action">
                  <ArrowIcon />
                </div>
              </div>
              <div className="project-copy">
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

        <Link className="text-link" to="/projects" data-reveal>
          <span>Посмотреть все проекты</span>
          <ArrowIcon />
        </Link>
      </section>

      
  )
}
