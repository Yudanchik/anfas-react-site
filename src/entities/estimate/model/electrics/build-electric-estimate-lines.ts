import { normalizeNonNegative, normalizePositiveCoefficient } from '../shared/calculate-line-total'
import type {
  ElectricEstimateInput,
  ElectricPriceMappingItem,
  ElectricQuantityField,
  EstimateLine,
} from '../shared/estimate.types'
import { ELECTRIC_PRICE_MAPPING, ELECTRIC_SECTION_ID } from './electric-price.mapping'

export type BuildElectricEstimateLinesOptions = {
  mapping?: readonly ElectricPriceMappingItem[]
  enabledByKey?: Readonly<Record<string, boolean>>
  quantityByKey?: Readonly<Record<string, number>>
  unitPriceByKey?: Readonly<Record<string, number>>
  coefficientByKey?: Readonly<Record<string, number>>
}

/**
 * Собирает редактируемые строки электрики из mapping + параметров замера.
 * Цены — только работа; материалы не входят; mapped-строки стартуют выключенными.
 */
export function buildElectricEstimateLines(
  input: ElectricEstimateInput,
  options: BuildElectricEstimateLinesOptions = {},
): EstimateLine[] {
  const mapping = options.mapping ?? ELECTRIC_PRICE_MAPPING

  return mapping.map((item) => {
    const quantity =
      options.quantityByKey?.[item.id] ??
      resolveElectricDefaultQuantity(item.defaultQuantityFrom, input)

    return {
      id: `${ELECTRIC_SECTION_ID}:${item.id}`,
      priceKey: item.id,
      sectionId: ELECTRIC_SECTION_ID,
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

export function resolveElectricDefaultQuantity(
  field: ElectricQuantityField,
  input: ElectricEstimateInput,
): number {
  switch (field) {
    case 'electricSocketsCount':
      return normalizeNonNegative(input.electricSocketsCount)
    case 'electricSwitchesCount':
      return normalizeNonNegative(input.electricSwitchesCount)
    case 'electricLightPointsCount':
      return normalizeNonNegative(input.electricLightPointsCount)
    case 'electricDataPointsCount':
      return normalizeNonNegative(input.electricDataPointsCount)
    case 'electricStrobeLength':
      return normalizeNonNegative(input.electricStrobeLength)
    case 'electricCableLength':
      return normalizeNonNegative(input.electricCableLength)
    case 'electricSocketBoxesCount':
      return normalizeNonNegative(input.electricSocketBoxesCount)
    case 'electricJunctionBoxesCount':
      return normalizeNonNegative(input.electricJunctionBoxesCount)
    case 'electricPanelModulesCount':
      return normalizeNonNegative(input.electricPanelModulesCount)
    case 'electricWarmFloorArea':
      return normalizeNonNegative(input.electricWarmFloorArea)
    case 'electricApplianceConnectionsCount':
      return normalizeNonNegative(input.electricApplianceConnectionsCount)
    case 'manual':
      return 0
  }
}
