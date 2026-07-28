import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import type { ServicePackage } from '@/entities/service/model/services.data'
import packageFormatImage from '@/assets/images/formats/package-format.webp'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { SectionHeader } from '../../ui'

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

type HomeStoryPackageProps = {
  service: ServicePackage
  tone?: 'light' | 'dark'
}

export function HomeStoryPackage({ service, tone = 'light' }: HomeStoryPackageProps) {
  const { story } = service

  return (
    <section
      className={`${styles.story} ${styles.sectionpad} ${tone === 'dark' ? styles.story_dark : ''}`}
    >
      <PageWrapper className={styles.layout}>
        <div className={styles.processColumn}>
          <SectionHeader
            className={styles.storyHeader}
            label={story.eyebrow}
            title={<>{renderMultiline(story.title)}</>}
            lead={story.lead}
            tone={tone === 'dark' ? 'dark' : 'light'}
            reveal={false}
          />

          <div className={styles.process}>
            {story.steps.map((step) => (
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
                src={packageFormatImage}
                alt="Пакетный интерьер с готовыми решениями по отделке и комплектации"
                width={1448}
                height={1086}
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className={styles.summaryContent}>
              <span className={styles.summaryOverline}>{story.summary.overline}</span>
              <h3 className={styles.summaryTitle}>{story.summary.title}</h3>
              <p className={styles.summaryText}>{story.summary.text}</p>

              <ul className={styles.summaryList}>
                {story.summary.bullets.map((bullet) => (
                  <li className={styles.summaryItem} key={bullet}>
                    {bullet}
                  </li>
                ))}
              </ul>

              <ModalTriggerButton
                className={styles.cta}
                intent="package"
                source="service-package-story"
              >
                {service.ctaLabel}
              </ModalTriggerButton>
            </div>
          </div>
        </div>
      </PageWrapper>
    </section>
  )
}
