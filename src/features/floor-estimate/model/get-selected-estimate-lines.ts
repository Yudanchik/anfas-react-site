import {
  calculateLineTotal,
  getFloorEstimateGroupTitle,
  resolveFloorEstimateGroupId,
  type EstimateLine,
} from '@/entities/estimate'

export type SelectedEstimateLineView = {
  line: EstimateLine
  groupTitle: string
  lineTotal: number
}

/**
 * Presentational filter for the final estimate block.
 * Uses existing calculateLineTotal — does not redefine formulas.
 * Includes enabled lines with total > 0, plus any enabled manual rows.
 */
export function getSelectedEstimateLines(
  lines: readonly EstimateLine[],
): SelectedEstimateLineView[] {
  const selected: SelectedEstimateLineView[] = []

  for (const line of lines) {
    if (!line.enabled) continue
    const lineTotal = calculateLineTotal(line)
    if (lineTotal <= 0 && line.source !== 'manual') continue

    selected.push({
      line,
      groupTitle: getFloorEstimateGroupTitle(resolveFloorEstimateGroupId(line)),
      lineTotal,
    })
  }

  return selected
}
