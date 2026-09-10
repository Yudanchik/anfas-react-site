import { createZonedEstimateLine } from '../shared/estimate-zoned-line'
import type { EstimateLine } from '../shared/estimate.types'
import { PLUMBING_PRICE_MAPPING, PLUMBING_SECTION_ID } from './plumbing-price.mapping'

export type CreateZonedPlumbingEstimateLineParams = {
  priceKey: string
  quantity: number
  zoneName: string
  zoneId?: string
  comment?: string
}

export function findPlumbingMappingItem(priceKey: string) {
  return PLUMBING_PRICE_MAPPING.find((item) => item.id === priceKey)
}

/**
 * Создаёт zoned clone для сантехники из `PLUMBING_PRICE_MAPPING`.
 * `null`, если `priceKey` неизвестен.
 */
export function createZonedPlumbingEstimateLine(
  params: CreateZonedPlumbingEstimateLineParams,
): EstimateLine | null {
  const item = findPlumbingMappingItem(params.priceKey)
  if (!item) return null

  return createZonedEstimateLine({
    sectionId: PLUMBING_SECTION_ID,
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
