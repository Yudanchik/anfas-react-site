import { calculateLineTotal } from '../shared/calculate-line-total'
import type { CeilingWorkKind, EstimateLine } from '../shared/estimate.types'

export type CeilingEstimateGroupId =
  | 'demolition'
  | 'prep'
  | 'primer'
  | 'plaster'
  | 'putty'
  | 'reinforce'
  | 'finish'
  | 'manual'

export type CeilingEstimateGroup = {
  id: CeilingEstimateGroupId
  title: string
  lines: readonly EstimateLine[]
  totalCount: number
  selectedCount: number
  totalRub: number
}

const GROUP_ORDER: readonly CeilingEstimateGroupId[] = [
  'demolition',
  'prep',
  'primer',
  'plaster',
  'putty',
  'reinforce',
  'finish',
  'manual',
]

const GROUP_TITLES: Record<CeilingEstimateGroupId, string> = {
  demolition: 'Демонтаж',
  prep: 'Подготовка основания',
  primer: 'Грунтование',
  plaster: 'Штукатурка',
  putty: 'Шпаклёвка / шлифовка',
  reinforce: 'Армирование / холст',
  finish: 'Финиш (покраска)',
  manual: 'Ручные строки',
}

const KIND_TO_GROUP: Record<CeilingWorkKind, CeilingEstimateGroupId> = {
  demolition: 'demolition',
  prep: 'prep',
  primer: 'primer',
  plaster: 'plaster',
  putty: 'putty',
  reinforce: 'reinforce',
  'finish-paint': 'finish',
  other: 'manual',
}

export function resolveCeilingEstimateGroupId(
  line: Pick<EstimateLine, 'kind' | 'source'>,
): CeilingEstimateGroupId {
  if (line.source === 'manual') return 'manual'
  if (Object.prototype.hasOwnProperty.call(KIND_TO_GROUP, line.kind)) {
    return KIND_TO_GROUP[line.kind as CeilingWorkKind]
  }
  return 'manual'
}

export function getCeilingEstimateGroupTitle(groupId: CeilingEstimateGroupId): string {
  return GROUP_TITLES[groupId]
}

export function groupCeilingEstimateLines(
  lines: readonly EstimateLine[],
): CeilingEstimateGroup[] {
  const buckets = new Map<CeilingEstimateGroupId, EstimateLine[]>()
  for (const id of GROUP_ORDER) buckets.set(id, [])

  for (const line of lines) {
    const groupId = resolveCeilingEstimateGroupId(line)
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
 * Какие группы аккордеона потолков открыть по умолчанию.
 * Всегда свёрнуты, пока пользователь сам не раскроет в сессии.
 */
export function getDefaultOpenCeilingGroupIds(
  _groups: readonly CeilingEstimateGroup[],
): CeilingEstimateGroupId[] {
  return []
}
