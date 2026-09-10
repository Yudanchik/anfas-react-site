import { calculateLineTotal } from '../shared/calculate-line-total'
import type { ElectricWorkKind, EstimateLine } from '../shared/estimate.types'

export type ElectricEstimateGroupId =
  | 'demolition'
  | 'layout'
  | 'chase'
  | 'cable'
  | 'conduit'
  | 'boxes'
  | 'switching'
  | 'panel'
  | 'protection'
  | 'earthing'
  | 'underfloor'
  | 'finish-outlet'
  | 'finish-light'
  | 'low-current'
  | 'appliance'
  | 'check'
  | 'manual'

export type ElectricEstimateGroup = {
  id: ElectricEstimateGroupId
  title: string
  lines: readonly EstimateLine[]
  totalCount: number
  selectedCount: number
  totalRub: number
}

const GROUP_ORDER: readonly ElectricEstimateGroupId[] = [
  'demolition',
  'layout',
  'chase',
  'cable',
  'conduit',
  'boxes',
  'switching',
  'panel',
  'protection',
  'earthing',
  'underfloor',
  'finish-outlet',
  'finish-light',
  'low-current',
  'appliance',
  'check',
  'manual',
]

const GROUP_TITLES: Record<ElectricEstimateGroupId, string> = {
  demolition: 'Демонтаж',
  layout: 'Разметка / обследование',
  chase: 'Штробление / отверстия / ниши',
  cable: 'Прокладка кабеля',
  conduit: 'Трубы / гофра / короба',
  boxes: 'Подрозетники / коробки',
  switching: 'Коммутация',
  panel: 'Электрощит',
  protection: 'Защита / автоматы / счётчики',
  earthing: 'Заземление / ДСУП',
  underfloor: 'Тёплый пол (электрический)',
  'finish-outlet': 'Розетки / выключатели',
  'finish-light': 'Освещение',
  'low-current': 'Слаботочные системы',
  appliance: 'Подключение оборудования',
  check: 'Проверки / защита кабеля',
  manual: 'Ручные строки',
}

const KIND_TO_GROUP: Record<ElectricWorkKind, ElectricEstimateGroupId> = {
  demolition: 'demolition',
  layout: 'layout',
  chase: 'chase',
  cable: 'cable',
  conduit: 'conduit',
  boxes: 'boxes',
  switching: 'switching',
  panel: 'panel',
  protection: 'protection',
  earthing: 'earthing',
  underfloor: 'underfloor',
  'finish-outlet': 'finish-outlet',
  'finish-light': 'finish-light',
  'low-current': 'low-current',
  appliance: 'appliance',
  check: 'check',
  other: 'manual',
}

export function resolveElectricEstimateGroupId(
  line: Pick<EstimateLine, 'kind' | 'source'>,
): ElectricEstimateGroupId {
  if (line.source === 'manual') return 'manual'
  if (Object.prototype.hasOwnProperty.call(KIND_TO_GROUP, line.kind)) {
    return KIND_TO_GROUP[line.kind as ElectricWorkKind]
  }
  return 'manual'
}

export function getElectricEstimateGroupTitle(groupId: ElectricEstimateGroupId): string {
  return GROUP_TITLES[groupId]
}

export function groupElectricEstimateLines(
  lines: readonly EstimateLine[],
): ElectricEstimateGroup[] {
  const buckets = new Map<ElectricEstimateGroupId, EstimateLine[]>()
  for (const id of GROUP_ORDER) buckets.set(id, [])

  for (const line of lines) {
    const groupId = resolveElectricEstimateGroupId(line)
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
 * Какие группы аккордеона электрики открыть по умолчанию.
 * Всегда свёрнуты, пока пользователь сам не раскроет в сессии.
 */
export function getDefaultOpenElectricGroupIds(
  _groups: readonly ElectricEstimateGroup[],
): ElectricEstimateGroupId[] {
  return []
}
