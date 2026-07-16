import { useEffect, useMemo, useState } from 'react'
import { useLoaderData, type LoaderFunctionArgs } from 'react-router'

import { projectRepository } from '@/entities/project/api'
import { createSeoMeta } from '@/shared/config/seo'
import { assetUrl } from '@/shared/lib/asset-url'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { OpenLeadForm } from '@/shared/ui/open-lead-form'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './ProjectRoute.module.scss'

export async function loader({ params }: LoaderFunctionArgs) {
  const project = await projectRepository.getBySlug(params.slug ?? '')

  if (!project) {
    throw new Response('Проект не найден', { status: 404 })
  }

  return { project }
}

export function meta({ data }: { data?: Awaited<ReturnType<typeof loader>> }) {
  if (!data) {
    return createSeoMeta({
      title: 'Проект не найден — Анфас',
      path: '/projects',
      robots: 'noindex, nofollow',
    })
  }

  return createSeoMeta({
    title: `${data.project.title} — Анфас`,
    description: data.project.description,
    keywords: `${data.project.title}, ремонт квартир спб, дизайн интерьера, портфолио ремонта`,
    path: `/projects/${data.project.slug}`,
    image: `/${data.project.image}`,
    type: 'article',
  })
}

export default function ProjectRoute() {
  const { project } = useLoaderData<typeof loader>()
  const [galleryCount, setGalleryCount] = useState(() => {
    if (typeof window === 'undefined') {
      return 6
    }

    return window.matchMedia('(width <= 700px)').matches ? 3 : 6
  })
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(width <= 700px)')

    const updateGalleryCount = () => {
      setGalleryCount(mediaQuery.matches ? 3 : 6)
    }

    updateGalleryCount()
    mediaQuery.addEventListener('change', updateGalleryCount)

    return () => mediaQuery.removeEventListener('change', updateGalleryCount)
  }, [])

  useEffect(() => {
    if (activeImageIndex === null) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveImageIndex(null)
      }

      if (event.key === 'ArrowLeft') {
        setActiveImageIndex((current) =>
          current === null ? current : (current - 1 + project.gallery.length) % project.gallery.length,
        )
      }

      if (event.key === 'ArrowRight') {
        setActiveImageIndex((current) =>
          current === null ? current : (current + 1) % project.gallery.length,
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeImageIndex, project.gallery.length])

  const visibleGallery = useMemo(() => project.gallery.slice(0, galleryCount), [galleryCount, project.gallery])
  const activeImage = activeImageIndex === null ? null : project.gallery[activeImageIndex]
  const canLoadMore = project.gallery.length > galleryCount
  const loadMoreGallery = () => {
    const step = window.matchMedia('(width <= 700px)').matches ? 3 : 6
    setGalleryCount((current) => Math.min(current + step, project.gallery.length))
  }

  return (
    <main className={styles.projectDetail}>
      <section className={styles.projectDetailHero}>
        <img className={styles.projectDetailImage} src={assetUrl(project.image)} alt={project.type} />
        <PageWrapper className={styles.projectDetailWrapper}>
          <div className={styles.projectDetailHeroContent}>
            <p className={styles.projectDetailEyebrow}>{project.location}</p>
            <h1 className={styles.projectDetailTitle}>{project.type}</h1>
            <p className={styles.projectDetailLead}>{project.description}</p>
            <dl className={styles.projectDetailHeroMeta}>
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

      <section className={styles.projectDetailPage}>
        <PageWrapper>
          <div className={styles.projectDetailIntro}>
            <div className={styles.projectDetailIntroCopy}>
              <p className={styles.projectDetailEyebrowDark}>О проекте</p>
              <h2>{project.title}</h2>
              <p className={styles.projectDetailIntroLead}>
                Превращаем пространство в готовый интерьер с понятной логикой решений, прозрачными этапами и
                спокойным контролем бюджета.
              </p>
              <div className={styles.projectDetailTags}>
                <span>Планировка</span>
                <span>Комплектация</span>
                <span>Реализация</span>
              </div>
            </div>

            <aside className={styles.projectDetailIntroAside}>
              <p className={styles.projectDetailIntroEyebrow}>Ключевые параметры</p>
              <strong className={styles.projectDetailIntroAsideTitle}>
                Ремонт квартиры под ключ без лишнего шума и хаоса.
              </strong>
              <p className={styles.projectDetailIntroAsideText}>
                Мы соединяем планировку, отделку и организацию работ так, чтобы проект оставался управляемым,
                а результат выглядел цельно и современно.
              </p>
              <dl className={styles.projectDetailIntroMeta}>
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
            </aside>
          </div>

          {visibleGallery.length > 0 ? (
            <div className={styles.projectDetailGallery} aria-label={`Галерея проекта ${project.title}`}>
              {visibleGallery.map((image, index) => (
                <button
                  className={styles.projectDetailGalleryButton}
                  key={image}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`Открыть фото ${index + 1} проекта ${project.title}`}
                >
                  <figure className={styles.projectDetailGalleryItem}>
                    <img
                      src={assetUrl(image)}
                      alt={`${project.title}: фото ${index + 1}`}
                      loading={index < 3 ? 'eager' : 'lazy'}
                    />
                  </figure>
                </button>
              ))}
            </div>
          ) : null}

          {canLoadMore ? (
            <div className={styles.projectDetailMoreRow}>
              <button className={styles.projectDetailMoreButton} type="button" onClick={loadMoreGallery}>
                Показать ещё фото
                <ArrowIcon size={16} />
              </button>
            </div>
          ) : null}

          {activeImage ? (
            <div className={styles.projectDetailOverlay} role="dialog" aria-modal="true" aria-label="Просмотр фотографии">
              <button className={styles.projectDetailOverlayBackdrop} type="button" onClick={() => setActiveImageIndex(null)} aria-label="Закрыть просмотр" />
              <div className={styles.projectDetailOverlayPanel}>
                <button className={styles.projectDetailOverlayClose} type="button" onClick={() => setActiveImageIndex(null)} aria-label="Закрыть">
                  ×
                </button>
                <button
                  className={`${styles.projectDetailOverlayNav} ${styles.projectDetailOverlayNav_prev}`}
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((current) =>
                      current === null ? current : (current - 1 + project.gallery.length) % project.gallery.length,
                    )
                  }
                  aria-label="Предыдущее фото"
                >
                  <ArrowIcon size={18} />
                </button>
                <img src={assetUrl(activeImage)} alt={`${project.title}: увеличенное фото`} />
                <button
                  className={`${styles.projectDetailOverlayNav} ${styles.projectDetailOverlayNav_next}`}
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((current) =>
                      current === null ? current : (current + 1) % project.gallery.length,
                    )
                  }
                  aria-label="Следующее фото"
                >
                  <ArrowIcon size={18} />
                </button>
              </div>
            </div>
          ) : null}

          <section className={styles.projectDetailReview} aria-labelledby="project-review-title">
            <p className={styles.projectDetailReviewEyebrow}>Черновой отзыв</p>
            <h2 id="project-review-title">Отзыв клиента будет подтверждён перед публикацией.</h2>
            <p>
              Здесь подготовлено место для реального комментария по проекту: впечатления от процесса,
              сроков, коммуникации и результата. Текст не содержит вымышленного имени и требует
              подтверждения заказчика.
            </p>
          </section>

          <OpenLeadForm
            className={styles.projectDetailForm}
            defaultService="individual"
            title="Хотите похожий результат в своей квартире?"
            lead="Оставьте имя и телефон. Мы посмотрим задачу, зададим несколько уточняющих вопросов и подскажем, какой формат ремонта подходит лучше."
            submitLabel="Обсудить проект"
          />
        </PageWrapper>
      </section>
    </main>
  )
}
