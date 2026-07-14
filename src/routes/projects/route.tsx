import { useMemo, useState } from 'react'
import { Link, useLoaderData } from 'react-router'

import { projectRepository } from '@/entities/project/api'
import { innerHeroImages } from '@/shared/config/hero-media'
import { assetUrl } from '@/shared/lib/asset-url'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
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
  const [showAll, setShowAll] = useState(false)

  const visibleProjects = useMemo(() => (showAll ? projects : projects.slice(0, 6)), [projects, showAll])
  const hasMoreProjects = projects.length > visibleProjects.length

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
              <span className={styles.heroCardEyebrow}>Портфолио Анфас</span>
              <strong className={styles.heroCardTitle}>
                Каждый проект можно разобрать не только по картинке, но и по логике решений.
              </strong>
              <p className={styles.heroCardText}>
                Мы показываем фактуру интерьера, планировочную дисциплину и качество итоговой
                реализации, а не просто красивые кадры.
              </p>
            </article>
          </aside>
        </PageWrapper>
      </section>

      <section className={styles.lightSection}>
        <PageWrapper>
          <div className={styles.projectsIntro}>
            <div className={styles.projectsIntroCopy}>
              <p className={styles.eyebrow}>Живое портфолио</p>
              <h2 className={styles.title}>
                Проекты, которые можно
                <br />
                разобрать <em>по решениям</em>.
              </h2>
              <p className={styles.lead}>
                Здесь собраны реальные объекты Анфас: от компактных квартир до более масштабных
                интерьеров. Мы показываем не только картинку, но и логику пространства,
                материалы, сроки и результат.
              </p>
            </div>

            <aside className={styles.projectsIntroAside}>
              <span>Реальные объекты</span>
              <p>
                В каждом проекте есть понятная структура: метраж, срок, бюджет и главное
                настроение интерьера. Это помогает быстро сравнить кейсы и выбрать близкий
                по духу формат.
              </p>
            </aside>
          </div>

          <div className={styles.projectsGrid}>
            {visibleProjects.map((project) => (
              <Link className={styles.projectCard} key={project.slug} to={`/projects/${project.slug}`}>
                <div className={styles.projectImageWrap}>
                  <img src={assetUrl(project.image)} alt={project.title} />
                </div>

                <div className={styles.projectBody}>
                  <div className={styles.projectBodyTop}>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                    <p className={styles.projectDescription}>{project.description}</p>
                  </div>

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
                      <dt>Бюджет</dt>
                      <dd>{project.price}</dd>
                    </div>
                  </dl>

                  <div className={styles.projectFooter}>
                    <span>Открыть проект</span>
                    <ArrowIcon size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {hasMoreProjects ? (
            <div className={styles.moreRow}>
              <button className={styles.moreButton} type="button" onClick={() => setShowAll(true)}>
                Показать ещё
                <ArrowIcon size={16} />
              </button>
            </div>
          ) : null}

          <SeoContentBlock {...seoContentPages.projects} />
        </PageWrapper>
      </section>
    </main>
  )
}
