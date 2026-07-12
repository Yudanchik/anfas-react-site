import { useLoaderData, type LoaderFunctionArgs } from 'react-router'

import { projectRepository } from '@/entities/project/api'
import { assetUrl } from '@/shared/lib/asset-url'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from '../_shared/InnerPage.module.scss'

export async function loader({ params }: LoaderFunctionArgs) {
  const project = await projectRepository.getBySlug(params.slug ?? '')

  if (!project) {
    throw new Response('Проект не найден', { status: 404 })
  }

  return { project }
}

export function meta({ data }: { data?: Awaited<ReturnType<typeof loader>> }) {
  if (!data) {
    return [
      { title: 'Проект не найден — Анфас' },
      { name: 'robots', content: 'noindex, nofollow' },
    ]
  }

  return [
    { title: `${data.project.title} — Анфас` },
    { name: 'description', content: data.project.description },
    {
      name: 'keywords',
      content: `${data.project.title}, ремонт квартир спб, дизайн интерьера, портфолио ремонта`,
    },
    { property: 'og:title', content: `${data.project.title} — Анфас` },
    { property: 'og:description', content: data.project.description },
  ]
}

export default function ProjectRoute() {
  const { project } = useLoaderData<typeof loader>()

  return (
    <main>
      <section className={styles.projectHero}>
        <img className={styles.projectImage} src={assetUrl(project.image)} alt={project.type} />
        <PageWrapper className={styles.projectWrapper}>
          <div className={styles.projectContent}>
            <p className={styles.eyebrow}>{project.location}</p>
            <h1 className={styles.title}>{project.type}</h1>
            <p className={styles.projectLead}>{project.description}</p>
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
        </PageWrapper>
      </section>
      <section className={styles.page}>
        <PageWrapper>
          <div className={styles.projectIntro}>
            <div>
              <p className={styles.eyebrow}>О проекте</p>
              <h2>{project.title}</h2>
            </div>
            <div className={styles.projectText}>
              <p>{project.description}</p>
              {project.details.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          {project.gallery.length > 0 ? (
            <div className={styles.projectGallery} aria-label={`Галерея проекта ${project.title}`}>
              {project.gallery.map((image, index) => (
                <figure
                  className={`${styles.galleryItem} ${index % 6 === 0 ? styles.galleryItemWide : ''}`}
                  key={image}
                >
                  <img
                    src={assetUrl(image)}
                    alt={`${project.title}: фото ${index + 1}`}
                    loading={index < 3 ? 'eager' : 'lazy'}
                  />
                </figure>
              ))}
            </div>
          ) : null}
        </PageWrapper>
      </section>
    </main>
  )
}
