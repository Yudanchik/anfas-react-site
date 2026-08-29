import { calculateLineTotal } from '../shared/calculate-line-total'
import type { EstimateLine, WallWorkKind } from '../shared/estimate.types'

export type WallEstimateGroupId =
  | 'demolition'
  | 'prep'
  | 'primer'
  | 'plaster'
  | 'putty'
  | 'reinforce'
  | 'slopes'
  | 'finish'
  | 'manual'

export type WallEstimateGroup = {
  id: WallEstimateGroupId
  title: string
  lines: readonly EstimateLine[]
  totalCount: number
  selectedCount: number
  totalRub: number
}

const GROUP_ORDER: readonly WallEstimateGroupId[] = [
  'demolition',
  'prep',
  'primer',
  'plaster',
  'putty',
  'reinforce',
  'slopes',
  'finish',
  'manual',
]

const GROUP_TITLES: Record<WallEstimateGroupId, string> = {
  demolition: 'Демонтаж',
  prep: 'Подготовка основания',
  primer: 'Грунтование',
  plaster: 'Штукатурка',
  putty: 'Шпаклёвка / шлифовка',
  reinforce: 'Армирование / холст',
  slopes: 'Откосы',
  finish: 'Финиш (покраска / обои)',
  manual: 'Ручные строки',
}

const KIND_TO_GROUP: Record<WallWorkKind, WallEstimateGroupId> = {
  demolition: 'demolition',
  prep: 'prep',
  primer: 'primer',
  'plaster-gypsum': 'plaster',
  'plaster-cement': 'plaster',
  putty: 'putty',
  reinforce: 'reinforce',
  slopes: 'slopes',
  'finish-paint': 'finish',
  'finish-wallpaper': 'finish',
  other: 'manual',
}

export function resolveWallEstimateGroupId(
  line: Pick<EstimateLine, 'kind' | 'source'>,
): WallEstimateGroupId {
  if (line.source === 'manual') return 'manual'
  if (Object.prototype.hasOwnProperty.call(KIND_TO_GROUP, line.kind)) {
    return KIND_TO_GROUP[line.kind as WallWorkKind]
  }
  return 'manual'
}

export function getWallEstimateGroupTitle(groupId: WallEstimateGroupId): string {
  return GROUP_TITLES[groupId]
}

export function groupWallEstimateLines(lines: readonly EstimateLine[]): WallEstimateGroup[] {
  const buckets = new Map<WallEstimateGroupId, EstimateLine[]>()
  for (const id of GROUP_ORDER) buckets.set(id, [])

  for (const line of lines) {
    const groupId = resolveWallEstimateGroupId(line)
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
 * Какие группы аккордеона стен открыть по умолчанию.
 * Всегда свёрнуты, пока пользователь сам не раскроет в сессии.
 */
export function getDefaultOpenWallGroupIds(
  _groups: readonly WallEstimateGroup[],
): WallEstimateGroupId[] {
  return []
}
