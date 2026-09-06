import { createZonedEstimateLine } from '../shared/estimate-zoned-line'
import type { EstimateLine } from '../shared/estimate.types'
import { TILE_PRICE_MAPPING, TILE_SECTION_ID } from './tile-price.mapping'

export type CreateZonedTileEstimateLineParams = {
  priceKey: string
  quantity: number
  zoneName: string
  zoneId?: string
  comment?: string
}

export function findTileMappingItem(priceKey: string) {
  return TILE_PRICE_MAPPING.find((item) => item.id === priceKey)
}

/**
 * Создаёт zoned clone для плитки из `TILE_PRICE_MAPPING`.
 * `null`, если `priceKey` неизвестен.
 */
export function createZonedTileEstimateLine(
  params: CreateZonedTileEstimateLineParams,
): EstimateLine | null {
  const item = findTileMappingItem(params.priceKey)
  if (!item) return null

  return createZonedEstimateLine({
    sectionId: TILE_SECTION_ID,
    priceKey: item.id,
    title: item.title,
    unit: item.unit,
    unitPrice: item.unitPrice,
    kind: item.kind,
    quantity: params.quantity,
    zoneName: params.zoneName,
    zoneId: params.zoneId,
    comment: params.comment,
    source: item.source,
    frontendCategorySlug: item.frontendCategorySlug,
    note: item.note,
  })
}
