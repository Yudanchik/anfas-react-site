import { calculateEstimateSelectedCount } from '../shared/calculate-estimate-total'
import { calculateSectionTotal } from '../shared/calculate-section-total'
import {
  buildPlumbingEstimateLines,
  type BuildPlumbingEstimateLinesOptions,
} from './build-plumbing-estimate-lines'
import type { PlumbingEstimateInput, PlumbingEstimateResult } from '../shared/estimate.types'
import { PLUMBING_SECTION_ID, PLUMBING_SECTION_TITLE } from './plumbing-price.mapping'

/** Сводка раздела «Сантехника»: строки и итог; `materialsExcluded: true`. */
export function buildPlumbingEstimate(
  input: PlumbingEstimateInput,
  options?: BuildPlumbingEstimateLinesOptions,
): PlumbingEstimateResult {
  const lines = buildPlumbingEstimateLines(input, options)
  const section = {
    id: PLUMBING_SECTION_ID,
    title: PLUMBING_SECTION_TITLE,
    lines,
  }

  return {
    section,
    selectedCount: calculateEstimateSelectedCount([section]),
    totalRub: calculateSectionTotal(section),
    materialsExcluded: true,
  }
}
