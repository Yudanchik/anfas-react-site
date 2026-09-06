import { applyQuantityToMatchingLines, createManualEstimateLine } from '../shared/estimate-line-helpers'
import type { EstimateLine, PlumbingWorkKind } from '../shared/estimate.types'
import { PLUMBING_SECTION_ID } from './plumbing-price.mapping'

/**
 * Быстрые действия сантехники: подставить объём/количество, не включая работы.
 * Zoned clones не трогает (правятся отдельно через zone-сценарии).
 */
export function applyPlumbingWaterPipeLength(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => (line.kind as PlumbingWorkKind) === 'water-supply' && line.unit === 'м. пог.',
    quantity,
  )
}

export function applyPlumbingSewerPipeLength(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => (line.kind as PlumbingWorkKind) === 'drainage' && line.unit === 'м. пог.',
    quantity,
  )
}

export function applyPlumbingWaterPointsCount(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) =>
      (line.priceKey === 'water-outlet' ||
        line.priceKey === 'water-outlet-fix' ||
        line.priceKey === 'water-outlet-double') &&
      (line.unit === 'шт.' || line.unit === 'комплекс'),
    quantity,
  )
}

export function applyPlumbingSewerPointsCount(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) =>
      (line.priceKey === 'drainage-outlet-fix' ||
        line.priceKey === 'drainage-elbow-d32-50' ||
        line.priceKey === 'drainage-elbow-d110' ||
        line.priceKey === 'drainage-tee-d32-50' ||
        line.priceKey === 'drainage-tee-d110') &&
      line.unit === 'шт.',
    quantity,
  )
}

export function applyPlumbingWarmFloorArea(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => (line.kind as PlumbingWorkKind) === 'underfloor' && line.unit === 'м²',
    quantity,
  )
}

export function createManualPlumbingEstimateLine(params: {
  title: string
  unit: string
  unitPrice: number
  quantity?: number
  coefficient?: number
  comment?: string
}): EstimateLine {
  return createManualEstimateLine({
    ...params,
    sectionId: PLUMBING_SECTION_ID,
    kind: 'other',
  })
}
