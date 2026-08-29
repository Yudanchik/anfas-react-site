import { calculateLineTotal } from './calculate-line-total'
import type { EstimateLine } from './estimate.types'

export type SelectedEstimateLineView = {
  line: EstimateLine
  sectionId: string
  sectionTitle: string
  groupTitle: string
  lineTotal: number
}

export type EstimateSectionSelection = {
  sectionId: string
  sectionTitle: string
  lines: readonly EstimateLine[]
  resolveGroupTitle: (line: EstimateLine) => string
}

export type SelectedEstimateSectionGroup = {
  sectionId: string
  sectionTitle: string
  items: readonly SelectedEstimateLineView[]
  selectedCount: number
  /** Сумма уже округлённых построчных итогов (тот же источник, что `calculateLineTotal`). */
  subtotalRub: number
}

/**
 * Подписи разделов на будущее. Если в payload уже есть `sectionTitle` — предпочитаем его.
 */
export const ESTIMATE_SECTION_LABELS: Readonly<Record<string, string>> = {
  floors: 'Полы',
  walls: 'Стены',
  ceilings: 'Потолки',
  plumbing: 'Сантехника',
  electrics: 'Электрика',
  tile: 'Плитка',
  other: 'Прочее',
}

export function resolveEstimateSectionTitle(sectionId: string, fallback?: string): string {
  if (fallback?.trim()) return fallback.trim()
  return ESTIMATE_SECTION_LABELS[sectionId] ?? sectionId
}

/**
 * Выбранные строки для итоговой сметы (включённые).
 * Считает через `calculateLineTotal`, формулы не дублирует.
 * Строки без зоны — обычные общие работы раздела.
 */
export function getSelectedEstimateLines(
  section: EstimateSectionSelection,
): SelectedEstimateLineView[] {
  const selected: SelectedEstimateLineView[] = []
  const sectionTitle = resolveEstimateSectionTitle(section.sectionId, section.sectionTitle)

  for (const line of section.lines) {
    if (!line.enabled) continue
    const lineTotal = calculateLineTotal(line)
    if (lineTotal <= 0 && line.source !== 'manual' && !line.zoneName) continue

    selected.push({
      line,
      sectionId: section.sectionId,
      sectionTitle,
      groupTitle: section.resolveGroupTitle(line),
      lineTotal,
    })
  }

  return selected
}

export function getCombinedSelectedEstimateLines(
  sections: readonly EstimateSectionSelection[],
): SelectedEstimateLineView[] {
  return sections.flatMap((section) => getSelectedEstimateLines(section))
}

/**
 * Группирует выбранные строки по разделам для сводной сметы.
 * Пустые разделы пропускает; порядок = порядок входного массива `sections`.
 */
export function getSelectedEstimateSections(
  sections: readonly EstimateSectionSelection[],
): SelectedEstimateSectionGroup[] {
  const groups: SelectedEstimateSectionGroup[] = []

  for (const section of sections) {
    const items = getSelectedEstimateLines(section)
    if (items.length === 0) continue

    groups.push({
      sectionId: section.sectionId,
      sectionTitle: resolveEstimateSectionTitle(section.sectionId, section.sectionTitle),
      items,
      selectedCount: items.length,
      subtotalRub: items.reduce((sum, item) => sum + item.lineTotal, 0),
    })
  }

  return groups
}

/** Общий итог по группам разделов (= сумма округлённых построчных итогов). */
export function calculateSelectedSectionsGrandTotal(
  groups: readonly SelectedEstimateSectionGroup[],
): number {
  return groups.reduce((sum, group) => sum + group.subtotalRub, 0)
}

export function countSelectedSectionRows(
  groups: readonly SelectedEstimateSectionGroup[],
): number {
  return groups.reduce((sum, group) => sum + group.selectedCount, 0)
}
