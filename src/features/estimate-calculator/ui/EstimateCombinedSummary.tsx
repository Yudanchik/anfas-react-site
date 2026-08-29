import { useId, useState } from 'react'

import type { SelectedEstimateSectionGroup } from '@/entities/estimate'
import { formatPriceValue } from '@/entities/price/lib/price-helpers'

import styles from './EstimateCombinedSummary.module.scss'

type EstimateCombinedSummaryProps = {
  sections: readonly SelectedEstimateSectionGroup[]
  grandTotalRub: number
}

export function EstimateCombinedSummary({
  sections,
  grandTotalRub,
}: EstimateCombinedSummaryProps) {
  const [expanded, setExpanded] = useState(false)
  const [openSectionIds, setOpenSectionIds] = useState(() => new Set<string>())
  const panelId = useId()
  const titleId = 'estimate-combined-summary-title'
  const selectedCount = sections.reduce((sum, section) => sum + section.selectedCount, 0)
  const hasRows = sections.length > 0

  function isSectionOpen(sectionId: string): boolean {
    return openSectionIds.has(sectionId)
  }

  function toggleSection(sectionId: string) {
    setOpenSectionIds((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }

  return (
    <section className={styles.wrap} aria-labelledby={titleId}>
      <button
        type="button"
        className={styles.toggle}
        data-open={expanded ? 'true' : 'false'}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <span className={styles.chevron} data-open={expanded ? 'true' : 'false'} aria-hidden="true" />
        <span className={styles.toggleMain}>
          <span className={styles.title} id={titleId}>
            Итоговая смета
          </span>
          <span className={styles.compactStats}>
            <span className={styles.statChip}>Позиций: {selectedCount}</span>
            {sections.map((section) => (
              <span key={section.sectionId} className={styles.statChip}>
                {section.sectionTitle}: {formatPriceValue(section.subtotalRub)} ₽
              </span>
            ))}
            <span className={styles.statTotal}>Всего: {formatPriceValue(grandTotalRub)} ₽</span>
          </span>
          {!hasRows ? <span className={styles.miniEmpty}>Нет выбранных позиций</span> : null}
        </span>
      </button>

      <div
        className={styles.panel}
        id={panelId}
        hidden={!expanded}
        role="region"
        aria-labelledby={titleId}
      >
        <p className={styles.lead}>
          Здесь собраны выбранные позиции по всем разделам. Материалы пока не учитываются.
        </p>

        {!hasRows ? (
          <p className={styles.empty} role="status">
            Включите работы или примените сценарий на вкладке раздела.
          </p>
        ) : (
          <div className={styles.sections}>
            {sections.map((section) => {
              const sectionOpen = isSectionOpen(section.sectionId)
              const sectionTitleId = `estimate-summary-section-${section.sectionId}`
              const sectionPanelId = `estimate-summary-section-panel-${section.sectionId}`

              return (
                <section
                  key={section.sectionId}
                  className={styles.section}
                  aria-labelledby={sectionTitleId}
                >
                  <button
                    type="button"
                    className={styles.sectionToggle}
                    data-open={sectionOpen ? 'true' : 'false'}
                    aria-expanded={sectionOpen}
                    aria-controls={sectionPanelId}
                    onClick={() => toggleSection(section.sectionId)}
                  >
                    <span
                      className={styles.chevron}
                      data-open={sectionOpen ? 'true' : 'false'}
                      aria-hidden="true"
                    />
                    <span className={styles.sectionTitle} id={sectionTitleId}>
                      {section.sectionTitle}
                    </span>
                    <span className={styles.sectionMeta}>Позиций: {section.selectedCount}</span>
                    <strong className={styles.sectionTotal}>
                      {formatPriceValue(section.subtotalRub)} ₽
                    </strong>
                  </button>

                  <div
                    className={styles.sectionPanel}
                    id={sectionPanelId}
                    hidden={!sectionOpen}
                    role="region"
                    aria-labelledby={sectionTitleId}
                  >
                    <ul className={styles.list}>
                      {section.items.map((item) => {
                        const showCoefficient = item.line.coefficient !== 1
                        return (
                          <li key={item.line.id} className={styles.item}>
                            <div className={styles.itemMain}>
                              <span className={styles.group}>{item.groupTitle}</span>
                              {item.line.zoneName ? (
                                <span className={styles.zone}>Зона: {item.line.zoneName}</span>
                              ) : null}
                              <span className={styles.work}>{item.line.title}</span>
                            </div>
                            <div className={styles.itemMeta}>
                              <span>
                                {item.line.quantity} {item.line.unit}
                              </span>
                              <span>× {formatPriceValue(item.line.unitPrice)} ₽</span>
                              {showCoefficient ? (
                                <span>× коэф. {item.line.coefficient}</span>
                              ) : null}
                              <strong className={styles.itemTotal}>
                                {formatPriceValue(item.lineTotal)} ₽
                              </strong>
                            </div>
                            {item.line.comment ? (
                              <p className={styles.comment}>{item.line.comment}</p>
                            ) : null}
                          </li>
                        )
                      })}
                    </ul>

                    <div className={styles.sectionSubtotal}>
                      <span>Итого · {section.sectionTitle}</span>
                      <strong>{formatPriceValue(section.subtotalRub)} ₽</strong>
                    </div>
                  </div>
                </section>
              )
            })}
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.stat}>
            <span className={styles.label}>Позиций в итоге</span>
            <strong className={styles.value}>{selectedCount}</strong>
          </div>
          {sections.map((section) => (
            <div key={`stat-${section.sectionId}`} className={styles.stat}>
              <span className={styles.label}>{section.sectionTitle}</span>
              <strong className={styles.value}>
                {formatPriceValue(section.subtotalRub)} ₽
              </strong>
            </div>
          ))}
          <div className={styles.stat}>
            <span className={styles.label}>Всего</span>
            <strong className={styles.value}>{formatPriceValue(grandTotalRub)} ₽</strong>
          </div>
          <p className={styles.note} role="status">
            Материалы пока не учитываются.
          </p>
        </div>
      </div>
    </section>
  )
}
