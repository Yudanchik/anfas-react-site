import { useEffect } from 'react'
import { Link, useLoaderData } from 'react-router'

import { projectRepository } from '@/entities/project/api'
import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import { company } from '@/shared/config/company'
import { createSeoMeta } from '@/shared/config/seo'
import { assetUrl } from '@/shared/lib/asset-url'
import { reachGoal } from '@/shared/lib/yandex-metrika/reach-goal'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '@/widgets/home/ui'
import { PricesHero, PricesSeoNote } from '@/widgets/prices'

import styles from './PriceThanksRoute.module.scss'

export async function loader() {
  const projects = await projectRepository.getAll()

  return { projects: projects.slice(0, 3) }
}

export const meta = () =>
  createSeoMeta({
    title: 'Заявка на прайс-лист принята — Анфас',
    description:
      'Спасибо за заявку. Мы отправили письмо со ссылкой на скачивание полного прайс-листа на ремонт квартир.',
    path: '/prices/thanks',
    robots: 'noindex, follow',
  })

const nextSteps = [
  {
    title: 'Письмо уже в пути',
    text: 'На указанную почту отправляется письмо со ссылкой на скачивание полного прайс-листа со всеми категориями и позициями.',
  },
  {
    title: 'Проверьте папку «Спам»',
    text: 'Если письма нет во «Входящих» через несколько минут — загляните в «Спам»: почтовые сервисы иногда ошибаются.',
  },
  {
    title: 'Ссылка действует ограниченное время',
    text: 'Скачайте файл, пока ссылка активна. Если срок истёк — запросите прайс ещё раз через ту же форму.',
  },
] as const

const secondaryLinks = [
  {
    to: '/services',
    label: 'Услуги',
    text: 'Индивидуальный и пакетный формат ремонта — команда и понятный график от старта до сдачи.',
  },
  {
    to: '/prices',
    label: 'Прайс-лист',
    text: 'Все категории работ с ориентировочными ценами «от» и превью популярных позиций.',
  },
  {
    to: '/blog',
    label: 'Журнал',
    text: 'Практические статьи об этапах ремонта, инженерии и комплектации без лишней воды.',
  },
] as const

export default function PriceThanksRoute() {
  const { projects } = useLoaderData<typeof loader>()

  useEffect(() => {
    reachGoal('prices_thanks_view')
  }, [])

  return (
    <main className={styles.page}>
      <PricesHero
        eyebrow="Прайс-лист Анфас"
        title="Заявка на прайс принята"
        titleAccent="прайс принята"
        lead="Мы получили заявку и уже готовим письмо со ссылкой на скачивание полного прайс-листа. Обычно оно приходит в течение нескольких минут."
      />

      <section className={styles.section}>
        <PageWrapper>
          <SectionHeader
            className={styles.sectionHeader}
            label="Что дальше"
            title="Три простых шага до полного прайса"
          />

          <div className={styles.stepsGrid}>
            {nextSteps.map((step) => (
              <article className={styles.stepCard} key={step.title} data-reveal>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>

          <div className={styles.noteSpacing}>
            <PricesSeoNote
              title="Не нашли письмо?"
              text={`Свяжитесь с нами по телефону ${company.phone} или на почту ${company.email} — уточним заявку и отправим прайс повторно.`}
            />
          </div>
        </PageWrapper>
      </section>

      <section className={styles.section}>
        <PageWrapper>
          <div className={styles.consultationCard}>
            <div>
              <strong>Хотите обсудить смету прямо сейчас?</strong>
              <p>
                Расскажите о квартире и задачах на короткой консультации — предложим формат ремонта и
                ориентир по бюджету.
              </p>
            </div>
            <ModalTriggerButton intent="consultation" variant="outline" source="prices-thanks">
              Обсудить смету
            </ModalTriggerButton>
          </div>
        </PageWrapper>
      </section>

      {projects.length > 0 ? (
        <section className={styles.section}>
          <PageWrapper>
            <SectionHeader
              className={styles.sectionHeader}
              label="Пока ждёте письмо"
              title="Посмотрите реализованные проекты"
              lead="Реальные квартиры и интерьеры: площадь, срок, бюджет и фотографии готового результата."
            />

            <div className={styles.projectsGrid}>
              {projects.map((project) => (
                <Link className={styles.projectCard} key={project.slug} to={`/projects/${project.slug}`}>
                  <div className={styles.projectCardImage}>
                    <img src={assetUrl(project.image)} alt={project.title} />
                  </div>
                  <div className={styles.projectCardBody}>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <span>
                      Смотреть проект
                      <ArrowIcon size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </PageWrapper>
        </section>
      ) : null}

      <section className={`${styles.section} ${styles.linksSection}`}>
        <PageWrapper>
          <h2 className={styles.linksTitle}>Смотрите также</h2>
          <div className={styles.links}>
            {secondaryLinks.map((link) => (
              <Link className={styles.linkCard} key={link.to} to={link.to}>
                <strong>{link.label}</strong>
                <p>{link.text}</p>
                <span>
                  Перейти
                  <ArrowIcon size={14} />
                </span>
              </Link>
            ))}
          </div>
        </PageWrapper>
      </section>
    </main>
  )
}
