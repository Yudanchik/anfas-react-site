import { normalizeNonNegative, normalizePositiveCoefficient } from '../shared/calculate-line-total'
import type {
  EstimateLine,
  FloorEstimateInput,
  FloorPriceMappingItem,
  FloorQuantityField,
} from '../shared/estimate.types'
import { FLOOR_PRICE_MAPPING, FLOOR_SECTION_ID } from './floor-price.mapping'

export type BuildFloorEstimateLinesOptions = {
  mapping?: readonly FloorPriceMappingItem[]
  /** Переопределить `enabled` по `priceKey` */
  enabledByKey?: Readonly<Record<string, boolean>>
  /** Переопределить объём по `priceKey` */
  quantityByKey?: Readonly<Record<string, number>>
  /** Переопределить цену по `priceKey` */
  unitPriceByKey?: Readonly<Record<string, number>>
  /** Переопределить коэффициент по `priceKey` */
  coefficientByKey?: Readonly<Record<string, number>>
}

/**
 * Собирает редактируемые строки полов из mapping + параметров замера.
 * Цены — только работа (`FLOOR_PRICE_MAPPING`); материалы не входят.
 * Объёмы по умолчанию из полей ввода; mapped-строки по умолчанию выключены.
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
