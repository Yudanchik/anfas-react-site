import { Link } from 'react-router'

import { innerHeroImages } from '@/shared/config/hero-media'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SeoContentBlock, seoContentPages } from '@/widgets/seo-content'

import styles from '../_shared/InnerPage.module.scss'

export const meta = () => [
  { title: 'О компании Анфас — дизайн и ремонт квартир в Санкт-Петербурге' },
  {
    name: 'description',
    content:
      'Команда Анфас проектирует и ведёт ремонт квартир в Санкт-Петербурге. Прозрачный процесс, понятные сроки и аккуратный результат.',
  },
  {
    name: 'keywords',
    content:
      'о компании анфас, ремонт квартир спб, дизайн интерьера, ремонт под ключ, команда дизайнеров и строителей',
  },
  { property: 'og:title', content: 'О компании Анфас — дизайн и ремонт квартир в Санкт-Петербурге' },
  {
    property: 'og:description',
    content:
      'Команда Анфас проектирует и ведёт ремонт квартир в Санкт-Петербурге. Прозрачный процесс, понятные сроки и аккуратный результат.',
  },
]

const aboutStats = [
  { label: 'С 2012 года', value: 'ведём дизайн и ремонт в одной системе' },
  { label: 'Одна команда', value: 'проект, комплектация и реализация без разрыва' },
  { label: 'Санкт-Петербург', value: 'работаем с квартирами и частными интерьерами' },
] as const

export default function AboutRoute() {
  const hero = innerHeroImages.about

  return (
    <main className={styles.heroPage}>
      <section className={styles.heroSection}>
        <img className={styles.heroMedia} src={hero.image} alt={hero.alt} />
        <PageWrapper className={styles.heroWrap}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>О компании Anfas</p>
            <h1 className={styles.heroTitle}>
              Дизайн и ремонт,
              <br />
              которые <em>не разваливаются на части</em>
            </h1>
            <p className={styles.heroLead}>
              Мы собрали процесс так, чтобы клиент не управлял стройкой вручную. Анфас берёт на себя
              проектирование, комплектацию и реализацию квартиры под ключ в одном ритме.
            </p>

            <div className={styles.heroActions}>
              <Link className={styles.heroPrimaryAction} to="/contacts">
                Обсудить проект
              </Link>
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
              <span className={styles.heroCardEyebrow}>Подход Anfas</span>
              <strong className={styles.heroCardTitle}>
                Не продаём абстрактный дизайн отдельно от стройки.
              </strong>
              <p className={styles.heroCardText}>
                Сначала собираем логику пространства, потом связываем её со сметой, сроками,
                поставками и контролем реализации.
              </p>
            </article>
          </aside>
        </PageWrapper>
      </section>

      <section className={styles.lightSection}>
        <PageWrapper>
          <SeoContentBlock embedded {...seoContentPages.about} />
        </PageWrapper>
      </section>

      <section className={styles.darkSection}>
        <PageWrapper>
          <div className={styles.content}>
            <h2>Кирилл и Антон</h2>
            <p>
              Мы берём на себя дизайн и ремонт квартиры под ключ. Клиент не должен разбираться в
              стройке, координировать подрядчиков и ездить на объект каждый день. Поэтому внутри
              Anfas проект, смета, комплектация и контроль качества собраны в один процесс, который
              легко читать и контролировать.
            </p>
          </div>
        </PageWrapper>
      </section>
    </main>
  )
}
