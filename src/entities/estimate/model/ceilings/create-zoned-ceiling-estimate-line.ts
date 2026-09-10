import { createZonedEstimateLine } from '../shared/estimate-zoned-line'
import type { EstimateLine } from '../shared/estimate.types'
import { CEILING_PRICE_MAPPING, CEILING_SECTION_ID } from './ceiling-price.mapping'

export type CreateZonedCeilingEstimateLineParams = {
  priceKey: string
  quantity: number
  zoneName: string
  zoneId?: string
  comment?: string
}

export function findCeilingMappingItem(priceKey: string) {
  return CEILING_PRICE_MAPPING.find((item) => item.id === priceKey)
}

/**
 * Создаёт zoned clone для потолков из `CEILING_PRICE_MAPPING`.
 * `null`, если `priceKey` неизвестен.
 */
export function createZonedCeilingEstimateLine(
  params: CreateZonedCeilingEstimateLineParams,
): EstimateLine | null {
  const item = findCeilingMappingItem(params.priceKey)
  if (!item) return null

  return createZonedEstimateLine({
    sectionId: CEILING_SECTION_ID,
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
