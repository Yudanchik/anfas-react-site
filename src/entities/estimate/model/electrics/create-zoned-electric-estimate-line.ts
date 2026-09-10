import { createZonedEstimateLine } from '../shared/estimate-zoned-line'
import type { EstimateLine } from '../shared/estimate.types'
import { ELECTRIC_PRICE_MAPPING, ELECTRIC_SECTION_ID } from './electric-price.mapping'

export type CreateZonedElectricEstimateLineParams = {
  priceKey: string
  quantity: number
  zoneName: string
  zoneId?: string
  comment?: string
}

export function findElectricMappingItem(priceKey: string) {
  return ELECTRIC_PRICE_MAPPING.find((item) => item.id === priceKey)
}

/**
 * Создаёт zoned clone для электрики из `ELECTRIC_PRICE_MAPPING`.
 * `null`, если `priceKey` неизвестен.
 */
export function createZonedElectricEstimateLine(
  params: CreateZonedElectricEstimateLineParams,
): EstimateLine | null {
  const item = findElectricMappingItem(params.priceKey)
  if (!item) return null

  return createZonedEstimateLine({
    sectionId: ELECTRIC_SECTION_ID,
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
