import { normalizeNonNegative, normalizePositiveCoefficient } from '../shared/calculate-line-total'
import type {
  CeilingEstimateInput,
  CeilingPriceMappingItem,
  CeilingQuantityField,
  CeilingWorkKind,
  EstimateLine,
} from '../shared/estimate.types'
import { CEILING_PRICE_MAPPING, CEILING_SECTION_ID } from './ceiling-price.mapping'

export type BuildCeilingEstimateLinesOptions = {
  mapping?: readonly CeilingPriceMappingItem[]
  enabledByKey?: Readonly<Record<string, boolean>>
  quantityByKey?: Readonly<Record<string, number>>
  unitPriceByKey?: Readonly<Record<string, number>>
  coefficientByKey?: Readonly<Record<string, number>>
}

const FINISH_KINDS: readonly CeilingWorkKind[] = ['finish-paint']

/**
 * Собирает редактируемые строки потолков из mapping + параметров замера.
 * Цены — только работа; материалы не входят; mapped-строки стартуют выключенными.
 * Финишные kinds берут `finishArea` (с fallback на putty/total), даже если в mapping указано иначе.
 */
export function buildCeilingEstimateLines(
  input: CeilingEstimateInput,
  options: BuildCeilingEstimateLinesOptions = {},
): EstimateLine[] {
  const mapping = options.mapping ?? CEILING_PRICE_MAPPING

  return mapping.map((item) => {
    const quantity =
      options.quantityByKey?.[item.id] ??
      resolveCeilingDefaultQuantity(resolveQuantityFieldForItem(item), input)

    return {
      id: `${CEILING_SECTION_ID}:${item.id}`,
      priceKey: item.id,
      sectionId: CEILING_SECTION_ID,
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

function resolveQuantityFieldForItem(item: CeilingPriceMappingItem): CeilingQuantityField {
  if (FINISH_KINDS.includes(item.kind)) return 'finishArea'
  return item.defaultQuantityFrom
}

export function resolveCeilingDefaultQuantity(
  field: CeilingQuantityField,
  input: CeilingEstimateInput,
): number {
  switch (field) {
    case 'totalCeilingArea':
      return normalizeNonNegative(input.totalCeilingArea)
    case 'demolitionArea':
      return normalizeNonNegative(input.demolitionArea)
    case 'gklSeamsLength':
      return normalizeNonNegative(input.gklSeamsLengthM ?? 0)
    case 'plasterArea':
      return resolveCeilingPlasterQuantity(input)
    case 'puttyArea':
      return resolveCeilingPuttyQuantity(input)
    case 'finishArea':
      return resolveCeilingFinishQuantity(input)
    case 'manual':
      return 0
  }
}

export function resolveCeilingPlasterQuantity(input: CeilingEstimateInput): number {
  if (input.plasterArea > 0) return normalizeNonNegative(input.plasterArea)
  return normalizeNonNegative(input.totalCeilingArea)
}

export function resolveCeilingPuttyQuantity(input: CeilingEstimateInput): number {
  if (input.puttyArea > 0) return normalizeNonNegative(input.puttyArea)
  return normalizeNonNegative(input.totalCeilingArea)
}

export function resolveCeilingFinishQuantity(input: CeilingEstimateInput): number {
  if (input.finishArea > 0) return normalizeNonNegative(input.finishArea)
  if (input.puttyArea > 0) return normalizeNonNegative(input.puttyArea)
  return normalizeNonNegative(input.totalCeilingArea)
}
