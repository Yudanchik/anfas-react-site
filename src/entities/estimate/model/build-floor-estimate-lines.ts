import { normalizeNonNegative, normalizePositiveCoefficient } from './calculate-line-total'
import type {
  EstimateLine,
  FloorEstimateInput,
  FloorPriceMappingItem,
  FloorQuantityField,
} from './estimate.types'
import { FLOOR_PRICE_MAPPING, FLOOR_SECTION_ID } from './floor-price.mapping'

export type BuildFloorEstimateLinesOptions = {
  mapping?: readonly FloorPriceMappingItem[]
  /** Override enabled flags by priceKey */
  enabledByKey?: Readonly<Record<string, boolean>>
  /** Override quantity by priceKey */
  quantityByKey?: Readonly<Record<string, number>>
  /** Override unitPrice by priceKey */
  unitPriceByKey?: Readonly<Record<string, number>>
  /** Override coefficient by priceKey */
  coefficientByKey?: Readonly<Record<string, number>>
}

/**
 * Builds editable estimate lines from floor mapping + surveyor input.
 * Assumptions: labour-only prices from FLOOR_PRICE_MAPPING; materials excluded.
 * Quantity defaults come from input fields; enabled defaults stay false for mapped rows.
 */
export function buildFloorEstimateLines(
  input: FloorEstimateInput,
  options: BuildFloorEstimateLinesOptions = {},
): EstimateLine[] {
  const mapping = options.mapping ?? FLOOR_PRICE_MAPPING

  return mapping.map((item) => {
    const quantity =
      options.quantityByKey?.[item.id] ?? resolveDefaultQuantity(item.defaultQuantityFrom, input)

    return {
      id: `${FLOOR_SECTION_ID}:${item.id}`,
      priceKey: item.id,
      sectionId: FLOOR_SECTION_ID,
      kind: item.kind,
      title: item.title,
      unit: item.unit,
      unitPrice: normalizeNonNegative(options.unitPriceByKey?.[item.id] ?? item.unitPrice),
      quantity: normalizeNonNegative(quantity),
      coefficient: normalizePositiveCoefficient(options.coefficientByKey?.[item.id] ?? 1),
      enabled: options.enabledByKey?.[item.id] ?? item.defaultEnabled,
      source: item.source,
      frontendCategorySlug: item.frontendCategorySlug,
      note: item.note,
    }
  })
}

export function resolveDefaultQuantity(
  field: FloorQuantityField,
  input: FloorEstimateInput,
): number {
  switch (field) {
    case 'totalFloorArea':
      return normalizeNonNegative(input.totalFloorArea)
    case 'demolitionArea':
      return normalizeNonNegative(input.demolitionArea)
    case 'screedArea':
      return normalizeNonNegative(input.screedArea)
    case 'wetZonesArea':
      return normalizeNonNegative(input.wetZonesArea)
    case 'manual':
      return 0
  }
}
