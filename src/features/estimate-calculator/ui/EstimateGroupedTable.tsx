import { useMemo, useState } from 'react'

import type { EstimateLine } from '@/entities/estimate'

import { filterEstimateGroupsByQuery } from '../model/filter-estimate-groups'
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
  /** Без собственной рамки/заголовка — внутри родительского блока «Строки сметы». */
  embedded?: boolean
  groups: readonly EstimateGroupedTableGroup[]
  /** @deprecated Игнорируется — группы свёрнуты, пока пользователь сам не откроет. */
  defaultOpenGroupIds?: readonly string[]
  onToggle: (lineId: string) => void
  onPatchLine: (
    lineId: string,
    patch: Partial<Pick<EstimateLine, 'quantity' | 'unitPrice' | 'coefficient' | 'comment'>>,
  ) => void
  onRemoveManualLine?: (lineId: string) => void
}

export function EstimateGroupedTable({
  title = 'Строки сметы',
  lead = 'Группы можно раскрывать. Итог считается по выбранным строкам.',
  idPrefix,
  embedded = false,
  groups,
  onToggle,
  onPatchLine,
  onRemoveManualLine,
}: EstimateGroupedTableProps) {
  const [openIds, setOpenIds] = useState(() => new Set<string>())
  const [query, setQuery] = useState('')
  const titleId = `${idPrefix}-table-title`
  const searchId = `${idPrefix}-lines-search`

  const filteredGroups = useMemo(
    () => filterEstimateGroupsByQuery(groups, query),
    [groups, query],
  )
  const isSearching = query.trim().length > 0

  function isGroupOpen(groupId: string): boolean {
    if (isSearching) return true
    return openIds.has(groupId)
  }

  function toggleGroup(groupId: string) {
    if (isSearching) return
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  return (
    <section
      className={embedded ? styles.embedded : styles.wrap}
      aria-labelledby={embedded ? undefined : titleId}
    >
      {embedded ? null : (
        <div className={styles.head}>
          <h2 className={styles.title} id={titleId}>
            {title}
          </h2>
          <p className={styles.lead}>{lead}</p>
        </div>
      )}

      <div className={styles.searchRow}>
        <label className={styles.searchLabel} htmlFor={searchId}>
          Поиск
        </label>
        <div className={styles.searchField} data-has-clear={isSearching ? 'true' : 'false'}>
          <input
            id={searchId}
            className={styles.searchInput}
            type="text"
            value={query}
            placeholder="Найти работу"
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
          />
          {isSearching ? (
            <button
              type="button"
              className={styles.searchClear}
              aria-label="Очистить поиск"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setQuery('')}
            >
              <span aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {isSearching && filteredGroups.length === 0 ? (
        <p className={styles.searchEmpty} role="status">
          Работы не найдены. Попробуйте изменить запрос.
        </p>
      ) : (
        <div className={styles.groups}>
          {filteredGroups.map((group) => {
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
                        <th scope="col">
                          <span className={styles.srOnly}>Действия</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.lines.map((line) => (
                        <EstimateLineRow
                          key={line.id}
                          line={line}
                          onToggle={onToggle}
                          onPatchLine={onPatchLine}
                          onRemoveManualLine={onRemoveManualLine}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
