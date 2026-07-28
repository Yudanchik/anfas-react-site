import { useMemo, useState } from 'react'
import { Link, useLoaderData } from 'react-router'

import { projectRepository } from '@/entities/project/api'
import { innerHeroImages } from '@/shared/config/hero-media'
import { createSeoMeta } from '@/shared/config/seo'
import { assetUrl } from '@/shared/lib/asset-url'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './ProjectsRoute.module.scss'

export async function loader() {
  return {
    projects: await projectRepository.getAll(),
  }
}

export const meta = () =>
  createSeoMeta({
    title: 'Проекты ремонта квартир в Санкт-Петербурге | Анфас',
    description:
      'Реализованные проекты дизайна и ремонта квартир в Санкт-Петербурге. Площадь, срок, бюджет и фотографии готовых интерьеров с реальных объектов.',
    keywords:
      'проекты ремонта квартир, портфолио ремонта спб, дизайн интерьера спб, реализованные проекты, примеры ремонта квартир, ремонт квартир фото',
    path: '/projects',
  })

const projectStats = [
  { label: 'Реальные объекты', value: 'квартиры и частные интерьеры, снятые после сдачи' },
  { label: 'Площадь и тип', value: 'сразу видно масштаб проекта и формат пространства' },
  { label: 'Готовый результат', value: 'показываем интерьер после сдачи объекта' },
] as const

export default function ProjectsRoute() {
  const { projects } = useLoaderData<typeof loader>()
  const hero = innerHeroImages.projects
  const [showAll, setShowAll] = useState(false)

  const visibleProjects = useMemo(
    () => (showAll ? projects : projects.slice(0, 6)),
    [projects, showAll],
  )
  const hasMoreProjects = projects.length > visibleProjects.length

  return (
    <main className={styles.projectsPage}>
      <section className={styles.projectsHero}>
        <img
          className={styles.projectsHeroMedia}
          src={hero.image}
          alt={hero.alt}
          width={hero.width}
          height={hero.height}
          loading="eager"
          decoding="sync"
        />
        <PageWrapper className={styles.projectsHeroWrap}>
          <div className={styles.projectsHeroCopy}>
            <p className={styles.projectsHeroEyebrow}>Реализованные проекты</p>
            <h1 className={styles.projectsHeroTitle}>
              Пространства,
              <br />
              которые уже <em>живут</em>
            </h1>
            <p className={styles.projectsHeroLead}>
              Здесь собраны реальные квартиры и коммерческие пространства в Санкт-Петербурге. Смотрите
              эстетику, масштаб, материалы и то, как мы доводим интерьер до сдачи.
            </p>

            <div className={styles.projectsHeroStats}>
              {projectStats.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <aside className={styles.projectsHeroAside}>
            <article className={styles.projectsHeroCard}>
              <span className={styles.projectsHeroCardEyebrow}>Портфолио Анфас</span>
              <strong className={styles.projectsHeroCardTitle}>
                Каждый проект можно разобрать не только по картинке, но и по логике решений.
              </strong>
              <p className={styles.projectsHeroCardText}>
                Показываем фактуру интерьера, планировочную дисциплину и качество итоговой
                реализации — не только красивые кадры.
              </p>
            </article>
          </aside>
        </PageWrapper>
      </section>

      <section className={styles.projectsSection}>
        <PageWrapper>
          <div className={styles.projectsIntro}>
            <div className={styles.projectsIntroCopy}>
              <p className={styles.projectsEyebrow}>Живое портфолио</p>
              <h2 className={styles.projectsTitle}>
                Проекты, которые можно
                <br />
                разобрать <em>по решениям</em>.
              </h2>
              <p className={styles.projectsLead}>
                От компактных студий до семейных квартир и коммерческих пространств. В каждом кейсе —
                логика планировки, материалы, сроки и итоговый бюджет.
              </p>
            </div>

            <aside className={styles.projectsIntroAside}>
              <span>Реальные объекты</span>
              <p>
                У каждого проекта указаны метраж, срок, бюджет и характер интерьера. Так проще
                сравнить кейсы и выбрать близкий по задаче формат.
              </p>
            </aside>
          </div>

          <div className={styles.projectsGrid}>
            {visibleProjects.map((project) => (
              <Link
                className={styles.projectsCard}
                key={project.slug}
                to={`/projects/${project.slug}`}
              >
                <div className={styles.projectsCardImage}>
                  <img src={assetUrl(project.image)} alt={project.title} />
                </div>

                <div className={styles.projectsCardBody}>
                  <div className={styles.projectsCardBodyTop}>
                    <h3 className={styles.projectsCardTitle}>{project.title}</h3>
                    <p className={styles.projectsCardDescription}>{project.description}</p>
                  </div>

                  <dl className={styles.projectsCardMeta}>
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

                  <div className={styles.projectsCardFooter}>
                    <span>Открыть проект</span>
                    <ArrowIcon size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {hasMoreProjects ? (
            <div className={styles.projectsMoreRow}>
              <button className={styles.projectsMoreButton} type="button" onClick={() => setShowAll(true)}>
                Показать ещё
                <ArrowIcon size={16} />
              </button>
            </div>
          ) : null}
        </PageWrapper>
      </section>
    </main>
  )
}
