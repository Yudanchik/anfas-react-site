import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '../../ui'
import { storyIndividual } from '../model/story-individual.data'

import styles from './HomeStoryIndividual.module.scss'

function renderMultiline(text: string) {
  const lines = text.split('\n')

  return lines.map((line, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: Static presentation text
    <span key={index}>
      {line}
      {index === lines.length - 1 ? null : <br />}
    </span>
  ))
}

export function HomeStoryIndividual({
  onOpenBrief,
}: {
  onOpenBrief: (service?: 'individual' | 'package') => void
}) {
  return (
    <section className={styles.story + ' ' + styles.sectionpad}>
      <PageWrapper className={styles.layout}>
        <div className={styles.headerColumn}>
          <SectionHeader
            className={styles.storyHeader}
            number="02"
            label={storyIndividual.eyebrow}
            title={<>{renderMultiline(storyIndividual.title)}</>}
            lead={storyIndividual.lead}
            tone="dark"
            reveal={false}
          />

          <div className={styles.steps}>
            {storyIndividual.steps.map((step) => (
              <article className={styles.stepCard} key={step.label}>
                <span className={styles.stepLabel}>{step.label}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.heroCard}>
          <div className={styles.heroVisual}>
            <img
              className={styles.heroImage}
              src="/images/project-grafika.jpeg"
              alt="Премиальный интерьер для индивидуального проекта"
            />
            <div className={styles.heroGlow} aria-hidden="true" />
            <div className={styles.heroBadge}>Индивидуальный путь</div>
          </div>

          <div className={styles.heroContent}>
            <span className={styles.heroOverline}>{storyIndividual.hero.overline}</span>
            <h3 className={styles.heroTitle}>{storyIndividual.hero.title}</h3>
            <p className={styles.heroText}>{storyIndividual.hero.text}</p>

            <div className={styles.metrics}>
              {storyIndividual.hero.metrics.map((metric) => (
                <div className={styles.metric} key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>

            <button className={styles.cta} type="button" onClick={() => onOpenBrief('individual')}>
              <span>Хочу проект под себя</span>
              <i>
                <ArrowIcon size={16} />
              </i>
            </button>
          </div>
        </div>

        <div className={styles.highlights}>
          {storyIndividual.highlights.map((highlight) => (
            <article className={styles.highlightCard} key={highlight.label}>
              <span className={styles.highlightLabel}>{highlight.label}</span>
              <h3 className={styles.highlightTitle}>{highlight.title}</h3>
              <p className={styles.highlightText}>{highlight.text}</p>
            </article>
          ))}
        </div>
      </PageWrapper>
    </section>
  )
}
