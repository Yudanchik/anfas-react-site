import { calculateEstimateSelectedCount, calculateEstimateTotal } from './calculate-estimate-total'
import { calculateSectionTotal } from './calculate-section-total'
import { buildFloorEstimateLines, type BuildFloorEstimateLinesOptions } from './build-floor-estimate-lines'
import type { FloorEstimateInput, FloorEstimateResult } from './estimate.types'
import { FLOOR_SECTION_ID, FLOOR_SECTION_TITLE } from './floor-price.mapping'
import { getFloorRecommendation } from './get-floor-recommendation'

export function buildFloorEstimate(
  input: FloorEstimateInput,
  options?: BuildFloorEstimateLinesOptions,
): FloorEstimateResult {
  const lines = buildFloorEstimateLines(input, options)
  const section = {
    id: FLOOR_SECTION_ID,
    title: FLOOR_SECTION_TITLE,
    lines,
  }

  return {
    section,
    recommendation: getFloorRecommendation(input.avgDeltaMm),
    selectedCount: calculateEstimateSelectedCount([section]),
    totalRub: calculateSectionTotal(section),
    materialsExcluded: true,
  }
}

export function calculateFloorEstimateTotalFromResult(result: FloorEstimateResult): number {
  return calculateEstimateTotal([result.section])
}
