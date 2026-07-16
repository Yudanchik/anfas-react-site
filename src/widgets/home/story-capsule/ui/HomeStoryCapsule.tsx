import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '../../ui'
import { storyCapsule } from '../model/story-capsule.data'

import styles from './HomeStoryCapsule.module.scss'

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

export function HomeStoryCapsule({
  onOpenBrief,
}: {
  onOpenBrief: (service?: 'individual' | 'package') => void
}) {
  return (
    <section className={styles.story + ' ' + styles.sectionpad}>
      <PageWrapper className={styles.layout}>
        <div className={styles.processColumn}>
          <SectionHeader
            className={styles.storyHeader}
            number="04"
            label={storyCapsule.eyebrow}
            title={<>{renderMultiline(storyCapsule.title)}</>}
            lead={storyCapsule.lead}
            reveal={false}
          />

          <div className={styles.process}>
            {storyCapsule.steps.map((step) => (
              <article className={styles.stepCard} key={step.number}>
                <div className={styles.stepTop}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  <span className={styles.stepMeta}>{step.meta}</span>
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.intro}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryVisual}>
              <div className={styles.summaryBadge}>Пакетный формат</div>
              <img
                className={styles.summaryImage}
                src="/images/project-murinskiy.jpeg"
                alt="Пакетный интерьер с готовыми решениями по отделке и комплектации"
              />
            </div>
            <span className={styles.summaryOverline}>{storyCapsule.summary.overline}</span>
            <h3 className={styles.summaryTitle}>{storyCapsule.summary.title}</h3>
            <p className={styles.summaryText}>{storyCapsule.summary.text}</p>

            <ul className={styles.summaryList}>
              {storyCapsule.summary.bullets.map((bullet) => (
                <li className={styles.summaryItem} key={bullet}>
                  {bullet}
                </li>
              ))}
            </ul>

            <button className={styles.cta} type="button" onClick={() => onOpenBrief('package')}>
              <span>Обсудить пакетный формат</span>
              <i>
                <ArrowIcon size={16} />
              </i>
            </button>
          </div>
        </div>
      </PageWrapper>
    </section>
  )
}
