import { applyQuantityToMatchingLines } from '../shared/estimate-line-helpers'
import type { EstimateLine, EstimateWorkKind, FloorWorkKind } from '../shared/estimate.types'

export {
  applyQuantityToMatchingLines,
  createManualEstimateLine,
  updateEstimateLine,
} from '../shared/estimate-line-helpers'

/** Подставляет площадь во все работы в м², кроме вывоза мусора (его объём — вручную). */
export function applyTotalAreaToSquareMeterWorks(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => line.unit === 'м²' && line.kind !== 'waste' && line.source !== 'manual',
    quantity,
  )
}

export function applyDemolitionAreaToDemolitionWorks(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => line.kind === 'demolition' && line.unit === 'м²',
    quantity,
  )
}

export function applyWetAreaToWaterproofing(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => line.kind === 'waterproofing' && line.unit === 'м²',
    quantity,
  )
}

export function applyScreedAreaToScreedWorks(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  const screedKinds: readonly FloorWorkKind[] = [
    'base-prep',
    'primer',
    'screed-semidry',
    'screed-wet',
    'self-leveling',
  ]
  return applyQuantityToMatchingLines(
    lines,
    (line) =>
      (screedKinds as readonly EstimateWorkKind[]).includes(line.kind) && line.unit === 'м²',
    quantity,
  )
}
