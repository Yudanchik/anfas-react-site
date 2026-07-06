import { Link } from 'react-router'

import { formatChoice } from '../model/format-choice.data'

import styles from './HomeFormatChoice.module.scss'

export function HomeFormatChoice() {
  return (
    <section className={styles.choice}>
      <div className={styles.layout}>
        <div className={styles.header} data-reveal>
          <div>
            <div className={styles.kicker}>
              <span>04</span>
              <p>{formatChoice.eyebrow}</p>
            </div>
            <h2 className={styles.title}>
              {formatChoice.title}
              <br />
              <em>без лишнего шума</em>
            </h2>
          </div>
          <p className={styles.lead}>{formatChoice.lead}</p>
        </div>

        <div className={styles.options} data-reveal>
          {formatChoice.options.map((option) => (
            <article className={styles.card} key={option.key}>
              <p className={styles.badge}>{option.key === 'individual' ? 'Индивидуально' : 'Быстрый старт'}</p>
              <div>
                <h3>{option.title}</h3>
                <p className={styles.cardText}>{option.text}</p>
              </div>
              <ul className={styles.points}>
                {option.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Link className={styles.action} to={option.href}>
                {option.cta}
              </Link>
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
