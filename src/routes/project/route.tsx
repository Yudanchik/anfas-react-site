import { useLoaderData, type LoaderFunctionArgs } from 'react-router'

import { projectRepository } from '@/entities/project/api'
import { assetUrl } from '@/shared/lib/asset-url'

import styles from '../_shared/InnerPage.module.scss'

export async function loader({ params }: LoaderFunctionArgs) {
  const project = await projectRepository.getBySlug(params.slug ?? '')

  if (!project) {
    throw new Response('Проект не найден', { status: 404 })
  }

  return { project }
}

export function meta({ data }: { data?: Awaited<ReturnType<typeof loader>> }) {
  if (!data) return [{ title: 'Проект не найден — Анфас' }]

  return [
    { title: `${data.project.title} — Анфас` },
    { name: 'description', content: data.project.description },
  ]
}

export default function ProjectRoute() {
  const { project } = useLoaderData<typeof loader>()

  return (
    <main>
      <section className={styles.projectHero}>
        <img className={styles.projectImage} src={assetUrl(project.image)} alt={project.type} />
        <div className={styles.projectContent}>
          <p className={styles.eyebrow}>{project.type}</p>
          <h1 className={styles.title}>{project.title}</h1>
          <dl className={styles.projectMeta}>
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
      </section>
      <section className={styles.page}>
        <div className={styles.content}>
          <h2>О проекте</h2>
          <p>{project.description}</p>
        </div>
      </section>
    </main>
  )
}
