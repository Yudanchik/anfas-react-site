import { prices } from '../../../price/model/prices.data'

import type { PlumbingPriceMappingItem } from '../shared/estimate.types'
import { PLUMBING_PRICE_MAPPING } from './plumbing-price.mapping'

export type PlumbingMappingConflict = {
  mappingId: string
  mappingTitle: string
  mappingPrice: number
  frontendName: string
  frontendPrice: number
  categorySlug: string
}

/**
 * Ловит расхождение цен mapping (`both`/`frontend`) с публичным preview.
 * `prices.data.ts` не меняет.
 */
export function findPlumbingMappingConflicts(
  mapping: readonly PlumbingPriceMappingItem[] = PLUMBING_PRICE_MAPPING,
): PlumbingMappingConflict[] {
  const conflicts: PlumbingMappingConflict[] = []

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

export function assertPlumbingMappingMatchesFrontend(
  mapping: readonly PlumbingPriceMappingItem[] = PLUMBING_PRICE_MAPPING,
): void {
  const conflicts = findPlumbingMappingConflicts(mapping)
  if (conflicts.length === 0) return

  const details = conflicts
    .map(
      (conflict) =>
        `${conflict.mappingId}: mapping=${conflict.mappingPrice}, frontend(${conflict.categorySlug}/${conflict.frontendName})=${conflict.frontendPrice}`,
    )
    .join('\n')

  throw new Error(`Plumbing price mapping conflicts with frontend prices.data.ts:\n${details}`)
}
