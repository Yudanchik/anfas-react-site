/**
 * Совместимость: предпочтительнее `getSelectedEstimateLines` / `getCombinedSelectedEstimateLines`
 * из `@/entities/estimate` (shared domain).
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

/** Обёртка только для полов — для старого `FloorEstimateSummary`. */
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
