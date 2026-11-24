import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { Link, useLocation } from 'react-router'

import {
  grafikaBudget,
  grafikaBudgetLabel,
  grafikaCover,
  grafikaPhotos,
  grafikaSolutions,
  grafikaStagePhotos,
  grafikaStages,
  grafikaPlanPhotos,
  type GrafikaPhoto,
} from '@/entities/project/model/grafika-case.data'
import { grafikaStructuredData } from '@/entities/project/model/grafika-case.seo'
import {
  isProjectContentPreview,
  canPreviewProjectContent,
} from '@/shared/config/project-content-preview'
import { assetUrl } from '@/shared/lib/asset-url'
import { OpenLeadForm } from '@/shared/ui/open-lead-form'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from '../murinskiy-case-draft/MurinskiyCaseDraft.module.scss'
import extra from './GrafikaCaseDraft.module.scss'

const gallery: readonly GrafikaPhoto[] = [
  ...grafikaPhotos,
  ...grafikaStagePhotos,
  ...grafikaPlanPhotos,
]
const roubles = (amount: number) => `${new Intl.NumberFormat('ru-RU').format(amount)} ₽`

export function GrafikaCaseDraft() {
  const { search } = useLocation()
  const showNotes = isProjectContentPreview(search)
  const noteSearch = new URLSearchParams(search)
  if (showNotes) noteSearch.delete('content-preview')
  else noteSearch.set('content-preview', '1')
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

  const photo = (item: GrafikaPhoto) => (
    <figure className={styles.figure} key={item.src}>
      <button
        type="button"
        className={styles.photoButton}
        onClick={(event) => {
          trigger.current = event.currentTarget
          setActiveIndex(gallery.indexOf(item))
        }}
        aria-label={`Увеличить: ${item.caption}`}
      >
        <img
          src={assetUrl(item.thumbnailSrc)}
          alt={item.caption}
          loading="lazy"
          width={item.width ?? 960}
          height={item.height ?? 720}
          style={{
            aspectRatio:
              item.previewAspectRatio ??
              (item.width && item.height ? `${item.width} / ${item.height}` : undefined),
            objectPosition: item.previewObjectPosition,
          }}
        />
        <span className={styles.enlarge} aria-hidden="true">
          ↗
        </span>
      </button>
      <figcaption>{item.caption}</figcaption>
      {item.id <= -20 ? (
        <a className={extra.planLink} href={assetUrl(item.src)} target="_blank" rel="noreferrer">
          Открыть план в полном размере
        </a>
      ) : null}
    </figure>
  )

  return (
    <main className={styles.case} data-project-case-draft="zhk-grafika">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(grafikaStructuredData) }}
      />
      <header className={styles.hero}>
        <PageWrapper>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Мурино · ЖК «Графика» · 2024</p>
              <h1>
                Полная реновация квартиры <em>под дорогую аренду</em>
              </h1>
              <p className={styles.lead}>
                Инвестиционная квартира 29,2 м²: отдельная спальня, кухня-гостиная и рабочее место
                на лоджии. Дизайн, ремонт и комплектация для сдачи в аренду.
              </p>
              <dl className={styles.facts}>
                <div>
                  <dt>Площадь</dt>
                  <dd>29,2 м²</dd>
                </div>
                <div>
                  <dt>Срок проекта</dt>
                  <dd>7 месяцев</dd>
                </div>
                <div>
                  <dt>Бюджет с дизайном, мебелью и техникой</dt>
                  <dd>{grafikaBudgetLabel}</dd>
                </div>
              </dl>
              <div className={styles.heroActions}>
                <a className={styles.heroContact} href="#grafika-contact">
                  Обсудить свою квартиру
                </a>
                <a className={styles.heroLink} href="#grafika-result">
                  Смотреть результат
                </a>
              </div>
            </div>
            <div className={styles.heroImage}>
              <img
                src={assetUrl(grafikaCover)}
                alt="Готовая кухня в ЖК «Графика»: деревянные фасады, техника и подсветка"
                fetchPriority="high"
                width={1152}
                height={1536}
              />
              <span>Фотография реализованного интерьера</span>
            </div>
          </div>
        </PageWrapper>
      </header>
      <PageWrapper>
        {canPreviewProjectContent() ? (
          <aside className={styles.notice}>
            <div className={styles.previewBar}>
              <strong>
                {showNotes ? 'Проверка содержания кейса' : 'Предпросмотр страницы на dev'}
              </strong>
              <Link
                to={{ search: noteSearch.toString() ? `?${noteSearch}` : '' }}
                preventScrollReset
              >
                {showNotes ? 'Посмотреть как клиент' : 'Показать редакторские пометки'}
              </Link>
            </div>
          </aside>
        ) : null}
        <nav className={styles.contents} aria-label="Содержание кейса">
          <a href="#grafika-task">Задача</a>
          <a href="#grafika-plans">Планировка</a>
          <a href="#grafika-work">Этапы работ</a>
          <a href="#grafika-solutions">Решения</a>
          <a href="#grafika-result">Фотографии</a>
          <a href="#grafika-budget">Срок и бюджет</a>
          <a href="#grafika-rent">Аренда</a>
        </nav>
        <section className={styles.split} id="grafika-task">
          <div>
            <p className={styles.eyebrow}>01 / Инвестиционная квартира</p>
            <h2>Больше сценариев жизни на 29,2 м²</h2>
          </div>
          <div className={styles.copy}>
            <p>
              Заказчик приобрёл квартиру на выгодных для себя условиях. Его план — сдавать её в
              аренду три года, получать доход в период владения, а затем продать. Для этой стратегии
              квартиру в ЖК «Графика» готовили под дорогую аренду.
            </p>
            <p>
              В проекте соединили современный интерьер и износостойкие материалы. На небольшой
              площади нужно было разместить не только кухню и спальное место, но и отдельную
              спальню, зону отдыха, хранение и место для работы.
            </p>
            <p>
              Квартира уже была с ремонтом. Мы выполнили полную реновацию: от защиты сохраняемых
              поверхностей и демонтажа прежней отделки до нового интерьера и комплектации.
            </p>
            <p>
              В готовом интерьере спальня отделена от кухни-гостиной, а рабочий стол вынесен на
              лоджию. Квартиру укомплектовали мебелью и техникой.
            </p>
            <p className={extra.credit}>
              Мурино, ул. Екатерининская, 16, корпус 5.
              <br />
              Ремонт по дизайн-проекту.
            </p>
            <ul className={styles.scope}>
              <li>Планировка</li>
              <li>Ремонт</li>
              <li>Умный свет</li>
              <li>Мебель и техника</li>
            </ul>
          </div>
        </section>
        <section className={styles.section} id="grafika-plans">
          <p className={styles.eyebrow}>Планировка / До и после</p>
          <h2>От обмеров к расстановке мебели</h2>
          <p className={styles.intro}>
            Обмерный план до демонтажа и планировочное решение из дизайн-проекта. На втором плане
            показаны дверь-пенал, мебель и рабочее место на лоджии.
          </p>
          <div className={`${styles.photoGrid} ${extra.plans}`}>{grafikaPlanPhotos.map(photo)}</div>
        </section>
        <section className={styles.section} id="grafika-work">
          <p className={styles.eyebrow}>02 / Ход реновации</p>
          <h2>От прежнего ремонта к новому интерьеру</h2>
          <p className={styles.intro}>
            Фотографии с объекта: подготовка, демонтаж, монтаж конструкций и новая электрика до
            чистовой отделки.
          </p>
          <p className={extra.mediaNote}>Фотографии этапов обработаны с использованием ИИ.</p>
          {grafikaStages.map((stage, index) => (
            <article className={styles.stage} key={stage.title}>
              <div className={styles.stageHeading}>
                <span aria-hidden="true">0{index + 1}</span>
                <div>
                  <h3>{stage.title}</h3>
                  <p>{stage.description}</p>
                </div>
              </div>
              <div className={`${styles.photoGrid} ${extra.workPhotos}`}>
                {stage.photos.map(photo)}
              </div>
            </article>
          ))}
        </section>
        <section className={styles.section} id="grafika-solutions">
          <p className={styles.eyebrow}>03 / Планировка и оснащение</p>
          <h2>Что сделали в квартире</h2>
          <p className={styles.intro}>
            Отдельные зоны для сна, отдыха и работы в компактной квартире. Фотографии показывают
            реализованные решения.
          </p>
          <div className={extra.solutions}>
            {grafikaSolutions.map((solution, index) => (
              <article className={extra.solution} key={solution.title}>
                {photo(gallery.find((item) => item.id === solution.photoId)!)}
                <div>
                  <p className={styles.eyebrow}>0{index + 1}</p>
                  <h3>{solution.title}</h3>
                  <p>{solution.text}</p>
                </div>
              </article>
            ))}
          </div>
          {showNotes ? (
            <div className={styles.pendingGrid}>
              <aside className={styles.pending}>
                <span>Добавить подтверждение</span>
                <h3>Проверки инженерных систем</h3>
                <p>
                  Фотографии утепления, каркаса двери и новой электрики уже добавлены. Дополнить
                  доступными актами проверок и снимками устройства тёплого пола, если они
                  сохранились.
                </p>
              </aside>
            </div>
          ) : null}
        </section>
        <section className={styles.section} id="grafika-result">
          <p className={styles.eyebrow}>04 / Готовый интерьер</p>
          <h2>Квартира после ремонта</h2>
          <p className={styles.intro}>
            Кухня-гостиная, спальня, рабочее место, прихожая и ванная. Нажмите на фотографию, чтобы
            открыть обработанный кадр крупнее; в просмотре доступны 39 фотографий результата и
            снимки этапов.
          </p>
          <div className={styles.photoGrid}>{grafikaPhotos.slice(0, 12).map(photo)}</div>
          <details className={styles.more}>
            <summary>Ещё 27 фотографий готовой квартиры</summary>
            <div className={styles.photoGrid}>{grafikaPhotos.slice(12).map(photo)}</div>
          </details>
        </section>
        <section className={styles.section} id="grafika-budget">
          <p className={styles.eyebrow}>05 / Сроки и стоимость</p>
          <h2>Бюджет подготовки к аренде</h2>
          <div className={styles.pendingGrid}>
            <div className={styles.factCard}>
              <span>Реализация</span>
              <h3>2024 год · 7 месяцев</h3>
              <p>Срок проекта по данным команды «Анфас».</p>
            </div>
            <div className={styles.factCard}>
              <span>Бюджет проекта</span>
              <h3>{grafikaBudgetLabel}</h3>
              <p>Включает ремонт, материалы, вывоз мусора, дизайн-проект, мебель и технику.</p>
            </div>
          </div>
          <div className={styles.budget}>
            <table>
              <caption>Расходы на этот объект по данным команды «Анфас»</caption>
              <thead>
                <tr>
                  <th scope="col">Раздел</th>
                  <th scope="col">Сумма</th>
                  <th scope="col">Точность суммы</th>
                </tr>
              </thead>
              <tbody>
                {grafikaBudget.map((row) => (
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
            Чистовые материалы, мебель и техника указаны приблизительно, поэтому итог округлён. Это
            исторический бюджет конкретной квартиры в 2024 году. Стоимость нового проекта
            рассчитываем отдельно с учётом площади, состояния и комплектации.
          </p>
        </section>
        <section className={styles.split} id="grafika-rent">
          <div>
            <p className={styles.eyebrow}>06 / Результат для инвестора</p>
            <h2>Аренда — 80 000 ₽ в месяц</h2>
          </div>
          <div className={styles.copy}>
            <p>
              По данным команды «Анфас», аренда этой квартиры составила 80 000 ₽ в месяц. Это
              результат конкретного объекта после ремонта и комплектации.
            </p>
            <p>
              План сдачи на три года и последующей продажи — стратегия заказчика. Доход от аренды
              должен покрывать часть вложений в период владения.
            </p>
            <p>
              Для похожего проекта обсудим состав работ, оснащение и бюджет. Ставка аренды зависит
              от квартиры и ситуации на рынке.
            </p>
            {showNotes ? (
              <aside className={styles.pending}>
                <span>Усилить подтверждение результата</span>
                <h3>Аренда и отзыв</h3>
                <p>
                  Добавить разрешённое обезличенное подтверждение ставки и период аренды. Срок
                  поиска арендатора не известен. Для отзыва нужен оригинал или ссылка на источник и
                  согласованное имя; прежний текст пока убран.
                </p>
              </aside>
            ) : null}
          </div>
        </section>
        <div className={styles.form} id="grafika-contact">
          <OpenLeadForm
            defaultService="individual"
            title={
              <>
                Обсудим <em>вашу инвестиционную квартиру?</em>
              </>
            }
            lead="Расскажите о квартире и задаче: обсудим планировку, ремонт, комплектацию и состав бюджета."
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
