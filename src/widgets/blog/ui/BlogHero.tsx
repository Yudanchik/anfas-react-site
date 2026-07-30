import { innerHeroImages } from '@/shared/config/hero-media'
import { tieRussianShortWords, tieRussianShortWordsInNode } from '@/shared/lib/tie-russian-short-words'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './BlogHero.module.scss'

const blogStats = [
  { label: 'Практика', value: 'разборы этапов, которые влияют на бюджет и сроки' },
  { label: 'Без воды', value: 'чеклисты приёмки и ошибки, которые дорого стоят' },
  { label: 'К ремонту', value: 'мягкий переход к услугам и реальным проектам' },
] as const

export function BlogHero() {
  const hero = innerHeroImages.blog

  return (
    <section className={styles.hero}>
      <img
        className={styles.media}
        src={hero.image}
        alt={hero.alt}
        width={hero.width}
        height={hero.height}
        loading="eager"
        decoding="sync"
      />
      <PageWrapper className={styles.wrap}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{tieRussianShortWords('Журнал Анфас')}</p>
          <h1 className={styles.title}>
            {tieRussianShortWordsInNode(
              <>
                Понятный ремонт
                <br />
                без <em>хаоса</em>
              </>,
            )}
          </h1>
          <p className={styles.lead}>
            {tieRussianShortWords(
              'Короткие практические статьи о инженерии, черновых работах и комплектации. Чтобы решения на объекте были спокойнее — и смета не разъезжалась на финише.',
            )}
          </p>

          <div className={styles.stats}>
            {blogStats.map((item) => (
              <div key={item.label}>
                <span>{tieRussianShortWords(item.label)}</span>
                <strong>{tieRussianShortWords(item.value)}</strong>
              </div>
            ))}
          </div>
        </div>

        <aside className={styles.aside}>
          <article className={styles.card}>
            <span className={styles.cardEyebrow}>{tieRussianShortWords('Зачем журнал')}</span>
            <p className={styles.cardTitle}>
              {tieRussianShortWords(
                'Объясняем этапы ремонта так, чтобы их можно было проверить на своём объекте.',
              )}
            </p>
            <p className={styles.cardText}>
              {tieRussianShortWords(
                'Электрика, полы, сантехника — темы, от которых зависят сроки, бюджет и спокойствие. Читайте, сверяйте чеклисты и переходите к услугам, когда нужна команда.',
              )}
            </p>
          </article>
        </aside>
      </PageWrapper>
    </section>
  )
}
