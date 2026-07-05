import { Link, useLoaderData } from 'react-router'

import { projectRepository } from '@/entities/project/api'
import { assetUrl } from '@/shared/lib/asset-url'
import { SeoContentBlock, seoContentPages } from '@/widgets/seo-content'

import styles from '../_shared/InnerPage.module.scss'

export async function loader() {
  return {
    projects: await projectRepository.getAll(),
  }
}

export const meta = () => [
  { title: 'Проекты — Анфас' },
  {
    name: 'description',
    content: 'Реализованные проекты дизайна и ремонта квартир в Санкт-Петербурге.',
  },
]

export default function ProjectsRoute() {
  const { projects } = useLoaderData<typeof loader>()

  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>Реализованные проекты</p>
      <h1 className={styles.title}>
        Пространства,
        <br />
        которые уже <em>живут.</em>
      </h1>
      <p className={styles.lead}>
        Реальные квартиры и коммерческие пространства с открытыми сроками, площадью и бюджетом
        работ.
      </p>

      <SeoContentBlock {...seoContentPages.projects} />

      <div className={styles.grid}>
        {projects.map((project) => (
          <Link className={styles.card} key={project.slug} to={`/projects/${project.slug}`}>
            <div className={styles.image}>
              <img src={assetUrl(project.image)} alt={project.type} />
            </div>
            <div className={styles.cardHeader}>
              <div>
                <span>{project.type}</span>
                <h2>{project.title}</h2>
              </div>
              <span>{project.area}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
