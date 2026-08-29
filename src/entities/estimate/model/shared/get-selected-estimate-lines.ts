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
  /** Sum of already line-rounded totals (same source as calculateLineTotal). */
  subtotalRub: number
}

/**
 * Known section labels for future sections.
 * Prefer `sectionTitle` from the selection payload when provided.
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
 * Presentational filter for final estimate blocks.
 * Uses calculateLineTotal — does not redefine formulas.
 */
export function getSelectedEstimateLines(
  section: EstimateSectionSelection,
): SelectedEstimateLineView[] {
  const selected: SelectedEstimateLineView[] = []
  const sectionTitle = resolveEstimateSectionTitle(section.sectionId, section.sectionTitle)

  for (const line of section.lines) {
    if (!line.enabled) continue
    const lineTotal = calculateLineTotal(line)
    if (lineTotal <= 0 && line.source !== 'manual') continue

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
 * Groups selected lines by section for the combined summary.
 * Empty sections are omitted. Order follows the input `sections` array
 * so new sections (ceilings, plumbing, …) appear by registration order.
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

/** Grand total from section groups (sum of section subtots = sum of rounded line totals). */
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
