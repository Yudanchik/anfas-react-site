import { useMemo, useState } from 'react'

import {
  getDefaultOpenFloorGroupIds,
  groupFloorEstimateLines,
  type EstimateLine,
  type FloorEstimateGroupId,
} from '@/entities/estimate'

import { FloorEstimateGroupHeader } from './FloorEstimateGroupHeader'
import { FloorEstimateLineRow } from './FloorEstimateLineRow'
import styles from './FloorEstimateTable.module.scss'

type FloorEstimateTableProps = {
  lines: readonly EstimateLine[]
  onToggle: (lineId: string) => void
  onPatchLine: (
    lineId: string,
    patch: Partial<Pick<EstimateLine, 'quantity' | 'unitPrice' | 'coefficient' | 'comment'>>,
  ) => void
}

export function FloorEstimateTable({ lines, onToggle, onPatchLine }: FloorEstimateTableProps) {
  const groups = useMemo(() => groupFloorEstimateLines(lines), [lines])
  const autoOpenIds = useMemo(() => new Set(getDefaultOpenFloorGroupIds(groups)), [groups])
  const [collapsedIds, setCollapsedIds] = useState(() => new Set<FloorEstimateGroupId>())
  const [expandedIds, setExpandedIds] = useState(() => new Set<FloorEstimateGroupId>())

  function isGroupOpen(groupId: FloorEstimateGroupId): boolean {
    if (collapsedIds.has(groupId)) return false
    if (expandedIds.has(groupId)) return true
    return autoOpenIds.has(groupId)
  }

  function toggleGroup(groupId: FloorEstimateGroupId) {
    if (isGroupOpen(groupId)) {
      setExpandedIds((prev) => {
        const next = new Set(prev)
        next.delete(groupId)
        return next
      })
      setCollapsedIds((prev) => new Set(prev).add(groupId))
      return
    }

    setCollapsedIds((prev) => {
      const next = new Set(prev)
      next.delete(groupId)
      return next
    })
    setExpandedIds((prev) => new Set(prev).add(groupId))
  }

  return (
    <section className={styles.wrap} aria-labelledby="floor-estimate-table-title">
      <div className={styles.head}>
        <h2 className={styles.title} id="floor-estimate-table-title">
          Строки сметы
        </h2>
        <p className={styles.lead}>Группы можно раскрывать. Итог считает domain-формула.</p>
      </div>

      <div className={styles.groups}>
        {groups.map((group) => {
          const open = isGroupOpen(group.id)
          const panelId = `floor-estimate-group-${group.id}`
          return (
            <div key={group.id} className={styles.group}>
              <FloorEstimateGroupHeader
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
                      <FloorEstimateLineRow
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
