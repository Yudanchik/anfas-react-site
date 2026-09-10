import { calculateEstimateSelectedCount } from '../shared/calculate-estimate-total'
import { calculateSectionTotal } from '../shared/calculate-section-total'
import {
  buildElectricEstimateLines,
  type BuildElectricEstimateLinesOptions,
} from './build-electric-estimate-lines'
import type { ElectricEstimateInput, ElectricEstimateResult } from '../shared/estimate.types'
import { ELECTRIC_SECTION_ID, ELECTRIC_SECTION_TITLE } from './electric-price.mapping'

/** Сводка раздела «Электрика»: строки и итог; `materialsExcluded: true`. */
export function buildElectricEstimate(
  input: ElectricEstimateInput,
  options?: BuildElectricEstimateLinesOptions,
): ElectricEstimateResult {
  const lines = buildElectricEstimateLines(input, options)
  const section = {
    id: ELECTRIC_SECTION_ID,
    title: ELECTRIC_SECTION_TITLE,
    lines,
  }

  return {
    section,
    selectedCount: calculateEstimateSelectedCount([section]),
    totalRub: calculateSectionTotal(section),
    materialsExcluded: true,
  }
}
