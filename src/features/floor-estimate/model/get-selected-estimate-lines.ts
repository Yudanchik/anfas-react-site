/**
 * Compatibility shim: prefer getSelectedEstimateLines / getCombinedSelectedEstimateLines
 * from `@/entities/estimate` (shared domain).
 */
export {
  getCombinedSelectedEstimateLines,
  getSelectedEstimateLines,
  type EstimateSectionSelection,
  type SelectedEstimateLineView,
} from '@/entities/estimate'

import {
  getFloorEstimateGroupTitle,
  getSelectedEstimateLines as getSelectedForSection,
  resolveFloorEstimateGroupId,
  type EstimateLine,
  type SelectedEstimateLineView,
} from '@/entities/estimate'

/** Floors-only helper kept for existing FloorEstimateSummary. */
export function getSelectedFloorEstimateLines(
  lines: readonly EstimateLine[],
): SelectedEstimateLineView[] {
  return getSelectedForSection({
    sectionId: 'floors',
    sectionTitle: 'Полы',
    lines,
    resolveGroupTitle: (line) => getFloorEstimateGroupTitle(resolveFloorEstimateGroupId(line)),
  })
}
