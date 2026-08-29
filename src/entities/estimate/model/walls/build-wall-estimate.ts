import { calculateEstimateSelectedCount } from '../shared/calculate-estimate-total'
import { calculateSectionTotal } from '../shared/calculate-section-total'
import {
  buildWallEstimateLines,
  type BuildWallEstimateLinesOptions,
} from './build-wall-estimate-lines'
import type { WallEstimateInput, WallEstimateResult } from '../shared/estimate.types'
import { WALL_SECTION_ID, WALL_SECTION_TITLE } from './wall-price.mapping'

export function buildWallEstimate(
  input: WallEstimateInput,
  options?: BuildWallEstimateLinesOptions,
): WallEstimateResult {
  const lines = buildWallEstimateLines(input, options)
  const section = {
    id: WALL_SECTION_ID,
    title: WALL_SECTION_TITLE,
    lines,
  }

  return {
    section,
    selectedCount: calculateEstimateSelectedCount([section]),
    totalRub: calculateSectionTotal(section),
    materialsExcluded: true,
  }
}
