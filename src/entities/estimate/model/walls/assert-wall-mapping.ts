import { prices } from '../../../price/model/prices.data'

import type { WallPriceMappingItem } from '../shared/estimate.types'
import { WALL_PRICE_MAPPING } from './wall-price.mapping'

export type WallMappingConflict = {
  mappingId: string
  mappingTitle: string
  mappingPrice: number
  frontendName: string
  frontendPrice: number
  categorySlug: string
}

/**
 * Stops Stage 1 if a `both`/`frontend` mapping price disagrees with public preview data.
 * Does not mutate prices.data.ts.
 */
export function findWallMappingConflicts(
  mapping: readonly WallPriceMappingItem[] = WALL_PRICE_MAPPING,
): WallMappingConflict[] {
  const conflicts: WallMappingConflict[] = []

  for (const item of mapping) {
    if (item.source !== 'both' && item.source !== 'frontend') continue
    if (!item.frontendCategorySlug || !item.frontendName) {
      conflicts.push({
        mappingId: item.id,
        mappingTitle: item.title,
        mappingPrice: item.unitPrice,
        frontendName: item.frontendName ?? '(missing frontendName)',
        frontendPrice: Number.NaN,
        categorySlug: item.frontendCategorySlug ?? '(missing slug)',
      })
      continue
    }

    const category = prices.find((entry) => entry.slug === item.frontendCategorySlug)
    const position = category?.positions.find((entry) => entry.name === item.frontendName)

    if (!position) {
      conflicts.push({
        mappingId: item.id,
        mappingTitle: item.title,
        mappingPrice: item.unitPrice,
        frontendName: item.frontendName,
        frontendPrice: Number.NaN,
        categorySlug: item.frontendCategorySlug,
      })
      continue
    }

    const expected = item.frontendUnitPrice ?? item.unitPrice
    if (position.priceFrom !== expected || position.priceFrom !== item.unitPrice) {
      conflicts.push({
        mappingId: item.id,
        mappingTitle: item.title,
        mappingPrice: item.unitPrice,
        frontendName: item.frontendName,
        frontendPrice: position.priceFrom,
        categorySlug: item.frontendCategorySlug,
      })
    }
  }

  return conflicts
}

export function assertWallMappingMatchesFrontend(
  mapping: readonly WallPriceMappingItem[] = WALL_PRICE_MAPPING,
): void {
  const conflicts = findWallMappingConflicts(mapping)
  if (conflicts.length === 0) return

  const details = conflicts
    .map(
      (conflict) =>
        `${conflict.mappingId}: mapping=${conflict.mappingPrice}, frontend(${conflict.categorySlug}/${conflict.frontendName})=${conflict.frontendPrice}`,
    )
    .join('\n')

  throw new Error(`Wall price mapping conflicts with frontend prices.data.ts:\n${details}`)
}
