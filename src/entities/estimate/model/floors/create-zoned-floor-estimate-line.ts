import { createZonedEstimateLine } from '../shared/estimate-zoned-line'
import type { EstimateLine } from '../shared/estimate.types'
import { FLOOR_PRICE_MAPPING, FLOOR_SECTION_ID } from './floor-price.mapping'
import { findFloorMappingItem } from './floor-zone-catalog'

export type CreateZonedFloorEstimateLineParams = {
  priceKey: string
  quantity: number
  zoneName: string
  zoneId?: string
  comment?: string
}

/**
 * Создаёт zoned clone для полов из `FLOOR_PRICE_MAPPING`.
 * `null`, если `priceKey` неизвестен. Уже добавленные строки не затирает.
 */
export function createZonedFloorEstimateLine(
  params: CreateZonedFloorEstimateLineParams,
): EstimateLine | null {
  const item = findFloorMappingItem(params.priceKey, FLOOR_PRICE_MAPPING)
  if (!item) return null

  return createZonedEstimateLine({
    sectionId: FLOOR_SECTION_ID,
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
