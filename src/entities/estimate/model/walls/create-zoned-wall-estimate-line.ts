import { createZonedEstimateLine } from '../shared/estimate-zoned-line'
import type { EstimateLine } from '../shared/estimate.types'
import { WALL_PRICE_MAPPING, WALL_SECTION_ID } from './wall-price.mapping'

export type CreateZonedWallEstimateLineParams = {
  priceKey: string
  quantity: number
  zoneName: string
  zoneId?: string
  comment?: string
}

export function findWallMappingItem(priceKey: string) {
  return WALL_PRICE_MAPPING.find((item) => item.id === priceKey)
}

/**
 * Создаёт zoned clone для стен из `WALL_PRICE_MAPPING`.
 * `null`, если `priceKey` неизвестен.
 */
export function createZonedWallEstimateLine(
  params: CreateZonedWallEstimateLineParams,
): EstimateLine | null {
  const item = findWallMappingItem(params.priceKey)
  if (!item) return null

  return createZonedEstimateLine({
    sectionId: WALL_SECTION_ID,
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
