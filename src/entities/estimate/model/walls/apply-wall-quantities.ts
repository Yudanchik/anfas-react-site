import { applyQuantityToMatchingLines, createManualEstimateLine } from '../shared/estimate-line-helpers'
import type { EstimateLine, WallWorkKind } from '../shared/estimate.types'
import { WALL_SECTION_ID } from './wall-price.mapping'

const PLASTER_KINDS: readonly WallWorkKind[] = ['plaster-gypsum', 'plaster-cement']
const PUTTY_KINDS: readonly WallWorkKind[] = ['prep', 'primer', 'putty', 'reinforce']
const FINISH_KINDS: readonly WallWorkKind[] = ['finish-paint', 'finish-wallpaper']

export function applyWallTotalAreaToSquareMeterWorks(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => line.unit === 'м²' && line.source !== 'manual' && line.kind !== 'demolition',
    quantity,
  )
}

export function applyWallDemolitionArea(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => line.kind === 'demolition' && line.unit === 'м²',
    quantity,
  )
}

export function applyWallPlasterArea(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => PLASTER_KINDS.includes(line.kind as WallWorkKind) && line.unit === 'м²',
    quantity,
  )
}

export function applyWallPuttyArea(lines: readonly EstimateLine[], quantity: number): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => PUTTY_KINDS.includes(line.kind as WallWorkKind) && line.unit === 'м²',
    quantity,
  )
}

export function applyWallFinishArea(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => FINISH_KINDS.includes(line.kind as WallWorkKind) && line.unit === 'м²',
    quantity,
  )
}

export function applyWallSlopesLength(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => line.kind === 'slopes' && line.unit === 'м. пог.',
    quantity,
  )
}

export function applyWallCornersLength(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) =>
      (line.priceKey.includes('corners') || line.title.toLowerCase().includes('углов')) &&
      line.unit === 'м. пог.',
    quantity,
  )
}

export function createManualWallEstimateLine(params: {
  title: string
  unit: string
  unitPrice: number
  quantity?: number
  coefficient?: number
  comment?: string
}): EstimateLine {
  return createManualEstimateLine({
    ...params,
    sectionId: WALL_SECTION_ID,
    kind: 'other',
  })
}
