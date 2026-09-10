import { normalizeNonNegative, normalizePositiveCoefficient } from '../shared/calculate-line-total'
import type {
  EstimateLine,
  PlumbingEstimateInput,
  PlumbingPriceMappingItem,
  PlumbingQuantityField,
} from '../shared/estimate.types'
import { PLUMBING_PRICE_MAPPING, PLUMBING_SECTION_ID } from './plumbing-price.mapping'

export type BuildPlumbingEstimateLinesOptions = {
  mapping?: readonly PlumbingPriceMappingItem[]
  enabledByKey?: Readonly<Record<string, boolean>>
  quantityByKey?: Readonly<Record<string, number>>
  unitPriceByKey?: Readonly<Record<string, number>>
  coefficientByKey?: Readonly<Record<string, number>>
}

/**
 * Собирает редактируемые строки сантехники из mapping + параметров замера.
 * Цены — только работа; материалы не входят; mapped-строки стартуют выключенными.
 */
export function buildPlumbingEstimateLines(
  input: PlumbingEstimateInput,
  options: BuildPlumbingEstimateLinesOptions = {},
): EstimateLine[] {
  const mapping = options.mapping ?? PLUMBING_PRICE_MAPPING

  return mapping.map((item) => {
    const quantity =
      options.quantityByKey?.[item.id] ??
      resolvePlumbingDefaultQuantity(item.defaultQuantityFrom, input)

    return {
      id: `${PLUMBING_SECTION_ID}:${item.id}`,
      priceKey: item.id,
      sectionId: PLUMBING_SECTION_ID,
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

export function resolvePlumbingDefaultQuantity(
  field: PlumbingQuantityField,
  input: PlumbingEstimateInput,
): number {
  switch (field) {
    case 'plumbingWaterPointsCount':
      return normalizeNonNegative(input.plumbingWaterPointsCount)
    case 'plumbingSewerPointsCount':
      return normalizeNonNegative(input.plumbingSewerPointsCount)
    case 'plumbingWaterPipeLength':
      return normalizeNonNegative(input.plumbingWaterPipeLength)
    case 'plumbingSewerPipeLength':
      return normalizeNonNegative(input.plumbingSewerPipeLength)
    case 'plumbingCollectorsCount':
      return normalizeNonNegative(input.plumbingCollectorsCount)
    case 'plumbingToiletsCount':
      return normalizeNonNegative(input.plumbingToiletsCount)
    case 'plumbingSinksCount':
      return normalizeNonNegative(input.plumbingSinksCount)
    case 'plumbingBathtubsCount':
      return normalizeNonNegative(input.plumbingBathtubsCount)
    case 'plumbingShowersCount':
      return normalizeNonNegative(input.plumbingShowersCount)
    case 'plumbingMixersCount':
      return normalizeNonNegative(input.plumbingMixersCount)
    case 'plumbingInstallationsCount':
      return normalizeNonNegative(input.plumbingInstallationsCount)
    case 'plumbingDrainsCount':
      return normalizeNonNegative(input.plumbingDrainsCount)
    case 'plumbingWasherConnectionsCount':
      return normalizeNonNegative(input.plumbingWasherConnectionsCount)
    case 'plumbingDishwasherConnectionsCount':
      return normalizeNonNegative(input.plumbingDishwasherConnectionsCount)
    case 'plumbingWaterHeatersCount':
      return normalizeNonNegative(input.plumbingWaterHeatersCount)
    case 'plumbingTowelWarmersCount':
      return normalizeNonNegative(input.plumbingTowelWarmersCount)
    case 'plumbingWarmFloorArea':
      return normalizeNonNegative(input.plumbingWarmFloorArea)
    case 'manual':
      return 0
  }
}
