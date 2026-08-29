import { calculateLineTotal } from './calculate-line-total'
import type { EstimateLine, EstimateSection } from './estimate.types'

export function calculateSectionTotal(section: Pick<EstimateSection, 'lines'>): number {
  return section.lines.reduce((sum, line) => sum + calculateLineTotal(line), 0)
}

export function countEnabledLines(lines: readonly EstimateLine[]): number {
  return lines.filter((line) => line.enabled).length
}
