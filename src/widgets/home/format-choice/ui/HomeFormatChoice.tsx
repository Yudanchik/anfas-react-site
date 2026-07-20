import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'

import { SectionHeader } from '../../ui'
import { formatChoice } from '../model/format-choice.data'
import styles from './HomeFormatChoice.module.scss'

export function HomeFormatChoice({
  onScrollToCalculator,
}: {
  onScrollToCalculator: () => void
}) {
  return (
    <section className={styles.choice}>
      <div className={styles.choice__layout}>
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

        <div className={styles.choice__options} data-reveal>
          {formatChoice.options.map((option) => (
            <article className={styles.choice__card} key={option.key}>
              <p className={styles.choice__badge}>
                {option.key === 'individual' ? 'Индивидуально' : 'Быстрый старт'}
              </p>
              <div className={styles.choice__cardBody}>
                <h3 className={styles.choice__cardTitle}>{option.title}</h3>
                <p className={styles.choice__cardText}>{option.text}</p>
              </div>
              <ul className={styles.choice__points}>
                {option.points.map((point) => (
                  <li className={styles.choice__point} key={point}>
                    {point}
                  </li>
                ))}
              </ul>
              {option.key === 'individual' ? (
                <ModalTriggerButton
                  intent="individual"
                  source="home-format-choice"
                >
                  {option.cta}
                </ModalTriggerButton>
              ) : (
                <button
                  className={styles.choice__action}
                  type="button"
                  onClick={onScrollToCalculator}
                >
                  {option.cta}
                </button>
              )}
            </article>
          ))}
        </div>

        <div className={styles.choice__footer} data-reveal>
          <p className={styles.choice__footerText}>
            Если не хотите гадать, на следующем шаге можно перейти к мини-калькулятору пакетного
            решения или сразу оставить заявку на консультацию по дизайн-проекту.
          </p>
        </div>
      </div>
    </section>
  )
}
