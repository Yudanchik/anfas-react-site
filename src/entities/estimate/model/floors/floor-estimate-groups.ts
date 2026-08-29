import { calculateLineTotal } from '../shared/calculate-line-total'
import type { EstimateLine, FloorWorkKind } from '../shared/estimate.types'

export type FloorEstimateGroupId =
  | 'demolition'
  | 'base-prep'
  | 'screed'
  | 'self-leveling'
  | 'waterproofing'
  | 'waste'
  | 'manual'

export type FloorEstimateGroup = {
  id: FloorEstimateGroupId
  title: string
  lines: readonly EstimateLine[]
  totalCount: number
  selectedCount: number
  totalRub: number
}

const GROUP_ORDER: readonly FloorEstimateGroupId[] = [
  'demolition',
  'base-prep',
  'screed',
  'self-leveling',
  'waterproofing',
  'waste',
  'manual',
]

const GROUP_TITLES: Record<FloorEstimateGroupId, string> = {
  demolition: 'Демонтаж',
  'base-prep': 'Подготовка основания',
  screed: 'Стяжка',
  'self-leveling': 'Наливной пол / ровнитель',
  waterproofing: 'Гидроизоляция',
  waste: 'Вывоз мусора',
  manual: 'Ручные строки',
}

const KIND_TO_GROUP: Record<FloorWorkKind, FloorEstimateGroupId> = {
  demolition: 'demolition',
  'base-prep': 'base-prep',
  primer: 'base-prep',
  'screed-semidry': 'screed',
  'screed-wet': 'screed',
  'self-leveling': 'self-leveling',
  waterproofing: 'waterproofing',
  waste: 'waste',
  'other-rough': 'manual',
}

/**
 * Maps an estimate line to a UI accordion group.
 * Manual rows always land in `manual`, regardless of kind.
 */
export function resolveFloorEstimateGroupId(
  line: Pick<EstimateLine, 'kind' | 'source'>,
): FloorEstimateGroupId {
  if (line.source === 'manual') return 'manual'
  if (Object.prototype.hasOwnProperty.call(KIND_TO_GROUP, line.kind)) {
    return KIND_TO_GROUP[line.kind as FloorWorkKind]
  }
  return 'manual'
}

export function getFloorEstimateGroupTitle(groupId: FloorEstimateGroupId): string {
  return GROUP_TITLES[groupId]
}

/** Builds ordered groups with selected counts and line-rounded totals. */
export function groupFloorEstimateLines(lines: readonly EstimateLine[]): FloorEstimateGroup[] {
  const buckets = new Map<FloorEstimateGroupId, EstimateLine[]>()
  for (const id of GROUP_ORDER) buckets.set(id, [])

  for (const line of lines) {
    const groupId = resolveFloorEstimateGroupId(line)
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
 * Default open accordion ids:
 * - any group with selected lines;
 * - if none selected → Demolition + Screed (when present).
 */
export function getDefaultOpenFloorGroupIds(
  groups: readonly FloorEstimateGroup[],
): FloorEstimateGroupId[] {
  const selected = groups.filter((group) => group.selectedCount > 0).map((group) => group.id)
  if (selected.length > 0) return selected

  const fallback: FloorEstimateGroupId[] = []
  if (groups.some((group) => group.id === 'demolition')) fallback.push('demolition')
  if (groups.some((group) => group.id === 'screed')) fallback.push('screed')
  if (fallback.length > 0) return fallback
  return groups[0] ? [groups[0].id] : []
}
