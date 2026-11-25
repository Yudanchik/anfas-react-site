import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import type { Project } from '@/entities/project/model/project.types'
import {
  verkhnekamenskayaMedia as gallery,
  verkhnekamenskayaPhotos,
  verkhnekamenskayaStages,
  verkhnekamenskayaBudget,
  verkhnekamenskayaBudgetTotal,
  verkhnekamenskayaBudgetLabel,
  type VerkhnekamenskayaPhoto,
} from '@/entities/project/model/verkhnekamenskaya-case.data'
import { getVerkhnekamenskayaStructuredData } from '@/entities/project/model/verkhnekamenskaya-case.seo'
import { assetUrl } from '@/shared/lib/asset-url'
import { OpenLeadForm } from '@/shared/ui/open-lead-form'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import styles from '../murinskiy-case-draft/MurinskiyCaseDraft.module.scss'
import extra from '../grafika-case-draft/GrafikaCaseDraft.module.scss'
import local from './VerkhnekamenskayaCase.module.scss'
const roubles = (amount: number) => `${new Intl.NumberFormat('ru-RU').format(amount)} ₽`
export function VerkhnekamenskayaCase({ project }: { project: Project }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const active = activeIndex === null ? null : (gallery[activeIndex] ?? null)
  const lightboxOpen = active !== null
  const trigger = useRef<HTMLButtonElement | null>(null)
  const close = useRef<HTMLButtonElement | null>(null)
  const panel = useRef<HTMLDivElement | null>(null)
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const previousPhoto = useCallback(() => {
    setActiveIndex((index) =>
      index === null ? null : (index - 1 + gallery.length) % gallery.length,
    )
  }, [setActiveIndex])
  const nextPhoto = useCallback(() => {
    setActiveIndex((index) => (index === null ? null : (index + 1) % gallery.length))
  }, [setActiveIndex])

  useEffect(() => {
    if (!lightboxOpen) return
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    close.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null)
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        previousPhoto()
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        nextPhoto()
      }
      if (event.key === 'Tab') {
        const buttons = panel.current?.querySelectorAll<HTMLButtonElement>('button')
        if (!buttons?.length) return
        const first = buttons[0]
        const last = buttons[buttons.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = oldOverflow
      window.removeEventListener('keydown', onKey)
      trigger.current?.focus()
    }
  }, [lightboxOpen, previousPhoto, nextPhoto])

  const swipeStart = (event: PointerEvent<HTMLImageElement>) => {
    if (event.pointerType !== 'mouse') swipe.current = { x: event.clientX, y: event.clientY }
  }
  const swipeEnd = (event: PointerEvent<HTMLImageElement>) => {
    const start = swipe.current
    swipe.current = null
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.4) return
    if (dx < 0) nextPhoto()
    else previousPhoto()
  }

  const photo = (item: VerkhnekamenskayaPhoto) => (
    <figure
      className={`${styles.figure} ${extra.mediaFigure}`}
      key={item.id}
      style={{ width: `min(100%, calc(var(--photo-height) * ${item.previewRatio}))` }}
    >
      <button
        type="button"
        className={`${styles.photoButton} ${extra.documentPhoto}`}
        style={{ aspectRatio: item.previewRatio }}
        aria-label={`Увеличить: ${item.caption}`}
        onClick={(event) => {
          trigger.current = event.currentTarget
          setActiveIndex(gallery.indexOf(item))
        }}
      >
        <img
          src={assetUrl(item.thumbnailSrc)}
          alt={item.caption}
          loading="lazy"
          width={item.width}
          height={item.height}
        />
        <span className={styles.enlarge} aria-hidden="true">
          ↗
        </span>
      </button>
      <figcaption>{item.caption}</figcaption>
    </figure>
  )
  return (
    <main className={`${styles.case} ${extra.case}`} data-project-case="verkhnekamenskaya">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getVerkhnekamenskayaStructuredData(project)),
        }}
      />
      <header className={styles.hero}>
        <img
          className={styles.heroImage}
          src={assetUrl(project.image)}
          alt="Зал кофейни на Верхнекаменской со стойкой, освещением и эпоксидным полом"
          fetchPriority="high"
        />
        <PageWrapper>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Санкт-Петербург · Верхнекаменская, 11</p>
              <h1>
                Ремонт кофейни <em>в Приморском районе</em>
              </h1>
              <p className={styles.lead}>
                Коммерческое помещение с залом у панорамных окон: каркасные стены с закладными,
                новая электрика, освещение и эпоксидный наливной пол.
              </p>
              <dl className={styles.facts}>
                <div>
                  <dt>Площадь</dt>
                  <dd>{project.area}</dd>
                </div>
                <div>
                  <dt>Срок</dt>
                  <dd>{project.term}</dd>
                </div>
                <div>
                  <dt>Ремонт и материалы</dt>
                  <dd>{verkhnekamenskayaBudgetLabel}</dd>
                </div>
              </dl>
              <div className={styles.heroActions}>
                <a className={styles.heroContact} href="#verkh-contact">
                  Обсудить своё помещение
                </a>
                <a className={styles.heroLink} href="#verkh-result">
                  Смотреть результат
                </a>
              </div>
            </div>
          </div>
        </PageWrapper>
      </header>
      <PageWrapper>
        <nav className={styles.contents} aria-label="Разделы проекта">
          <a href="#verkh-task">Задача</a>
          <a href="#verkh-work">Этапы работ</a>
          <a href="#verkh-result">Результат</a>
          <a href="#verkh-budget">Бюджет</a>
        </nav>
        <section className={styles.split} id="verkh-task">
          <div>
            <p className={styles.eyebrow}>Коммерческий ремонт</p>
            <h2>Помещение для кофейни и магазина</h2>
          </div>
          <div className={styles.copy}>
            <p>
              Подготовили коммерческое помещение на Верхнекаменской под кофейню и магазин. В зале
              разместили посадочные места у окон и стойку обслуживания.
            </p>
            <p>
              Выполнили каркасные стены с закладными и обшивкой ГКЛ, малярные работы, новую
              электрику и освещение. Для пола использовали наливное эпоксидное покрытие.
            </p>
            <p>
              Мебель и технику заказчик приобретал за свой счёт — их стоимость не включена в бюджет
              ремонта ниже.
            </p>
          </div>
        </section>
        <section className={styles.section} id="verkh-work">
          <p className={styles.eyebrow}>Ход работ</p>
          <h2>Как готовили помещение</h2>
          <p className={styles.intro}>
            Фотографии четырёх этапов с объекта. Нажмите на кадр, чтобы рассмотреть конструкцию или
            отделку целиком.
          </p>
          {verkhnekamenskayaStages.map((stage) => (
            <article className={styles.stage} key={stage.title}>
              <div className={local.stageHeading}>
                <div>
                  <h3>{stage.title}</h3>
                  <p>{stage.description}</p>
                </div>
              </div>
              <div
                className={`${styles.photoGrid} ${extra.workPhotos} ${stage.photos[0].previewRatio < 0.7 ? extra.portraitPhotos : ''}`}
              >
                {stage.photos.map(photo)}
              </div>
            </article>
          ))}
        </section>
        <section className={styles.section} id="verkh-result">
          <p className={styles.eyebrow}>Готовое пространство</p>
          <h2>Кофейня после ремонта</h2>
          <p className={styles.intro}>
            Зал, стойка обслуживания, свет, санузел и эпоксидный пол. Выбрали восемь ракурсов
            готового интерьера.
          </p>
          <div className={styles.photoGrid}>{verkhnekamenskayaPhotos.map(photo)}</div>
        </section>
        <section className={styles.section} id="verkh-budget">
          <p className={styles.eyebrow}>Стоимость реализации</p>
          <h2>Бюджет ремонта</h2>
          <div className={styles.budget}>
            <table>
              <caption>Фактические расходы на работы и материалы по данным команды «Анфас»</caption>
              <thead>
                <tr>
                  <th scope="col">Статья</th>
                  <th scope="col">Стоимость</th>
                </tr>
              </thead>
              <tbody>
                {verkhnekamenskayaBudget.map((row) => (
                  <tr key={row.title}>
                    <th scope="row">{row.title}</th>
                    <td>{roubles(row.amountRub)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Итого</th>
                  <td>{roubles(verkhnekamenskayaBudgetTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className={styles.budgetNote}>
            Мебель и техника — за счёт заказчика. Их стоимость не включена в указанный бюджет.
          </p>
        </section>
        <div className={styles.form} id="verkh-contact">
          <OpenLeadForm
            defaultService="individual"
            title={
              <>
                Обсудим ремонт <em>вашего помещения</em>
              </>
            }
            lead="Расскажите о помещении и задаче: обсудим отделку, инженерные работы, освещение и состав бюджета."
            submitLabel="Обсудить проект"
          />
        </div>
      </PageWrapper>
      {active ? (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Увеличенная фотография"
        >
          <button
            type="button"
            className={styles.backdrop}
            aria-label="Закрыть просмотр фотографии"
            onClick={() => setActiveIndex(null)}
            tabIndex={-1}
          />
          <div className={styles.lightbox} ref={panel}>
            <button
              ref={close}
              type="button"
              className={styles.close}
              onClick={() => setActiveIndex(null)}
              aria-label="Закрыть"
            >
              ×
            </button>
            <img
              src={assetUrl(active.src)}
              alt={active.caption}
              onPointerDown={swipeStart}
              onPointerUp={swipeEnd}
              onPointerCancel={() => {
                swipe.current = null
              }}
              draggable={false}
            />
            <div className={styles.galleryControls}>
              <button type="button" onClick={previousPhoto} aria-label="Предыдущее фото">
                Назад
              </button>
              <span aria-live="polite">
                {(activeIndex ?? 0) + 1} / {gallery.length}
              </span>
              <button type="button" onClick={nextPhoto} aria-label="Следующее фото">
                Дальше
              </button>
            </div>
            <p>{active.caption}</p>
          </div>
        </div>
      ) : null}
    </main>
  )
}
