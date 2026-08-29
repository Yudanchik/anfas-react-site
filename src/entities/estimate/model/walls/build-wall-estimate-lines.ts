import { normalizeNonNegative, normalizePositiveCoefficient } from '../shared/calculate-line-total'
import type {
  EstimateLine,
  WallEstimateInput,
  WallPriceMappingItem,
  WallQuantityField,
  WallWorkKind,
} from '../shared/estimate.types'
import { WALL_PRICE_MAPPING, WALL_SECTION_ID } from './wall-price.mapping'

export type BuildWallEstimateLinesOptions = {
  mapping?: readonly WallPriceMappingItem[]
  enabledByKey?: Readonly<Record<string, boolean>>
  quantityByKey?: Readonly<Record<string, number>>
  unitPriceByKey?: Readonly<Record<string, number>>
  coefficientByKey?: Readonly<Record<string, number>>
}

const FINISH_KINDS: readonly WallWorkKind[] = ['finish-paint', 'finish-wallpaper']

/**
 * Builds editable wall estimate lines from mapping + surveyor input.
 * Assumptions: labour-only prices; materials excluded; mapped rows start disabled.
 * Finish kinds use `finishArea` (with putty/total fallback) even if mapping field is puttyArea.
 */
export function buildWallEstimateLines(
  input: WallEstimateInput,
  options: BuildWallEstimateLinesOptions = {},
): EstimateLine[] {
  const mapping = options.mapping ?? WALL_PRICE_MAPPING

  return mapping.map((item) => {
    const quantity =
      options.quantityByKey?.[item.id] ??
      resolveWallDefaultQuantity(resolveQuantityFieldForItem(item), input)

    return {
      id: `${WALL_SECTION_ID}:${item.id}`,
      priceKey: item.id,
      sectionId: WALL_SECTION_ID,
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

function resolveQuantityFieldForItem(item: WallPriceMappingItem): WallQuantityField {
  if (FINISH_KINDS.includes(item.kind)) return 'finishArea'
  return item.defaultQuantityFrom
}

export function resolveWallDefaultQuantity(
  field: WallQuantityField,
  input: WallEstimateInput,
): number {
  switch (field) {
    case 'totalWallArea':
      return normalizeNonNegative(input.totalWallArea)
    case 'demolitionArea':
      return normalizeNonNegative(input.demolitionArea)
    case 'plasterArea':
      return resolvePlasterQuantity(input)
    case 'puttyArea':
      return resolvePuttyQuantity(input)
    case 'finishArea':
      return resolveFinishQuantity(input)
    case 'slopesLength':
      return normalizeNonNegative(input.slopesLengthM)
    case 'cornersLength':
      return normalizeNonNegative(input.cornersLengthM)
    case 'manual':
      return 0
  }
}

export function resolvePlasterQuantity(input: WallEstimateInput): number {
  if (input.plasterArea > 0) return normalizeNonNegative(input.plasterArea)
  return normalizeNonNegative(input.totalWallArea)
}

export function resolvePuttyQuantity(input: WallEstimateInput): number {
  if (input.puttyArea > 0) return normalizeNonNegative(input.puttyArea)
  return normalizeNonNegative(input.totalWallArea)
}

export function resolveFinishQuantity(input: WallEstimateInput): number {
  if (input.finishArea > 0) return normalizeNonNegative(input.finishArea)
  if (input.puttyArea > 0) return normalizeNonNegative(input.puttyArea)
  return normalizeNonNegative(input.totalWallArea)
}
