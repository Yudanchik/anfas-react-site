import { normalizeNonNegative, normalizePositiveCoefficient } from '../shared/calculate-line-total'
import type {
  EstimateLine,
  TileEstimateInput,
  TilePriceMappingItem,
  TileQuantityField,
} from '../shared/estimate.types'
import { TILE_PRICE_MAPPING, TILE_SECTION_ID } from './tile-price.mapping'

export type BuildTileEstimateLinesOptions = {
  mapping?: readonly TilePriceMappingItem[]
  enabledByKey?: Readonly<Record<string, boolean>>
  quantityByKey?: Readonly<Record<string, number>>
  unitPriceByKey?: Readonly<Record<string, number>>
  coefficientByKey?: Readonly<Record<string, number>>
}

/**
 * Собирает редактируемые строки плитки из mapping + параметров замера.
 * Цены — только работа; материалы не входят; mapped-строки стартуют выключенными.
 */
export function buildTileEstimateLines(
  input: TileEstimateInput,
  options: BuildTileEstimateLinesOptions = {},
): EstimateLine[] {
  const mapping = options.mapping ?? TILE_PRICE_MAPPING

  return mapping.map((item) => {
    const quantity =
      options.quantityByKey?.[item.id] ??
      resolveTileDefaultQuantity(item.defaultQuantityFrom, input)

    return {
      id: `${TILE_SECTION_ID}:${item.id}`,
      priceKey: item.id,
      sectionId: TILE_SECTION_ID,
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

/**
 * Сумма площадей облицовки: пол + стены + фартук, если соответствующая часть > 0.
 */
export function resolveTileCladArea(input: TileEstimateInput): number {
  let sum = 0
  if (input.floorTileArea > 0) sum += normalizeNonNegative(input.floorTileArea)
  if (input.wallTileArea > 0) sum += normalizeNonNegative(input.wallTileArea)
  if (input.backsplashArea > 0) sum += normalizeNonNegative(input.backsplashArea)
  return sum
}

export function resolveTileFloorWallCladArea(input: TileEstimateInput): number {
  let sum = 0
  if (input.floorTileArea > 0) sum += normalizeNonNegative(input.floorTileArea)
  if (input.wallTileArea > 0) sum += normalizeNonNegative(input.wallTileArea)
  return sum
}

export function resolveTileDefaultQuantity(
  field: TileQuantityField,
  input: TileEstimateInput,
): number {
  switch (field) {
    case 'floorTileArea':
      return normalizeNonNegative(input.floorTileArea)
    case 'wallTileArea':
      return normalizeNonNegative(input.wallTileArea)
    case 'backsplashArea':
      return normalizeNonNegative(input.backsplashArea)
    case 'cladArea':
      return resolveTileCladArea(input)
    case 'cuttingLength':
      return normalizeNonNegative(input.cuttingLength)
    case 'cornerLength':
      return normalizeNonNegative(input.cornerLength)
    case 'holesCount':
      return normalizeNonNegative(input.holesCount)
    case 'repairCount':
      return normalizeNonNegative(input.repairCount)
    case 'manual':
      return 0
  }
}
