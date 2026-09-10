import { calculateSectionTotal, countEnabledLines } from './calculate-section-total'
import type { EstimateSection } from './estimate.types'

/** Сумма уже округлённых построчных итогов по разделам. */
export function calculateEstimateTotal(sections: readonly EstimateSection[]): number {
  return sections.reduce((sum, section) => sum + calculateSectionTotal(section), 0)
}

export function calculateEstimateSelectedCount(sections: readonly EstimateSection[]): number {
  return sections.reduce((sum, section) => sum + countEnabledLines(section.lines), 0)
}
