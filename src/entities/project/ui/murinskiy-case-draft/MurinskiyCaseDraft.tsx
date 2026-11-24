import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent,
} from 'react'
import { Link, useLocation } from 'react-router'

import {
  murinskiyStages,
  resultPhotos,
  planPhotos,
  murinskiyBudget,
  murinskiyBudgetLabel,
  murinskiyHandover,
  murinskiySolutions,
  type CasePhoto,
} from '@/entities/project/model/murinskiy-case.data'
import type { Project } from '@/entities/project/model/project.types'
import {
  isProjectContentPreview,
  canPreviewProjectContent,
} from '@/shared/config/project-content-preview'
import { murinskiyCaseStructuredData } from '@/entities/project/model/murinskiy-case.seo'
import { assetUrl } from '@/shared/lib/asset-url'
import { OpenLeadForm } from '@/shared/ui/open-lead-form'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './MurinskiyCaseDraft.module.scss'

const roubles = (amount: number) => `${new Intl.NumberFormat('ru-RU').format(amount)} ₽`
const scope = [
  'Полный демонтаж',
  'Дизайн-проект',
  'Комплектация',
  'Ремонт',
  'Организация монтажа мебели',
  'Подготовка квартиры к проживанию',
]

function Pending({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className={styles.pending}>
      <span>Уточнить для кейса</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </aside>
  )
}

export function MurinskiyCaseDraft({ project }: { project: Project }) {
  const { search } = useLocation()
  const showNotes = isProjectContentPreview(search)
  const noteSearch = new URLSearchParams(search)
  if (showNotes) noteSearch.delete('content-preview')
  else noteSearch.set('content-preview', '1')
  const gallery = useMemo(
    () => [
      ...planPhotos.slice(0, showNotes ? 3 : 2),
      ...murinskiyStages.flatMap((stage) => stage.photos),
      ...resultPhotos,
    ],
    [showNotes],
  )
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
  }, [gallery.length, setActiveIndex])
  const nextPhoto = useCallback(() => {
    setActiveIndex((index) => (index === null ? null : (index + 1) % gallery.length))
  }, [gallery.length, setActiveIndex])

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

  const caption = (item: CasePhoto) =>
    showNotes ? item.caption : (item.publicCaption ?? item.caption)

  const photo = (item: CasePhoto) => (
    <figure className={styles.figure} key={item.src}>
      <button
        type="button"
        className={styles.photoButton}
        onClick={(event) => {
          trigger.current = event.currentTarget
          const index = gallery.findIndex((photo) => photo.src === item.src)
          if (index >= 0) setActiveIndex(index)
        }}
        aria-label={`Увеличить: ${caption(item)}`}
      >
        <img
          src={assetUrl(item.thumbnailSrc ?? item.src)}
          alt={caption(item)}
          loading="lazy"
          width={1448}
          height={1086}
        />
        <span className={styles.enlarge} aria-hidden="true">
          ↗
        </span>
      </button>
      <figcaption>{caption(item)}</figcaption>
    </figure>
  )

  return (
    <main className={styles.case} data-project-case-draft="2-murinskiy-37">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(murinskiyCaseStructuredData) }}
      />
      <header className={styles.hero}>
        <PageWrapper>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Санкт-Петербург · 2-й Муринский, 37</p>
              <h1>
                Восстановление квартиры
                <br />
                <em>после пожара</em>
              </h1>
              <p className={styles.lead}>
                Восстановление 59 м² и новая планировка: из двухкомнатной квартиры — пространство с
                тремя комнатами, гардеробом и постирочной.
              </p>
              <dl className={styles.facts}>
                <div>
                  <dt>Площадь</dt>
                  <dd>59 м²</dd>
                </div>
                <div>
                  <dt>До готовности к проживанию</dt>
                  <dd>8 месяцев</dd>
                </div>
                <div>
                  <dt>Бюджет проекта</dt>
                  <dd>{murinskiyBudgetLabel}</dd>
                </div>
              </dl>
              <div className={styles.heroActions}>
                <a className={styles.heroContact} href="#case-contact">
                  Обсудить свою квартиру
                </a>
                <a className={styles.heroLink} href="#case-work">
                  Посмотреть этапы работ
                </a>
              </div>
            </div>
            <div className={styles.heroImage}>
              <img
                src={assetUrl(project.image)}
                alt="Готовая кухня-гостиная квартиры на 2-м Муринском"
                fetchPriority="high"
              />
              <span>Готовый интерьер · фото из портфолио проекта</span>
            </div>
          </div>
        </PageWrapper>
      </header>

      <PageWrapper>
        {canPreviewProjectContent() ? (
          <aside className={styles.notice}>
            <div className={styles.previewBar}>
              <strong>
                {showNotes ? 'Проверка содержания страницы' : 'Предпросмотр страницы на dev'}
              </strong>
              <Link
                to={{ search: noteSearch.toString() ? `?${noteSearch}` : '' }}
                preventScrollReset
              >
                {showNotes ? 'Посмотреть как клиент' : 'Показать редакторские пометки'}
              </Link>
            </div>
            {showNotes ? (
              <p>
                Пунктиром отмечены недостающие сведения. Фотографии обработаны без дорисовки; для
                вертикальных кадров сохранена вся высота.
              </p>
            ) : null}
          </aside>
        ) : null}
        <nav className={styles.contents} aria-label="Разделы кейса">
          <a href="#case-task">Задача</a>
          <a href="#case-plan">Планировка</a>
          <a href="#case-work">Этапы работ</a>
          <a href="#case-solutions">Инженерия и отделка</a>
          <a href="#case-result">Результат</a>
          <a href="#case-budget">Сроки и бюджет</a>
        </nav>

        <section className={styles.split} id="case-task">
          <div>
            <p className={styles.eyebrow}>01 / Отправная точка</p>
            <h2>
              Восстановить квартиру.
              <br />
              Продумать её заново.
            </h2>
          </div>
          <div className={styles.copy}>
            <p>
              Заказчик приобрёл сгоревшую квартиру на выгодных условиях. Помимо восстановления
              жилья, ему была важна продуманная планировка: вместо двух комнат — три, с отдельным
              гардеробом и постирочной.
            </p>
            <p>
              Анфас взял на себя полный демонтаж, дизайн-проект, комплектацию, ремонт и организацию
              монтажа мебели.
            </p>
            <ul className={styles.scope}>
              {scope.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="case-change-title">
          <p className={styles.eyebrow}>Преображение квартиры</p>
          <h2 id="case-change-title">От раскрытых конструкций к готовому интерьеру</h2>
          <div className={styles.photoGrid}>
            {photo(murinskiyStages[0].photos[0])}
            {photo(resultPhotos[0])}
          </div>
        </section>

        <section className={styles.section} id="case-plan">
          <p className={styles.eyebrow}>02 / Пространство и сценарии жизни</p>
          <h2>Дизайн-проект и новая планировка</h2>
          <p className={styles.intro}>
            Задача новой планировки — разместить три комнаты, хранение и постирочную в квартире
            площадью 59 м². Ниже — отдельные фрагменты чертежей из переданных материалов.
          </p>
          <div className={styles.planGrid}>{planPhotos.slice(0, 2).map(photo)}</div>
          {showNotes ? (
            <details className={styles.more}>
              <summary>Сравнить с отдельным вариантом на согласование</summary>
              <div className={styles.planGrid}>{planPhotos.slice(2).map(photo)}</div>
            </details>
          ) : null}
          {showNotes ? (
            <p className={styles.intro}>
              Владелец подтвердил реализацию листа 3.5 полного дизайн-проекта. Обмерный план
              показывает раскрытое пространство; его не подписываем как исходную двухкомнатную
              планировку до первого демонтажа.
            </p>
          ) : null}
        </section>

        <section className={styles.section} id="case-work">
          <p className={styles.eyebrow}>03 / Работа, которую обычно не видно</p>
          <h2>От демонтажа до новой электрики</h2>
          <p className={styles.intro}>
            Раскрыли конструкции после пожара, возвели перегородки по новой планировке, подготовили
            стены и пол, смонтировали новую электрику. Показываем работы по этапам.
          </p>
          {murinskiyStages.map((stage, index) => (
            <article className={styles.stage} key={stage.id} data-case-stage={stage.id}>
              <div className={styles.stageHeading}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{stage.title}</h3>
                  <p>{stage.description}</p>
                </div>
                <small>{stage.photos.length} фото</small>
              </div>
              <div className={styles.photoGrid}>{stage.photos.slice(0, 4).map(photo)}</div>
              {stage.photos.length > 4 ? (
                <details className={styles.more}>
                  <summary>Ещё {stage.photos.length - 4} фото этого этапа</summary>
                  <div className={styles.photoGrid}>{stage.photos.slice(4).map(photo)}</div>
                </details>
              ) : null}
            </article>
          ))}
          {showNotes ? (
            <div className={styles.pendingGrid}>
              <Pending title="Черновые работы — детали решения">
                Уточнить состав и толщину стяжки, материал штукатурки и толщину перегородок. Пока
                эти параметры не указаны как факты.
              </Pending>
              <Pending title="Дополнительные подтверждения контроля">
                Если добавляем блок о проверках и скрытых работах, нужны реальные результаты
                испытаний электрики и материалы по гидроизоляции. Описание выполненных решений по
                инженерии и отделке уже подтверждено владельцем.
              </Pending>
            </div>
          ) : null}
        </section>

        <section
          className={styles.section}
          id="case-solutions"
          aria-labelledby="case-solutions-title"
        >
          <p className={styles.eyebrow}>Решения для повседневной жизни</p>
          <h2 id="case-solutions-title">Инженерия и чистовая отделка</h2>
          <div className={styles.solutions}>
            {murinskiySolutions.map((solution) => (
              <article key={solution.id} data-case-solution={solution.id}>
                <h3>{solution.title}</h3>
                <p>{solution.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} id="case-result">
          <p className={styles.eyebrow}>04 / Готовое пространство</p>
          <h2>Квартира после ремонта</h2>
          <p className={styles.intro}>
            В готовой квартире — кухня-гостиная, две отдельные комнаты, ванная и отдельный санузел.
            В гардеробной разместили системы хранения, стиральную и сушильную машины.
          </p>
          <div className={styles.photoGrid}>{resultPhotos.map(photo)}</div>
          <div className={styles.handover}>
            <h3>Подготовили квартиру к проживанию</h3>
            <p>
              Через 8 месяцев от начала работ заказчик получил полностью готовую для жилья квартиру.
              Помимо ремонта и организации монтажа мебели, Анфас выполнил:
            </p>
            <ul>
              {murinskiyHandover.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.section} id="case-budget">
          <p className={styles.eyebrow}>05 / Сроки и стоимость</p>
          <h2>Из чего сложился проект</h2>
          <div className={styles.pendingGrid}>
            <div className={styles.factCard}>
              <span>Срок работ</span>
              <h3>8 месяцев</h3>
              <p>Начали в апреле 2023. Срок указан до готовности квартиры к проживанию.</p>
            </div>
            <div className={styles.factCard}>
              <span>Бюджет проекта</span>
              <h3>{murinskiyBudgetLabel}</h3>
              <p>
                Работы, дизайн-проект, материалы, бытовая техника и мебель. Две статьи ниже указаны
                приблизительно.
              </p>
            </div>
          </div>
          <div className={styles.budget}>
            <table>
              <caption>Расходы на реализованный проект</caption>
              <thead>
                <tr>
                  <th scope="col">Раздел</th>
                  <th scope="col">Сумма</th>
                  <th scope="col">Точность суммы</th>
                </tr>
              </thead>
              <tbody>
                {murinskiyBudget.map((row) => (
                  <tr key={row.title}>
                    <th scope="row">{row.title}</th>
                    <td>
                      {row.estimated ? '≈ ' : ''}
                      {roubles(row.amountRub)}
                      <span className={styles.mobileBudgetStatus}>
                        {row.estimated ? 'Приблизительно' : 'Зафиксировано'}
                      </span>
                    </td>
                    <td>{row.estimated ? 'Приблизительная оценка' : 'Зафиксированная сумма'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.budgetNote}>
            Точные расходы на чистовые материалы, технику и мебель не зафиксированы — эти две статьи
            восстановлены приблизительно. Поэтому общий бюджет округлён. Это бюджет конкретного
            реализованного проекта; стоимость нового ремонта рассчитываем отдельно.
          </p>
        </section>

        {showNotes ? (
          <section className={styles.section}>
            <p className={styles.eyebrow}>06 / Подтверждение результата</p>
            <h2>Документы и отзыв</h2>
            <div className={styles.pendingGrid}>
              <Pending title="Разрешённые документы">
                Место для обезличенных выдержек сметы, актов и проверок — если они есть по объекту.
                Полный дизайн-проект на сайт не загружается.
              </Pending>
              <Pending title="Отзыв заказчика">
                Добавить подтверждённый оригинал или ссылку на отзыв и согласованное имя.
                Происхождение прежнего текста отзыва пока не подтверждено.
              </Pending>
            </div>
          </section>
        ) : null}
        <div className={styles.form} id="case-contact">
          <OpenLeadForm
            defaultService="individual"
            title={
              <>
                Обсудим <em>вашу квартиру?</em>
              </>
            }
            lead="Расскажите о задаче — обсудим планировку, ремонт и комплектацию."
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
              alt={caption(active)}
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
            <p>{caption(active)}</p>
          </div>
        </div>
      ) : null}
    </main>
  )
}
