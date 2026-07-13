import { Link, useLoaderData } from 'react-router'

import { projectRepository } from '@/entities/project/api'
import { innerHeroImages } from '@/shared/config/hero-media'
import { assetUrl } from '@/shared/lib/asset-url'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SeoContentBlock, seoContentPages } from '@/widgets/seo-content'

import styles from '../_shared/InnerPage.module.scss'

export async function loader() {
  return {
    projects: await projectRepository.getAll(),
  }
}

export const meta = () => [
  { title: 'Проекты ремонта квартир в Санкт-Петербурге | Анфас' },
  {
    name: 'description',
    content:
      'Реализованные проекты дизайна и ремонта квартир в Санкт-Петербурге. Портфолио с примерами работ, площадью и типом объекта.',
  },
  {
    name: 'keywords',
    content:
      'проекты ремонта квартир, портфолио ремонта, дизайн интерьера спб, реализованные проекты, примеры ремонта квартир',
  },
  { property: 'og:title', content: 'Проекты ремонта квартир в Санкт-Петербурге | Анфас' },
  {
    property: 'og:description',
    content:
      'Реализованные проекты дизайна и ремонта квартир в Санкт-Петербурге. Портфолио с примерами работ, площадью и типом объекта.',
  },
]

const projectStats = [
  { label: 'Реальные объекты', value: 'квартиры и частные интерьеры без постановочных рендеров' },
  { label: 'Площадь и тип', value: 'сразу видно масштаб проекта и формат пространства' },
  { label: 'Открытый результат', value: 'показываем не обещание, а уже готовую реализацию' },
] as const

export default function ProjectsRoute() {
  const { projects } = useLoaderData<typeof loader>()
  const hero = innerHeroImages.projects

  return (
    <main className={styles.heroPage}>
      <section className={styles.heroSection}>
        <img className={styles.heroMedia} src={hero.image} alt={hero.alt} />
        <PageWrapper className={styles.heroWrap}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>Реализованные проекты</p>
            <h1 className={styles.heroTitle}>
              Пространства,
              <br />
              которые уже <em>живут</em>
            </h1>
            <p className={styles.heroLead}>
              Здесь собраны реальные квартиры и коммерческие пространства. Можно посмотреть эстетику,
              масштаб, ритм материалов и то, как мы доводим интерьер до готового состояния.
            </p>

            <div className={styles.heroStats}>
              {projectStats.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <aside className={styles.heroAside}>
            <article className={styles.heroCard}>
              <span>Портфолио Anfas</span>
              <strong>Каждый проект можно разобрать не только по картинке, но и по логике решений.</strong>
              <p>
                Мы показываем фактуру интерьера, планировочную дисциплину и качество итоговой
                реализации, а не просто красивые кадры.
              </p>
            </article>
          </aside>
        </PageWrapper>
      </section>

      <section className={styles.lightSection}>
        <PageWrapper>
          <SeoContentBlock embedded {...seoContentPages.projects} />

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
        </PageWrapper>
      </section>
    </main>
  )
}
