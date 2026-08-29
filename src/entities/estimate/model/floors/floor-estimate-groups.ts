import { calculateLineTotal } from '../shared/calculate-line-total'
import type { EstimateLine, FloorWorkKind } from '../shared/estimate.types'

export type FloorEstimateGroupId =
  | 'demolition'
  | 'base-prep'
  | 'screed'
  | 'self-leveling'
  | 'waterproofing'
  | 'finish-floor'
  | 'finish-plinth'
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
  'finish-floor',
  'finish-plinth',
  'waste',
  'manual',
]

const GROUP_TITLES: Record<FloorEstimateGroupId, string> = {
  demolition: 'Демонтаж',
  'base-prep': 'Подготовка основания',
  screed: 'Стяжка',
  'self-leveling': 'Наливной пол / ровнитель',
  waterproofing: 'Гидроизоляция',
  'finish-floor': 'Чистовое покрытие',
  'finish-plinth': 'Плинтус',
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
  'finish-floor': 'finish-floor',
  'finish-plinth': 'finish-plinth',
  waste: 'waste',
  'other-rough': 'manual',
}

/**
 * Куда положить строку в аккордеоне UI.
 * Ручные строки всегда в `manual`; zoned clones остаются в группе своего `kind`.
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

/** Группы в порядке UI: счётчики выбранного и округлённые итоги по `calculateLineTotal`. */
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
 * Какие группы аккордеона открыть по умолчанию.
 * Всегда свёрнуты, пока пользователь сам не раскроет в сессии.
 */
export function getDefaultOpenFloorGroupIds(
  _groups: readonly FloorEstimateGroup[],
): FloorEstimateGroupId[] {
  return []
}
