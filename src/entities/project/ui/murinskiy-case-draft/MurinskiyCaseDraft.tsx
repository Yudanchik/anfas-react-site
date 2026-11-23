import { useEffect, useRef, useState, type ReactNode } from 'react'

import {
  murinskiyStages,
  resultPhotos,
  planPhotos,
  type CasePhoto,
} from '@/entities/project/model/murinskiy-case.data'
import type { Project } from '@/entities/project/model/project.types'
import { assetUrl } from '@/shared/lib/asset-url'
import { OpenLeadForm } from '@/shared/ui/open-lead-form'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './MurinskiyCaseDraft.module.scss'

const budgetRows = [
  'Дизайн-проект',
  'Ремонтные работы',
  'Черновые материалы',
  'Чистовые материалы',
  'Мебель, техника и комплектация',
]
const scope = [
  'Полный демонтаж',
  'Дизайн-проект',
  'Комплектация',
  'Ремонт',
  'Организация монтажа мебели',
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
  const [active, setActive] = useState<CasePhoto | null>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const close = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!active) return
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    close.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null)
      if (event.key === 'Tab') {
        event.preventDefault()
        close.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = oldOverflow
      window.removeEventListener('keydown', onKey)
      trigger.current?.focus()
    }
  }, [active])

  const photo = (item: CasePhoto) => (
    <figure className={styles.figure} key={item.src}>
      <button
        type="button"
        className={styles.photoButton}
        onClick={(event) => {
          trigger.current = event.currentTarget
          setActive(item)
        }}
        aria-label={`Увеличить: ${item.caption}`}
      >
        <img
          src={assetUrl(item.src)}
          alt={item.caption}
          loading="lazy"
          width={1448}
          height={1086}
        />
        <span className={styles.enlarge} aria-hidden="true">
          ↗
        </span>
      </button>
      <figcaption>{item.caption}</figcaption>
    </figure>
  )

  return (
    <main className={styles.case} data-project-case-draft="2-murinskiy-37">
      <header className={styles.hero}>
        <PageWrapper>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Санкт-Петербург · 2-й Муринский, 37</p>
              <h1>
                После пожара —<br />
                <em>новая жизнь квартиры</em>
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
                  <dt>Начало работ</dt>
                  <dd>Апрель 2023</dd>
                </div>
                <div>
                  <dt>Участие Анфас</dt>
                  <dd>Дизайн, ремонт, комплектация</dd>
                </div>
              </dl>
              <a className={styles.heroLink} href="#case-work">
                Посмотреть этапы работ ↓
              </a>
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
        <aside className={styles.notice}>
          <strong>Макет кейса на тестовом сайте</strong>
          <p>
            История и этапы собраны по вашим материалам. Пунктиром отмечены сведения, которые
            осталось уточнить текстом. Фотографии обработаны без дорисовки; для вертикальных кадров
            сохранена вся высота.
          </p>
        </aside>
        <nav className={styles.contents} aria-label="Разделы кейса">
          <a href="#case-task">Задача</a>
          <a href="#case-plan">Планировка</a>
          <a href="#case-work">Этапы работ</a>
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

        <section className={styles.section} id="case-plan">
          <p className={styles.eyebrow}>02 / Пространство и сценарии жизни</p>
          <h2>Что изменили в планировке</h2>
          <p className={styles.intro}>
            Задача новой планировки — разместить три комнаты, хранение и постирочную в квартире
            площадью 59 м². Ниже — отдельные фрагменты чертежей из переданных материалов.
          </p>
          <div className={styles.planGrid}>{planPhotos.slice(0, 2).map(photo)}</div>
          <details className={styles.more}>
            <summary>Сравнить с отдельным вариантом на согласование</summary>
            <div className={styles.planGrid}>{planPhotos.slice(2).map(photo)}</div>
          </details>
          <Pending title="Какая версия планировки реализована?">
            Обмерный план показывает раскрытое пространство и пока не подписан как исходная
            двухкомнатная квартира. План из полного проекта отличается от отдельного варианта на
            согласование. Нужно подтвердить реализованную версию и основу площади 59 м².
          </Pending>
        </section>

        <section className={styles.section} id="case-work">
          <p className={styles.eyebrow}>03 / Работа, которую обычно не видно</p>
          <h2>От демонтажа до новой электрики</h2>
          <p className={styles.intro}>
            21 фотография с объекта: раскрытые конструкции, новые перегородки, подготовка стен и
            пола, разводка электрики до закрытия потолка. Снимки сгруппированы по видам работ;
            точные даты этапов ещё уточняются.
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
          <div className={styles.pendingGrid}>
            <Pending title="Черновые работы — детали решения">
              Уточнить состав и толщину стяжки, материал штукатурки и толщину перегородок. Пока эти
              параметры не указаны как факты.
            </Pending>
            <Pending title="Инженерия и контроль">
              Дополнить текст по сантехнике, вентиляции и гидроизоляции. Для электрики — какие
              решения применили и какие проверки провели. Фото не заменяют результаты испытаний.
            </Pending>
          </div>
        </section>

        <section className={styles.section} id="case-result">
          <p className={styles.eyebrow}>04 / Готовое пространство</p>
          <h2>Квартира после ремонта</h2>
          <p className={styles.intro}>
            Фото готового интерьера уже есть в портфолио этого проекта: кухня-гостиная, спальня, ещё
            одна комната, ванная и отдельный санузел. В гардеробной размещены системы хранения,
            стиральная и сушильная машины.
          </p>
          <div className={styles.photoGrid}>{resultPhotos.map(photo)}</div>
          <Pending title="Что входило в «полное заселение»?">
            Уточнить, где заканчивалась работа Анфас: комплектация, координация монтажа мебели,
            уборка, подготовка квартиры к передаче или другие услуги.
          </Pending>
        </section>

        <section className={styles.section} id="case-budget">
          <p className={styles.eyebrow}>05 / Сроки и стоимость</p>
          <h2>Из чего сложился проект</h2>
          <div className={styles.pendingGrid}>
            <div className={styles.factCard}>
              <span>Подтверждено</span>
              <h3>Начало — апрель 2023</h3>
              <p>Дату завершения и фактическую продолжительность добавим после уточнения.</p>
            </div>
            <Pending title="Бюджет и год цен">
              Нужна стоимость для заказчика, состав суммы и расходы вне неё. Прежние цифры сайта
              пока не используем как подтверждённые.
            </Pending>
          </div>
          <div className={styles.budget}>
            <table>
              <caption>Место для подтверждённой разбивки бюджета</caption>
              <thead>
                <tr>
                  <th scope="col">Раздел</th>
                  <th scope="col">Сумма и состав</th>
                </tr>
              </thead>
              <tbody>
                {budgetRows.map((row) => (
                  <tr key={row}>
                    <th scope="row">{row}</th>
                    <td>Уточнить</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

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
        <div className={styles.form}>
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
            onClick={() => setActive(null)}
            tabIndex={-1}
          />
          <div className={styles.lightbox}>
            <button
              ref={close}
              type="button"
              className={styles.close}
              onClick={() => setActive(null)}
              aria-label="Закрыть"
            >
              ×
            </button>
            <img src={assetUrl(active.src)} alt={active.caption} />
            <p>{active.caption}</p>
          </div>
        </div>
      ) : null}
    </main>
  )
}
