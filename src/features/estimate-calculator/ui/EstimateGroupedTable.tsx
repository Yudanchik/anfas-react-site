import { useState } from 'react'

import type { EstimateLine } from '@/entities/estimate'

import { EstimateGroupHeader, type EstimateGroupView } from './EstimateGroupHeader'
import { EstimateLineRow } from './EstimateLineRow'
import styles from './EstimateGroupedTable.module.scss'

export type EstimateGroupedTableGroup = EstimateGroupView & {
  lines: readonly EstimateLine[]
}

type EstimateGroupedTableProps = {
  title?: string
  lead?: string
  idPrefix: string
  groups: readonly EstimateGroupedTableGroup[]
  /** @deprecated Ignored — groups stay collapsed until the user opens them. */
  defaultOpenGroupIds?: readonly string[]
  onToggle: (lineId: string) => void
  onPatchLine: (
    lineId: string,
    patch: Partial<Pick<EstimateLine, 'quantity' | 'unitPrice' | 'coefficient' | 'comment'>>,
  ) => void
}

export function EstimateGroupedTable({
  title = 'Строки сметы',
  lead = 'Группы можно раскрывать. Итог считает domain-формула.',
  idPrefix,
  groups,
  onToggle,
  onPatchLine,
}: EstimateGroupedTableProps) {
  const [openIds, setOpenIds] = useState(() => new Set<string>())
  const titleId = `${idPrefix}-table-title`

  function isGroupOpen(groupId: string): boolean {
    return openIds.has(groupId)
  }

  function toggleGroup(groupId: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  return (
    <section className={styles.wrap} aria-labelledby={titleId}>
      <div className={styles.head}>
        <h2 className={styles.title} id={titleId}>
          {title}
        </h2>
        <p className={styles.lead}>{lead}</p>
      </div>

      <div className={styles.groups}>
        {groups.map((group) => {
          const open = isGroupOpen(group.id)
          const panelId = `${idPrefix}-group-${group.id}`
          return (
            <div key={group.id} className={styles.group}>
              <EstimateGroupHeader
                group={group}
                open={open}
                panelId={panelId}
                onToggle={() => toggleGroup(group.id)}
              />
              <div
                className={styles.scroll}
                id={panelId}
                role="region"
                aria-label={group.title}
                hidden={!open}
              >
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Вкл.</th>
                      <th scope="col">Работа</th>
                      <th scope="col">Ед.</th>
                      <th scope="col">Объём</th>
                      <th scope="col">Цена</th>
                      <th scope="col">Коэф.</th>
                      <th scope="col">Сумма</th>
                      <th scope="col">Комментарий</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.lines.map((line) => (
                      <EstimateLineRow
                        key={line.id}
                        line={line}
                        onToggle={onToggle}
                        onPatchLine={onPatchLine}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
