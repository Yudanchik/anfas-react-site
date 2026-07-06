import { formatChoice } from '../model/format-choice.data'
import { SectionHeader } from '../../ui'

import styles from './HomeFormatChoice.module.scss'

export function HomeFormatChoice({
  onOpenBrief,
  onScrollToCalculator,
}: {
  onOpenBrief: () => void
  onScrollToCalculator: () => void
}) {
  return (
    <section className={styles.choice}>
      <div className={styles.layout}>
        <SectionHeader
          number="04"
          label={formatChoice.eyebrow}
          title={
            <>
              {formatChoice.title}
              <br />
              <em>без лишнего шума</em>
            </>
          }
          lead={formatChoice.lead}
        />

        <div className={styles.options} data-reveal>
          {formatChoice.options.map((option) => (
            <article className={styles.card} key={option.key}>
              <p className={styles.badge}>{option.key === 'individual' ? 'Индивидуально' : 'Быстрый старт'}</p>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{option.title}</h3>
                <p className={styles.cardText}>{option.text}</p>
              </div>
              <ul className={styles.points}>
                {option.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <button
                className={styles.action}
                type="button"
                onClick={option.key === 'individual' ? onOpenBrief : onScrollToCalculator}
              >
                {option.cta}
              </button>
            </article>
          ))}
        </div>

        <div className={styles.footer} data-reveal>
          <p className={styles.footerText}>
            Если не хотите гадать, на следующем шаге можно перейти к мини-калькулятору пакетного
            решения или сразу оставить заявку на консультацию по дизайн-проекту.
          </p>
        </div>
      </div>
    </section>
  )
}
