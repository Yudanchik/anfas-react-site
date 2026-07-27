import { Link } from 'react-router'

import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import { innerHeroImages } from '@/shared/config/hero-media'
import { createSeoMeta } from '@/shared/config/seo'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './AboutRoute.module.scss'

export const meta = () =>
  createSeoMeta({
    title: 'О компании Анфас — дизайн и ремонт квартир в Санкт-Петербурге',
    description:
      'Анфас с 2012 года ведёт дизайн и ремонт квартир в Санкт-Петербурге. Одна команда на проект, смету, материалы и сдачу объекта.',
    keywords:
      'о компании анфас, ремонт квартир спб, дизайн интерьера спб, ремонт под ключ, команда дизайнеров и строителей',
    path: '/about',
  })

const aboutStats = [
  { label: 'С 2012 года', value: 'ведём дизайн и ремонт в одной системе' },
  { label: 'Одна команда', value: 'проект, материалы и реализация без разрыва' },
  { label: 'Санкт-Петербург', value: 'работаем с квартирами и частными домами' },
] as const

export default function AboutRoute() {
  const hero = innerHeroImages.about

  return (
    <main className={styles.heroPage}>
      <section className={styles.heroSection}>
        <img
          className={styles.heroMedia}
          src={hero.image}
          alt={hero.alt}
          width={hero.width}
          height={hero.height}
          loading="eager"
          decoding="sync"
        />
        <PageWrapper className={styles.heroWrap}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>О компании Анфас</p>
            <h1 className={styles.heroTitle}>
              Дизайн и ремонт,
              <br />
              которые <em>не разваливаются на части</em>
            </h1>
            <p className={styles.heroLead}>
              Собрали процесс так, чтобы вы не управляли стройкой вручную. Анфас берёт на себя
              проектирование, материалы и реализацию — в одном согласованном ритме.
            </p>

            <div className={styles.heroActions}>
              <ModalTriggerButton
                className={styles.heroPrimaryAction}
                intent="consultation"
                size="lg"
                source="about-hero"
              >
                Обсудить проект
              </ModalTriggerButton>
              <Link className={styles.heroSecondaryAction} to="/projects">
                Смотреть проекты
              </Link>
            </div>

            <div className={styles.heroStats}>
              {aboutStats.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <aside className={styles.heroAside}>
            <article className={styles.heroCard}>
              <span className={styles.heroCardEyebrow}>Подход Анфас</span>
              <strong className={styles.heroCardTitle}>
                Дизайн и стройка — в одном процессе.
              </strong>
              <p className={styles.heroCardText}>
                Сначала собираем логику пространства, затем связываем её со сметой, сроками,
                поставками и контролем на объекте.
              </p>
            </article>
          </aside>
        </PageWrapper>
      </section>

      <section className={styles.darkSection}>
        <PageWrapper>
          <div className={styles.content}>
            <h2>Кирилл и Антон</h2>
            <p>
              Мы берём на себя дизайн и ремонт квартир в Санкт-Петербурге. Вам не нужно разбираться в
              стройке, координировать подрядчиков и ездить на объект каждый день. Внутри Анфас проект,
              смета, материалы и контроль качества собраны в один процесс, который легко отслеживать.
            </p>
          </div>
        </PageWrapper>
      </section>
    </main>
  )
}
