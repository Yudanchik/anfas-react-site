import { useEffect, useMemo, useState } from 'react'
import { useLoaderData, type LoaderFunctionArgs } from 'react-router'

import { projectRepository } from '@/entities/project/api'
import { assetUrl } from '@/shared/lib/asset-url'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
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
  const [galleryCount, setGalleryCount] = useState(() => {
    if (typeof window === 'undefined') {
      return 6
    }

    return window.matchMedia('(width <= 700px)').matches ? 3 : 6
  })
  const [activeImage, setActiveImage] = useState<string | null>(null)

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
    if (!activeImage) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveImage(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeImage])

  const visibleGallery = useMemo(() => project.gallery.slice(0, galleryCount), [galleryCount, project.gallery])
  const canLoadMore = project.gallery.length > galleryCount
  const loadMoreGallery = () => {
    const step = window.matchMedia('(width <= 700px)').matches ? 3 : 6
    setGalleryCount((current) => Math.min(current + step, project.gallery.length))
  }

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
            <div className={styles.projectIntroCopy}>
              <p className={styles.eyebrow}>О проекте</p>
              <h2>{project.title}</h2>
              <p className={styles.projectIntroLead}>
                Превращаем пространство в готовый интерьер с понятной логикой решений, прозрачными этапами и
                спокойным контролем бюджета.
              </p>
              <div className={styles.projectIntroTags}>
                <span>Планировка</span>
                <span>Комплектация</span>
                <span>Реализация</span>
              </div>
            </div>

            <aside className={styles.projectIntroAside}>
              <p className={styles.projectIntroEyebrow}>Ключевые параметры</p>
              <strong className={styles.projectIntroAsideTitle}>
                Ремонт квартиры под ключ без лишнего шума и хаоса.
              </strong>
              <p className={styles.projectIntroAsideText}>
                Мы соединяем планировку, отделку и организацию работ так, чтобы проект оставался управляемым,
                а результат выглядел цельно и современно.
              </p>
              <dl className={styles.projectIntroMeta}>
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
            <div className={styles.projectGallery} aria-label={`Галерея проекта ${project.title}`}>
              {visibleGallery.map((image, index) => (
                <button
                  className={styles.galleryButton}
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  aria-label={`Открыть фото ${index + 1} проекта ${project.title}`}
                >
                  <figure className={styles.galleryItem}>
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
            <div className={styles.moreRow}>
              <button className={styles.moreButton} type="button" onClick={loadMoreGallery}>
                Показать ещё фото
                <ArrowIcon size={16} />
              </button>
            </div>
          ) : null}

          {activeImage ? (
            <div className={styles.galleryOverlay} role="dialog" aria-modal="true" aria-label="Просмотр фотографии">
              <button className={styles.galleryOverlayBackdrop} type="button" onClick={() => setActiveImage(null)} aria-label="Закрыть просмотр" />
              <div className={styles.galleryOverlayPanel}>
                <button className={styles.galleryOverlayClose} type="button" onClick={() => setActiveImage(null)} aria-label="Закрыть">
                  ×
                </button>
                <img src={assetUrl(activeImage)} alt={`${project.title}: увеличенное фото`} />
              </div>
            </div>
          ) : null}
        </PageWrapper>
      </section>
    </main>
  )
}
