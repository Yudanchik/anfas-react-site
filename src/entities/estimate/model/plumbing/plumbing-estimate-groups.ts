import { calculateLineTotal } from '../shared/calculate-line-total'
import type { EstimateLine, PlumbingWorkKind } from '../shared/estimate.types'

export type PlumbingEstimateGroupId =
  | 'demolition'
  | 'drainage'
  | 'water-supply'
  | 'connections'
  | 'underfloor'
  | 'hidden-mixer'
  | 'manifold'
  | 'installation'
  | 'finish'
  | 'check'
  | 'manual'

export type PlumbingEstimateGroup = {
  id: PlumbingEstimateGroupId
  title: string
  lines: readonly EstimateLine[]
  totalCount: number
  selectedCount: number
  totalRub: number
}

const GROUP_ORDER: readonly PlumbingEstimateGroupId[] = [
  'demolition',
  'drainage',
  'water-supply',
  'connections',
  'underfloor',
  'hidden-mixer',
  'manifold',
  'installation',
  'finish',
  'check',
  'manual',
]

const GROUP_TITLES: Record<PlumbingEstimateGroupId, string> = {
  demolition: 'Демонтаж',
  drainage: 'Канализация',
  'water-supply': 'Водоснабжение',
  connections: 'Соединения / опрессовка',
  underfloor: 'Водяной тёплый пол',
  'hidden-mixer': 'Встроенные смесители',
  manifold: 'Коллектор / учёт',
  installation: 'Инсталляция / трапы',
  finish: 'Финишная сантехника',
  check: 'Проверки / пуск',
  manual: 'Ручные строки',
}

const KIND_TO_GROUP: Record<PlumbingWorkKind, PlumbingEstimateGroupId> = {
  demolition: 'demolition',
  drainage: 'drainage',
  'water-supply': 'water-supply',
  connections: 'connections',
  underfloor: 'underfloor',
  'hidden-mixer': 'hidden-mixer',
  manifold: 'manifold',
  installation: 'installation',
  finish: 'finish',
  check: 'check',
  other: 'manual',
}

export function resolvePlumbingEstimateGroupId(
  line: Pick<EstimateLine, 'kind' | 'source'>,
): PlumbingEstimateGroupId {
  if (line.source === 'manual') return 'manual'
  if (Object.prototype.hasOwnProperty.call(KIND_TO_GROUP, line.kind)) {
    return KIND_TO_GROUP[line.kind as PlumbingWorkKind]
  }
  return 'manual'
}

export function getPlumbingEstimateGroupTitle(groupId: PlumbingEstimateGroupId): string {
  return GROUP_TITLES[groupId]
}

export function groupPlumbingEstimateLines(
  lines: readonly EstimateLine[],
): PlumbingEstimateGroup[] {
  const buckets = new Map<PlumbingEstimateGroupId, EstimateLine[]>()
  for (const id of GROUP_ORDER) buckets.set(id, [])

  for (const line of lines) {
    const groupId = resolvePlumbingEstimateGroupId(line)
    buckets.get(groupId)?.push(line)
  }

  return GROUP_ORDER.map((id) => {
    const groupLines = buckets.get(id) ?? []
    const selected = groupLines.filter((line) => line.enabled)
    return {
      id,
      title: GROUP_TITLES[id],
      lines: groupLines,
      totalCount: groupLines.length,
      selectedCount: selected.length,
      totalRub: selected.reduce((sum, line) => sum + calculateLineTotal(line), 0),
    }
  }).filter((group) => group.totalCount > 0)
}

/**
 * Какие группы аккордеона сантехники открыть по умолчанию.
 * Всегда свёрнуты, пока пользователь сам не раскроет в сессии.
 */
export function getDefaultOpenPlumbingGroupIds(
  _groups: readonly PlumbingEstimateGroup[],
): PlumbingEstimateGroupId[] {
  return []
}
