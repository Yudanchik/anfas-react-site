import { Link } from 'react-router'

import { formatCompare } from '../model/format-compare.data'

import styles from './HomeFormatCompare.module.scss'

export function HomeFormatCompare() {
  return (
    <section className={styles.compare}>
      <div className={styles.layout}>
        <div className={styles.header} data-reveal>
          <div>
            <div className={styles.kicker}>
              <span>03</span>
              <p>{formatCompare.eyebrow}</p>
            </div>
            <h2 className={styles.title}>
              Два формата.
              <br />
              Один <em>выбор</em>
            </h2>
          </div>
          <p className={styles.lead}>{formatCompare.lead}</p>
        </div>

        <div className={styles.cards} data-reveal>
          {formatCompare.items.map((item) => (
            <article className={styles.card} key={item.key}>
              <p className={styles.cardAccent}>{item.accent}</p>
              <div>
                <h3>{item.name}</h3>
                <p className={styles.cardText}>{item.text}</p>
              </div>
              <ul className={styles.cardList}>
                {item.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <p className={styles.cardNote}>{item.bestFor}</p>
              <Link className={item.key === 'individual' ? styles.actionAlt : styles.action} to={item.href}>
                {item.key === 'individual' ? 'Посмотреть услуги' : 'Связаться с нами'}
              </Link>
            </article>
          ))}
        </div>

        <div className={styles.tableWrap} data-reveal>
          <div className={styles.tableTitle}>
            <h4>Сравнение по ключевым параметрам</h4>
            <span>Коротко и по делу</span>
          </div>
          <div className={styles.table}>
            <div className={styles.tableHeader}>Параметр</div>
            <div className={styles.tableHeader}>Дизайн-проект</div>
            <div className={styles.tableHeader}>Пакетное решение</div>
            {formatCompare.rows.map((row) => (
              <>
                <div className={styles.tableRowLabel}>{row.label}</div>
                <div className={styles.tableCell}>{row.individual}</div>
                <div className={styles.tableCell}>{row.package}</div>
              </>
            ))}
          </div>
        </div>

        <div className={styles.footer} data-reveal>
          <p className={styles.footerText}>
            Если вам ближе индивидуальный сценарий, идём в дизайн-проект. Если важнее скорость и
            фиксированная логика, выбираем пакетное решение.
          </p>
          <div className={styles.footerActions}>
            <Link className={styles.actionAlt} to="/services">
              Подробнее об услугах
            </Link>
            <Link className={styles.action} to="/contacts">
              Обсудить формат
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
