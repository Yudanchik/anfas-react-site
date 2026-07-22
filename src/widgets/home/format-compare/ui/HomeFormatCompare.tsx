import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'

import { SectionHeader } from '../../ui'
import { formatCompare } from '../model/format-compare.data'
import styles from './HomeFormatCompare.module.scss'

export function HomeFormatCompare({
  onScrollToCalculator,
}: {
  onScrollToCalculator: () => void
}) {
  return (
    <section className={styles.compare}>
      <div className={styles.layout}>
        <SectionHeader
          number="03"
          label={formatCompare.eyebrow}
          title={
            <>
              Два формата.
              <br />
              Один <em>выбор</em>
            </>
          }
          lead={formatCompare.lead}
        />

        <div className={styles.cards} data-reveal>
          {formatCompare.items.map((item) => (
            <article className={styles.card} key={item.key}>
              <p className={styles.cardAccent}>{item.accent}</p>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{item.name}</h3>
                <p className={styles.cardText}>{item.text}</p>
              </div>
              <ul className={styles.cardList}>
                {item.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <p className={styles.cardNote}>{item.bestFor}</p>
              {item.key === 'individual' ? (
                <ModalTriggerButton
                  intent="individual"
                  source="home-format-compare-card"
                >
                  Обсудить проект
                </ModalTriggerButton>
              ) : (
                <button className={styles.action} type="button" onClick={onScrollToCalculator}>
                  Перейти к калькулятору
                </button>
              )}
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
              <div className={styles.tableRow} key={row.label}>
                <div className={styles.tableRowLabel}>{row.label}</div>
                <div className={styles.tableCell}>{row.individual}</div>
                <div className={styles.tableCell}>{row.package}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer} data-reveal>
          <p className={styles.footerText}>
            Если вам ближе индивидуальный сценарий, идём в дизайн-проект. Если важнее скорость и
            фиксированная логика, выбираем пакетное решение.
          </p>
          <div className={styles.footerActions}>
            <button className={styles.actionAlt} type="button" onClick={onScrollToCalculator}>
              Открыть калькулятор
            </button>
            <ModalTriggerButton
              intent="consultation"
              source="home-format-compare-footer"
            >
              Обсудить формат
            </ModalTriggerButton>
          </div>
        </div>
      </div>
    </section>
  )
}
