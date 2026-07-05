import { useRef, type MouseEvent } from 'react'
import { Link } from 'react-router'

import { processSteps } from '@/entities/process/model/process.data'
import { services } from '@/entities/service/model/services.data'
import { faqItems } from '@/features/faq/model/faq.data'
import { assetUrl } from '@/shared/lib/asset-url'
import { Counter } from '@/shared/ui/counter/Counter'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PlusIcon } from '@/shared/ui/icons/PlusIcon'

export function HomeHero({ onOpenBrief }: { onOpenBrief: () => void }) {
  const heroRef = useRef<HTMLElement>(null)

  const handleHeroMove = (event: MouseEvent<HTMLElement>) => {
    const hero = heroRef.current

    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const rect = hero.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5

    hero.style.setProperty('--mouse-x', `${x * 18}px`)
    hero.style.setProperty('--mouse-y', `${y * 14}px`)
  }

  return (
<section id="top" className="hero" ref={heroRef} onMouseMove={handleHeroMove}>
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-wash" aria-hidden="true" />
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">
              <span />
              Санкт-Петербург · с 2012 года
            </p>
            <h1>
              Интерьер,
              <br />
              который <em>выглядит</em>
              <br />
              как вы
            </h1>
            <p className="hero-lead">
              Проектируем и реализуем пространства, в которых красиво не только на рендерах, но и
              каждый день.
            </p>
            <button className="primary-button" type="button" onClick={onOpenBrief}>
              <span>Обсудить проект</span>
              <i>
                <ArrowIcon />
              </i>
            </button>
          </div>

          <div className="hero-side">
            <div className="hero-badge">
              <span>Дизайн</span>
              <span>Ремонт</span>
              <span>Комплектация</span>
            </div>
            <Link className="hero-case-link" to="/projects">
              <span>
                Смотреть
                <br />
                проекты
              </span>
              <i>
                <ArrowIcon />
              </i>
            </Link>
          </div>
        </div>

        <div className="hero-meta">
          <span>59.9343° N</span>
          <span>30.3351° E</span>
          <span className="scroll-note">
            Листайте вниз <i />
          </span>
        </div>
      </section>

      
  )
}

export function HomeTicker() {
  return (
<div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((group) => (
            <div className="ticker-group" key={group}>
              <span>Дизайн без компромиссов</span>
              <i>✦</i>
              <span>Прозрачная реализация</span>
              <i>✦</i>
              <span>Гарантия на работы</span>
              <i>✦</i>
            </div>
          ))}
        </div>
      </div>

      
  )
}

export function HomeManifesto() {
  return (
<section className="manifesto section-pad">
        <div className="section-kicker" data-reveal>
          <span>01</span>
          <p>Наш подход</p>
        </div>
        <div className="manifesto-layout">
          <p className="manifesto-note" data-reveal>
            Не навязываем «модный стиль». Сначала слушаем вас, затем собираем пространство вокруг
            привычек, задач и характера.
          </p>
          <h2 data-reveal>
            Мы проектируем
            <br />
            не <s>красивые картинки.</s>
            <br />
            Мы проектируем <em>жизнь</em>
            <br />
            внутри.
          </h2>
        </div>
        <div className="stats-row">
          <div data-reveal>
            <strong>
              <Counter value={10} suffix="+" />
            </strong>
            <span>
              лет создаём
              <br />
              интерьеры
            </span>
          </div>
          <div data-reveal>
            <strong>
              <Counter value={1000} suffix="+" />
            </strong>
            <span>
              реализованных
              <br />
              проектов
            </span>
          </div>
          <div data-reveal>
            <strong>
              <Counter value={5} />
            </strong>
            <span>
              этапов от идеи
              <br />
              до новоселья
            </span>
          </div>
        </div>
      </section>

      
  )
}

export function HomeServices() {
  return (
<section id="services" className="services section-pad">
        <div className="section-head" data-reveal>
          <div>
            <div className="section-kicker light">
              <span>02</span>
              <p>Что мы делаем</p>
            </div>
            <h2>
              Один подрядчик.
              <br />
              <em>Весь путь.</em>
            </h2>
          </div>
          <p>
            От первой линии на плане до последней лампы: одна команда отвечает за результат целиком.
          </p>
        </div>

        <div className="service-list">
          {services.map((service) => (
            <article className="service-card" key={service.id} data-reveal>
              <span className="service-number">{service.number}</span>
              <div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </div>
              <ul>
                {service.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <Link to={`/services#${service.id}`} aria-label={`Подробнее: ${service.title}`}>
                <ArrowIcon />
              </Link>
            </article>
          ))}
        </div>
      </section>

      
  )
}

export function HomeProjects({ projects }: {
  projects: ReadonlyArray<{
    slug: string
    size: string
    image: string
    type: string
    title: string
    area: string
    term: string
    price: string
  }>
}) {
  return (
<section id="projects" className="projects section-pad">
        <div className="projects-head">
          <div className="section-kicker light" data-reveal>
            <span>03</span>
            <p>Реализованные проекты</p>
          </div>
          <h2 data-reveal>Говорим работами.</h2>
          <p data-reveal>
            Здесь не визуализации. Это пространства, которые уже живут вместе со своими владельцами.
          </p>
        </div>

        <div className="project-grid">
          {projects.map((project, index) => (
            <Link
              className={`project-card project-${project.size}`}
              key={project.slug}
              to={`/projects/${project.slug}`}
              data-reveal
            >
              <div className="project-image-wrap">
                <img src={assetUrl(project.image)} alt={project.type} />
                <span className="project-index">0{index + 1}</span>
                <div className="project-action">
                  <ArrowIcon />
                </div>
              </div>
              <div className="project-copy">
                <div>
                  <p>{project.type}</p>
                  <h3>{project.title}</h3>
                </div>
                <dl>
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
            </Link>
          ))}
        </div>

        <Link className="text-link" to="/projects" data-reveal>
          <span>Посмотреть все проекты</span>
          <ArrowIcon />
        </Link>
      </section>

      
  )
}

export function HomeProcess({ onOpenBrief }: { onOpenBrief: () => void }) {
  return (
<section id="process" className="process section-pad">
        <div className="process-intro">
          <div className="section-kicker" data-reveal>
            <span>04</span>
            <p>Как всё устроено</p>
          </div>
          <h2 data-reveal>
            Пять понятных
            <br />
            шагов до <em>дома.</em>
          </h2>
          <p data-reveal>
            Без туманных формулировок и «разберёмся по ходу». Каждый этап имеет результат, срок и
            ответственного.
          </p>
          <button className="outline-button" type="button" onClick={onOpenBrief} data-reveal>
            <span>Начать с первого шага</span>
            <ArrowIcon />
          </button>
        </div>

        <div className="process-steps">
          {processSteps.map((step, index) => (
            <article key={step.title} data-reveal>
              <span>0{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      
  )
}

export function HomeQuote() {
  return (
<section className="quote-section">
        <div className="quote-image" aria-hidden="true" />
        <div className="quote-card" data-reveal>
          <span className="quote-mark">“</span>
          <blockquote>
            Не пудрим мозги, берём ответственность на себя и закрываем вопрос полностью. Просто,
            честно, по делу.
          </blockquote>
          <footer>
            <strong>Кирилл и Антон</strong>
            <span>Основатели «Анфас»</span>
          </footer>
        </div>
      </section>

      
  )
}

export function HomeFaq({
  openFaq,
  setOpenFaq,
}: {
  openFaq: number
  setOpenFaq: (value: number) => void
}) {
  return (
<section className="faq section-pad">
        <div className="faq-title">
          <div className="section-kicker" data-reveal>
            <span>05</span>
            <p>Частые вопросы</p>
          </div>
          <h2 data-reveal>
            Закрываем
            <br />
            <em>главные страхи.</em>
          </h2>
          <p data-reveal>
            Здесь собрали короткие ответы про сроки, бюджет, контроль, удалённый ремонт и выбор
            между дизайн-проектом и пакетным решением.
          </p>
        </div>
        <div className="faq-list">
          {faqItems.map((item, index) => (
            <article
              className={`faq-item ${openFaq === index ? 'is-open' : ''}`}
              key={item.question}
            >
              <button
                type="button"
                aria-expanded={openFaq === index}
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
              >
                <span>0{index + 1}</span>
                <strong>{item.question}</strong>
                <PlusIcon open={openFaq === index} />
              </button>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      
  )
}

export function HomeContact({ onOpenBrief }: { onOpenBrief: () => void }) {
  return (
<section id="contacts" className="contact">
        <div className="contact-orbit" aria-hidden="true">
          <span />
          <i />
        </div>
        <p className="eyebrow" data-reveal>
          <span /> Есть идея?
        </p>
        <h2 data-reveal>
          Давайте посмотрим,
          <br />
          <em>что из неё получится.</em>
        </h2>
        <p className="contact-lead" data-reveal>
          Расскажите немного о будущем интерьере. Мы свяжемся, зададим правильные вопросы и
          предложим следующий шаг.
        </p>
        <button className="contact-button" type="button" onClick={onOpenBrief} data-reveal>
          <span>Заполнить короткий бриф</span>
          <i>
            <ArrowIcon />
          </i>
        </button>
      </section>

  )
}
