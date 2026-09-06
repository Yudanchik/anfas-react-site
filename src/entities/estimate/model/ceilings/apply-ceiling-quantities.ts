import { applyQuantityToMatchingLines, createManualEstimateLine } from '../shared/estimate-line-helpers'
import type { CeilingWorkKind, EstimateLine } from '../shared/estimate.types'
import { CEILING_SECTION_ID } from './ceiling-price.mapping'

const PLASTER_KINDS: readonly CeilingWorkKind[] = ['plaster']
const PUTTY_KINDS: readonly CeilingWorkKind[] = ['prep', 'primer', 'putty', 'reinforce']
const FINISH_KINDS: readonly CeilingWorkKind[] = ['finish-paint']

/** Быстрые действия потолков: подставить площадь, не включая работы. Zoned clones не трогает (shared helper). */
export function applyCeilingTotalAreaToSquareMeterWorks(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => line.unit === 'м²' && line.source !== 'manual' && line.kind !== 'demolition',
    quantity,
  )
}

export function applyCeilingDemolitionArea(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => line.kind === 'demolition' && line.unit === 'м²',
    quantity,
  )
}

export function applyCeilingPlasterArea(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => PLASTER_KINDS.includes(line.kind as CeilingWorkKind) && line.unit === 'м²',
    quantity,
  )
}

export function applyCeilingPuttyArea(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => PUTTY_KINDS.includes(line.kind as CeilingWorkKind) && line.unit === 'м²',
    quantity,
  )
}

export function applyCeilingFinishArea(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => FINISH_KINDS.includes(line.kind as CeilingWorkKind) && line.unit === 'м²',
    quantity,
  )
}

export function createManualCeilingEstimateLine(params: {
  title: string
  unit: string
  unitPrice: number
  quantity?: number
  coefficient?: number
  comment?: string
}): EstimateLine {
  return createManualEstimateLine({
    ...params,
    sectionId: CEILING_SECTION_ID,
    kind: 'other',
  })
}
