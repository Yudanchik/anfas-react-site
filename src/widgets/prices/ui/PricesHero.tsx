import { sharedHeroSlides } from '@/shared/config/hero-media'
import { tieRussianShortWords, tieRussianShortWordsInNode } from '@/shared/lib/tie-russian-short-words'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './PricesHero.module.scss'

type PricesHeroProps = {
  eyebrow: string
  title: string
  titleAccent: string
  lead: string
}

function titleWithAccent(title: string, accent: string) {
  const index = title.indexOf(accent)
  if (!accent || index < 0) {
    return tieRussianShortWords(title)
  }

  return tieRussianShortWordsInNode(
    <>
      {title.slice(0, index)}
      <em>{accent}</em>
      {title.slice(index + accent.length)}
    </>,
  )
}

export function PricesHero({ eyebrow, title, titleAccent, lead }: PricesHeroProps) {
  const hero = sharedHeroSlides[0]

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
          <p className={styles.eyebrow}>{tieRussianShortWords(eyebrow)}</p>
          <h1 className={styles.title}>{titleWithAccent(title, titleAccent)}</h1>
          <p className={styles.lead}>{tieRussianShortWords(lead)}</p>
        </div>
      </PageWrapper>
    </section>
  )
}
