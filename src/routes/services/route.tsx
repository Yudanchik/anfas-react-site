import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

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
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    reset,
  } = useForm<BriefFormValues>({
    defaultValues: {
      name: '',
      phone: '',
      service: 'individual',
    },
    resolver: zodResolver(briefSchema),
  })

  const selectedService = useWatch({ control, name: 'service' })
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
    <main className={styles.servicesPage}>
      <section className={styles.servicesPage__hero}>
        <img className={styles.servicesPage__heroMedia} src={hero.image} alt={hero.alt} />
        <div className={styles.servicesPage__heroOverlay} />

        <PageWrapper className={styles.servicesPage__heroShell}>
          <div className={styles.servicesPage__heroContent}>
            <p className={styles.servicesPage__eyebrow}>Услуги Анфас</p>
            <h1 className={styles.servicesPage__title}>
              Ремонт квартиры
              <br />
              <em>под ваш сценарий жизни</em>
            </h1>
            <p className={styles.servicesPage__lead}>
              Сейчас у нас два основных формата: индивидуальный и пакетный ремонт. Оба ведут к
              готовому интерьеру под ключ, но отличаются глубиной проектирования, количеством
              решений и темпом запуска.
            </p>
          </div>

          <div className={styles.servicesPage__heroAside}>
            {heroCards.map((card) => (
              <article className={styles.servicesPage__heroCard} key={card.label}>
                <span className={styles.servicesPage__heroCardLabel}>{card.label}</span>
                <p className={styles.servicesPage__heroCardText}>{card.text}</p>
              </article>
            ))}
          </div>
        </PageWrapper>
      </section>

      <section className={styles.servicesPage__surfaceLight}>
        <PageWrapper>
          <section className={styles.servicesPage__section}>
            <div className={styles.servicesPage__sectionHeader}>
              <p className={styles.servicesPage__sectionLabel}>Два формата работы</p>
              <h2 className={styles.servicesPage__sectionTitle}>
                Выбирайте путь,
                <br />
                который <em>подходит именно вам</em>
              </h2>
              <p className={styles.servicesPage__sectionLead}>
                Мы не перегружаем страницу десятком псевдоуслуг. Сейчас фокус на двух направлениях,
                которые закрывают основные сценарии клиента: персональный интерьер под себя и
                пакетный ремонт квартиры с быстрым стартом.
              </p>
            </div>

            <div className={styles.servicesPage__servicesGrid}>
              {services.map((service, index) => (
                <article
                  className={`${styles.servicesPage__serviceCard} ${
                    index % 2 === 1 ? styles.servicesPage__serviceCard_reverse : ''
                  }`}
                  id={service.id}
                  key={service.id}
                  data-reveal
                >
                  <div className={styles.servicesPage__serviceMedia}>
                    <img className={styles.servicesPage__serviceImage} src={service.image} alt={service.title} />
                    <span className={styles.servicesPage__serviceBadge}>{service.tags[0]}</span>
                    <span className={styles.servicesPage__serviceNumber}>{service.number}</span>
                  </div>

                  <div className={styles.servicesPage__serviceBody}>
                    <h2 className={styles.servicesPage__serviceTitle}>{service.title}</h2>
                    <p className={styles.servicesPage__serviceText}>{service.text}</p>
                    <p className={styles.servicesPage__serviceLead}>{service.lead}</p>

                    <ul className={styles.servicesPage__serviceTags}>
                      {service.tags.map((tag) => (
                        <li className={styles.servicesPage__serviceTag} key={tag}>
                          {tag}
                        </li>
                      ))}
                    </ul>

                    <ul className={styles.servicesPage__serviceBullets}>
                      {service.bullets.map((bullet) => (
                        <li className={styles.servicesPage__serviceBullet} key={bullet}>
                          {bullet}
                        </li>
                      ))}
                    </ul>

                    <div className={styles.servicesPage__serviceMetrics}>
                      {service.metrics.map((metric) => (
                        <div className={styles.servicesPage__serviceMetric} key={metric.label}>
                          <strong className={styles.servicesPage__serviceMetricValue}>{metric.value}</strong>
                          <span className={styles.servicesPage__serviceMetricLabel}>{metric.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.servicesPage__serviceFoot}>
                      <div className={styles.servicesPage__serviceMeta}>
                        <strong className={styles.servicesPage__servicePrice}>{service.price}</strong>
                        <span className={styles.servicesPage__serviceDuration}>{service.duration}</span>
                      </div>
                      <button
                        className={styles.servicesPage__serviceButton}
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

      <section className={styles.servicesPage__surfaceDark}>
        <PageWrapper>
          <section className={styles.servicesPage__section}>
            <div className={styles.servicesPage__sectionHeader}>
              <p className={styles.servicesPage__sectionLabel}>Как понять, что ближе</p>
              <h2 className={styles.servicesPage__sectionTitle}>
                Кому подходит
                <br />
                <em>каждый формат</em>
              </h2>
            </div>

            <div className={styles.servicesPage__compare}>
              <article className={styles.servicesPage__compareCard} data-reveal>
                <span className={styles.servicesPage__compareLabel}>Индивидуальный ремонт</span>
                <h3 className={styles.servicesPage__compareTitle}>Когда важны уникальность и гибкость</h3>
                <p className={styles.servicesPage__compareText}>
                  Подходит, если вы хотите интерьер не по шаблону, готовы прорабатывать детали и
                  хотите собрать пространство под свой ритм жизни, привычки и долгий горизонт
                  использования.
                </p>
              </article>

              <article className={styles.servicesPage__compareCard} data-reveal>
                <span className={styles.servicesPage__compareLabel}>Пакетный ремонт</span>
                <h3 className={styles.servicesPage__compareTitle}>Когда важны скорость и предсказуемость</h3>
                <p className={styles.servicesPage__compareText}>
                  Подходит, если вы хотите быстрее перейти к результату, заранее понимать бюджет и
                  не тратить недели на сравнение каждого материала, света и позиции вручную.
                </p>
              </article>
            </div>
          </section>
        </PageWrapper>
      </section>

      <section className={styles.servicesPage__surfaceLight}>
        <PageWrapper>
          <section className={styles.servicesPage__formSection} data-reveal>
            <div className={styles.servicesPage__formHeader}>
              <h2 className={styles.servicesPage__formTitle}>Оставьте заявку и мы поможем выбрать формат</h2>
              <p className={styles.servicesPage__formLead}>
                Если пока неясно, что лучше для вашей квартиры, оставьте имя и телефон. Мы
                свяжемся, уточним задачу и подскажем, с чего лучше начать: с индивидуального
                проекта или с пакетного ремонта.
              </p>
            </div>

            <form className={styles.servicesPage__form} onSubmit={handleSubmit(submit)} noValidate>
              <fieldset className={styles.servicesPage__servicePicker}>
                <legend className={styles.servicesPage__servicePickerLegend}>Что интересует сейчас</legend>
                <div className={styles.servicesPage__serviceOptions}>
                  {briefServiceOptions.map((option) => (
                    <label
                      className={`${styles.servicesPage__serviceOption} ${
                        selectedService === option.value ? styles.servicesPage__serviceOption_active : ''
                      }`}
                      key={option.value}
                    >
                      <input
                        className={styles.servicesPage__serviceOptionInput}
                        type="radio"
                        value={option.value}
                        {...register('service')}
                      />
                      <span className={styles.servicesPage__serviceOptionText}>{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.service && <small className={styles.servicesPage__error}>{errors.service.message}</small>}
              </fieldset>

              <div className={styles.servicesPage__fields}>
                <label className={styles.servicesPage__field}>
                  <span className={styles.servicesPage__fieldLabel}>Имя</span>
                  <input
                    className={styles.servicesPage__fieldInput}
                    type="text"
                    placeholder="Ваше имя"
                    autoComplete="name"
                    maxLength={48}
                    {...register('name')}
                    onChange={(event) =>
                      setValue('name', sanitizeNameValue(event.target.value), { shouldValidate: true })
                    }
                  />
                  {errors.name && <small className={styles.servicesPage__error}>{errors.name.message}</small>}
                </label>

                <label className={styles.servicesPage__field}>
                  <span className={styles.servicesPage__fieldLabel}>Телефон</span>
                  <input
                    className={styles.servicesPage__fieldInput}
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
                  {errors.phone && <small className={styles.servicesPage__error}>{errors.phone.message}</small>}
                </label>
              </div>

              <div className={styles.servicesPage__formFooter}>
                <button className={styles.servicesPage__formButton} type="submit">
                  Отправить заявку
                </button>
                <p className={styles.servicesPage__privacy}>
                  Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности и на обработку
                  персональных данных.
                </p>
              </div>
            </form>

            {submitted ? (
              <p className={styles.servicesPage__success}>
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
