import type { PriceCategorySlug } from '../../price/model/price.types'

export type FloorPriceSource = 'pdf' | 'frontend' | 'both' | 'manual'

export type FloorWorkKind =
  | 'demolition'
  | 'base-prep'
  | 'primer'
  | 'screed-semidry'
  | 'screed-wet'
  | 'self-leveling'
  | 'waterproofing'
  | 'waste'
  | 'other-rough'

export type FloorQuantityField =
  | 'totalFloorArea'
  | 'demolitionArea'
  | 'screedArea'
  | 'wetZonesArea'
  | 'manual'

export type EstimateLine = {
  id: string
  priceKey: string
  sectionId: string
  kind: FloorWorkKind
  title: string
  unit: string
  unitPrice: number
  quantity: number
  coefficient: number
  enabled: boolean
  comment?: string
  source: FloorPriceSource
  frontendCategorySlug?: PriceCategorySlug
  note?: string
}

export type EstimateSection = {
  id: string
  title: string
  lines: readonly EstimateLine[]
}

export type FloorEstimateInput = {
  totalFloorArea: number
  demolitionArea: number
  screedArea: number
  wetZonesArea: number
  avgDeltaMm: number
  surveyorComment?: string
}

export type FloorRecommendationLevel = 'up-to-5' | '5-to-20' | '20-to-50' | 'over-50'

export type FloorRecommendation = {
  level: FloorRecommendationLevel
  avgDeltaMm: number
  message: string
  suggestedPriceKeys: readonly string[]
}

export type FloorEstimateResult = {
  section: EstimateSection
  recommendation: FloorRecommendation
  selectedCount: number
  totalRub: number
  materialsExcluded: true
}

export type FloorPriceMappingItem = {
  /** Stable id used as EstimateLine.priceKey / id seed */
  id: string
  title: string
  unit: string
  unitPrice: number
  source: FloorPriceSource
  kind: FloorWorkKind
  frontendCategorySlug?: PriceCategorySlug
  /** Exact frontend position name for conflict check when source is both/frontend */
  frontendName?: string
  frontendUnitPrice?: number
  note?: string
  defaultEnabled: boolean
  defaultQuantityFrom: FloorQuantityField
}
