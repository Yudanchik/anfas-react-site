import { applyQuantityToMatchingLines, createManualEstimateLine } from '../shared/estimate-line-helpers'
import type { EstimateLine, TileWorkKind } from '../shared/estimate.types'
import { TILE_SECTION_ID } from './tile-price.mapping'

const PREP_KINDS: readonly TileWorkKind[] = ['prep']
const CLADDING_KINDS: readonly TileWorkKind[] = ['cladding']
const GROUT_KINDS: readonly TileWorkKind[] = ['grout']
const SEAL_KINDS: readonly TileWorkKind[] = ['seal']

/** Быстрые действия плитки: подставить объём, не включая работы. Zoned clones не трогает. */
export function applyTileFloorArea(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => line.priceKey === 'demolition-floor-tile' && line.unit === 'м²',
    quantity,
  )
}

export function applyTileWallArea(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => line.priceKey === 'demolition-wall-tile' && line.unit === 'м²',
    quantity,
  )
}

export function applyTileCladArea(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) =>
      (PREP_KINDS.includes(line.kind as TileWorkKind) ||
        CLADDING_KINDS.includes(line.kind as TileWorkKind) ||
        GROUT_KINDS.includes(line.kind as TileWorkKind)) &&
      line.unit === 'м²' &&
      line.kind !== 'demolition',
    quantity,
  )
}

export function applyTileCuttingLength(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => line.unit === 'м. пог.' && line.source !== 'manual',
    quantity,
  )
}

export function applyTileHolesCount(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) =>
      (line.priceKey === 'hole-up-to-100' ||
        line.priceKey === 'hole-100-230' ||
        line.priceKey === 'hole-rect') &&
      line.unit === 'шт.',
    quantity,
  )
}

export function applyTileRepairCount(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => line.priceKey === 'repair-one-tile' && line.unit === 'шт.',
    quantity,
  )
}

export function applyTileSealLength(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => SEAL_KINDS.includes(line.kind as TileWorkKind) && line.unit === 'м. пог.',
    quantity,
  )
}

export function createManualTileEstimateLine(params: {
  title: string
  unit: string
  unitPrice: number
  quantity?: number
  coefficient?: number
  comment?: string
}): EstimateLine {
  return createManualEstimateLine({
    ...params,
    sectionId: TILE_SECTION_ID,
    kind: 'other',
  })
}
