import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '../../ui'
import { storyPackage } from '../model/story-package.data'

import styles from './HomeStoryPackage.module.scss'

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

export function HomeStoryPackage({
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
            label={storyPackage.eyebrow}
            title={<>{renderMultiline(storyPackage.title)}</>}
            lead={storyPackage.lead}
            reveal={false}
          />

          <div className={styles.process}>
            {storyPackage.steps.map((step) => (
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
                src="/images/formats/package-format.webp"
                alt="Пакетный интерьер с готовыми решениями по отделке и комплектации"
              />
            </div>
            <span className={styles.summaryOverline}>{storyPackage.summary.overline}</span>
            <h3 className={styles.summaryTitle}>{storyPackage.summary.title}</h3>
            <p className={styles.summaryText}>{storyPackage.summary.text}</p>

            <ul className={styles.summaryList}>
              {storyPackage.summary.bullets.map((bullet) => (
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
