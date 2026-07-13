import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useBrief } from '@/features/brief/model/BriefContext'
import {
  briefServiceOptions,
  formatPhoneValue,
  sanitizeNameValue,
} from '@/features/brief/model/brief.form'
import { briefSchema, type BriefFormValues } from '@/features/brief/model/brief.schema'
import { services } from '@/entities/service/model/services.data'
import { innerHeroImages } from '@/shared/config/hero-media'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './route.module.scss'

export const meta = () => [
  { title: 'Услуги ремонта квартир под ключ | Анфас' },
  {
    name: 'description',
    content:
      'Индивидуальный и пакетный ремонт квартир под ключ в Санкт-Петербурге. Понятные сроки, прозрачная смета, комплектация и одна команда на весь проект.',
  },
  {
    name: 'keywords',
    content:
      'ремонт квартир под ключ спб, индивидуальный ремонт, пакетный ремонт, дизайн и ремонт квартиры, ремонт квартиры с комплектацией',
  },
]

const heroCards = [
  {
    label: 'Индивидуальный формат',
    text: 'Подходит, если нужен интерьер под вас, гибкая планировка и точная работа с деталями без шаблонных решений.',
  },
  {
    label: 'Пакетный формат',
    text: 'Подходит, если важны быстрый старт, понятный бюджет и собранные решения без перегруза и лишних согласований.',
  },
] as const

export default function ServicesRoute() {
  const { openBrief } = useBrief()
  const [submitted, setSubmitted] = useState(false)
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
  } = useForm<BriefFormValues>({
    defaultValues: {
      name: '',
      phone: '',
      service: 'individual',
    },
    resolver: zodResolver(briefSchema),
  })

  const selectedService = watch('service')
  const hero = innerHeroImages.services

  const submit = (_values: BriefFormValues) => {
    setSubmitted(true)
    reset({
      name: '',
      phone: '',
      service: selectedService,
    })
  }

  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <img className={styles.heroMedia} src={hero.image} alt={hero.alt} />
        <div className={styles.heroOverlay} />

        <PageWrapper className={styles.heroShell}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Услуги Anfas</p>
            <h1 className={styles.title}>
              Ремонт квартиры
              <br />
              <em>под ваш сценарий жизни</em>
            </h1>
            <p className={styles.lead}>
              Сейчас у нас два основных формата: индивидуальный и пакетный ремонт. Оба ведут к
              готовому интерьеру под ключ, но отличаются глубиной проектирования, количеством
              решений и темпом запуска.
            </p>
          </div>

          <div className={styles.heroAside}>
            {heroCards.map((card) => (
              <article className={styles.heroCard} key={card.label}>
                <span>{card.label}</span>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </PageWrapper>
      </section>

      <section className={styles.surfaceLight}>
        <PageWrapper>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionLabel}>Два формата работы</p>
              <h2 className={styles.sectionTitle}>
                Выбирайте путь,
                <br />
                который <em>подходит именно вам</em>
              </h2>
              <p className={styles.sectionLead}>
                Мы не перегружаем страницу десятком псевдоуслуг. Сейчас фокус на двух направлениях,
                которые закрывают основные сценарии клиента: персональный интерьер под себя и
                пакетный ремонт квартиры с быстрым стартом.
              </p>
            </div>

            <div className={styles.servicesGrid}>
              {services.map((service, index) => (
                <article
                  className={`${styles.serviceCard} ${index % 2 === 1 ? styles.serviceCardReverse : ''}`}
                  id={service.id}
                  key={service.id}
                  data-reveal
                >
                  <div className={styles.serviceMedia}>
                    <img src={service.image} alt={service.title} />
                    <span className={styles.serviceBadge}>{service.tags[0]}</span>
                    <span className={styles.serviceNumber}>{service.number}</span>
                  </div>

                  <div className={styles.serviceBody}>
                    <h2 className={styles.serviceTitle}>{service.title}</h2>
                    <p className={styles.serviceText}>{service.text}</p>
                    <p className={styles.serviceLead}>{service.lead}</p>

                    <ul className={styles.serviceTags}>
                      {service.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>

                    <ul className={styles.serviceBullets}>
                      {service.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>

                    <div className={styles.serviceMetrics}>
                      {service.metrics.map((metric) => (
                        <div className={styles.serviceMetric} key={metric.label}>
                          <strong>{metric.value}</strong>
                          <span>{metric.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.serviceFoot}>
                      <div className={styles.serviceMeta}>
                        <strong>{service.price}</strong>
                        <span>{service.duration}</span>
                      </div>
                      <button
                        className={styles.serviceButton}
                        type="button"
                        onClick={() => openBrief(service.id)}
                      >
                        {service.ctaLabel}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </PageWrapper>
      </section>

      <section className={styles.surfaceDark}>
        <PageWrapper>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionLabel}>Как понять, что ближе</p>
              <h2 className={styles.sectionTitle}>
                Кому подходит
                <br />
                <em>каждый формат</em>
              </h2>
            </div>

            <div className={styles.compare}>
              <article className={styles.compareCard} data-reveal>
                <span>Индивидуальный ремонт</span>
                <h3>Когда важны уникальность и гибкость</h3>
                <p>
                  Подходит, если вы хотите интерьер не по шаблону, готовы прорабатывать детали и
                  хотите собрать пространство под свой ритм жизни, привычки и долгий горизонт
                  использования.
                </p>
              </article>

              <article className={styles.compareCard} data-reveal>
                <span>Пакетный ремонт</span>
                <h3>Когда важны скорость и предсказуемость</h3>
                <p>
                  Подходит, если вы хотите быстрее перейти к результату, заранее понимать бюджет и
                  не тратить недели на сравнение каждого материала, света и позиции вручную.
                </p>
              </article>
            </div>
          </section>
        </PageWrapper>
      </section>

      <section className={styles.surfaceLight}>
        <PageWrapper>
          <section className={styles.formSection} data-reveal>
            <div className={styles.formHeader}>
              <h2>Оставьте заявку и мы поможем выбрать формат</h2>
              <p>
                Если пока неясно, что лучше для вашей квартиры, оставьте имя и телефон. Мы
                свяжемся, уточним задачу и подскажем, с чего лучше начать: с индивидуального
                проекта или с пакетного ремонта.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
              <fieldset className={styles.servicePicker}>
                <legend>Что интересует сейчас</legend>
                <div className={styles.serviceOptions}>
                  {briefServiceOptions.map((option) => (
                    <label
                      className={`${styles.serviceOption} ${selectedService === option.value ? styles.serviceOptionActive : ''}`}
                      key={option.value}
                    >
                      <input type="radio" value={option.value} {...register('service')} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.service && <small className={styles.error}>{errors.service.message}</small>}
              </fieldset>

              <div className={styles.fields}>
                <label className={styles.field}>
                  <span>Имя</span>
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    autoComplete="name"
                    maxLength={48}
                    {...register('name')}
                    onChange={(event) =>
                      setValue('name', sanitizeNameValue(event.target.value), { shouldValidate: true })
                    }
                  />
                  {errors.name && <small className={styles.error}>{errors.name.message}</small>}
                </label>

                <label className={styles.field}>
                  <span>Телефон</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={18}
                    placeholder="+7 (999) 000-00-00"
                    {...register('phone')}
                    onChange={(event) =>
                      setValue('phone', formatPhoneValue(event.target.value), { shouldValidate: true })
                    }
                  />
                  {errors.phone && <small className={styles.error}>{errors.phone.message}</small>}
                </label>
              </div>

              <div className={styles.formFooter}>
                <button className={styles.formButton} type="submit">
                  Отправить заявку
                </button>
                <p className={styles.privacy}>
                  Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности и на обработку
                  персональных данных.
                </p>
              </div>
            </form>

            {submitted ? (
              <p className={styles.success}>
                Спасибо. Форма уже проходит клиентскую валидацию. Следующим шагом можно подключить
                отправку заявок в Telegram, почту или CRM.
              </p>
            ) : null}
          </section>
        </PageWrapper>
      </section>
    </main>
  )
}
