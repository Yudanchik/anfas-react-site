import { calculateLineTotal } from '@/entities/estimate'
import type { EstimateLine } from '@/entities/estimate'

export type FilterableEstimateGroup<TLine extends EstimateLine = EstimateLine> = {
  id: string
  title: string
  lines: readonly TLine[]
  selectedCount: number
  totalCount: number
  totalRub: number
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase()
}

function lineMatchesQuery(line: EstimateLine, groupTitle: string, query: string): boolean {
  if (!query) return true
  const haystack = [line.title, groupTitle, line.zoneName, line.comment]
    .filter(Boolean)
    .join('\n')
    .toLowerCase()
  return haystack.includes(query)
}

/**
 * Фильтрует группы строк для UI-поиска.
 * Не мутирует исходные строки и не меняет enabled/qty/price — только visibility.
 */
export function filterEstimateGroupsByQuery<T extends FilterableEstimateGroup>(
  groups: readonly T[],
  query: string,
): T[] {
  const normalized = normalizeQuery(query)
  if (!normalized) return [...groups]

  const next: T[] = []
  for (const group of groups) {
    const lines = group.lines.filter((line) =>
      lineMatchesQuery(line, group.title, normalized),
    )
    if (lines.length === 0) continue

    const selectedCount = lines.reduce((sum, line) => sum + (line.enabled ? 1 : 0), 0)
    const totalRub = lines.reduce(
      (sum, line) => sum + (line.enabled ? calculateLineTotal(line) : 0),
      0,
    )

    next.push({
      ...group,
      lines,
      selectedCount,
      totalCount: lines.length,
      totalRub,
    })
  }
  return next
}
