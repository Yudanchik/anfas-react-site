import { calculateEstimateSelectedCount } from '../shared/calculate-estimate-total'
import { calculateSectionTotal } from '../shared/calculate-section-total'
import {
  buildCeilingEstimateLines,
  type BuildCeilingEstimateLinesOptions,
} from './build-ceiling-estimate-lines'
import type { CeilingEstimateInput, CeilingEstimateResult } from '../shared/estimate.types'
import { CEILING_SECTION_ID, CEILING_SECTION_TITLE } from './ceiling-price.mapping'

/** Сводка раздела «Потолки»: строки и итог; `materialsExcluded: true`. */
export function buildCeilingEstimate(
  input: CeilingEstimateInput,
  options?: BuildCeilingEstimateLinesOptions,
): CeilingEstimateResult {
  const lines = buildCeilingEstimateLines(input, options)
  const section = {
    id: CEILING_SECTION_ID,
    title: CEILING_SECTION_TITLE,
    lines,
  }

  return {
    section,
    selectedCount: calculateEstimateSelectedCount([section]),
    totalRub: calculateSectionTotal(section),
    materialsExcluded: true,
  }
}
