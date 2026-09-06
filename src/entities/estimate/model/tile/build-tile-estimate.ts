import { calculateEstimateSelectedCount } from '../shared/calculate-estimate-total'
import { calculateSectionTotal } from '../shared/calculate-section-total'
import {
  buildTileEstimateLines,
  type BuildTileEstimateLinesOptions,
} from './build-tile-estimate-lines'
import type { TileEstimateInput, TileEstimateResult } from '../shared/estimate.types'
import { TILE_SECTION_ID, TILE_SECTION_TITLE } from './tile-price.mapping'

/** Сводка раздела «Плитка»: строки и итог; `materialsExcluded: true`. */
export function buildTileEstimate(
  input: TileEstimateInput,
  options?: BuildTileEstimateLinesOptions,
): TileEstimateResult {
  const lines = buildTileEstimateLines(input, options)
  const section = {
    id: TILE_SECTION_ID,
    title: TILE_SECTION_TITLE,
    lines,
  }

  return {
    section,
    selectedCount: calculateEstimateSelectedCount([section]),
    totalRub: calculateSectionTotal(section),
    materialsExcluded: true,
  }
}
