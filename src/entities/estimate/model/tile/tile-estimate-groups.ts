import { calculateLineTotal } from '../shared/calculate-line-total'
import type { EstimateLine, TileWorkKind } from '../shared/estimate.types'

export type TileEstimateGroupId =
  | 'demolition'
  | 'prep'
  | 'cladding'
  | 'cutting'
  | 'grout'
  | 'seal'
  | 'repair'
  | 'accessory'
  | 'manual'

export type TileEstimateGroup = {
  id: TileEstimateGroupId
  title: string
  lines: readonly EstimateLine[]
  totalCount: number
  selectedCount: number
  totalRub: number
}

const GROUP_ORDER: readonly TileEstimateGroupId[] = [
  'demolition',
  'prep',
  'cladding',
  'cutting',
  'grout',
  'seal',
  'repair',
  'accessory',
  'manual',
]

const GROUP_TITLES: Record<TileEstimateGroupId, string> = {
  demolition: 'Демонтаж',
  prep: 'Подготовка / раскладка',
  cladding: 'Облицовка',
  cutting: 'Рез / отверстия / углы',
  grout: 'Затирка / очистка',
  seal: 'Герметизация примыканий',
  repair: 'Ремонт / замена',
  accessory: 'Плинтус / профиль / люки',
  manual: 'Ручные строки',
}

const KIND_TO_GROUP: Record<TileWorkKind, TileEstimateGroupId> = {
  demolition: 'demolition',
  prep: 'prep',
  cladding: 'cladding',
  cutting: 'cutting',
  grout: 'grout',
  seal: 'seal',
  repair: 'repair',
  accessory: 'accessory',
  other: 'manual',
}

export function resolveTileEstimateGroupId(
  line: Pick<EstimateLine, 'kind' | 'source'>,
): TileEstimateGroupId {
  if (line.source === 'manual') return 'manual'
  if (Object.prototype.hasOwnProperty.call(KIND_TO_GROUP, line.kind)) {
    return KIND_TO_GROUP[line.kind as TileWorkKind]
  }
  return 'manual'
}

export function getTileEstimateGroupTitle(groupId: TileEstimateGroupId): string {
  return GROUP_TITLES[groupId]
}

export function groupTileEstimateLines(lines: readonly EstimateLine[]): TileEstimateGroup[] {
  const buckets = new Map<TileEstimateGroupId, EstimateLine[]>()
  for (const id of GROUP_ORDER) buckets.set(id, [])

  for (const line of lines) {
    const groupId = resolveTileEstimateGroupId(line)
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
 * Какие группы аккордеона плитки открыть по умолчанию.
 * Всегда свёрнуты, пока пользователь сам не раскроет в сессии.
 */
export function getDefaultOpenTileGroupIds(
  _groups: readonly TileEstimateGroup[],
): TileEstimateGroupId[] {
  return []
}
