import type { PriceCategorySlug } from '../../../price/model/price.types'

export type EstimatePriceSource = 'pdf' | 'frontend' | 'both' | 'manual'

/** @deprecated Предпочитайте `EstimatePriceSource` — оставлен для старых call sites полов. */
export type FloorPriceSource = EstimatePriceSource

export type FloorWorkKind =
  | 'demolition'
  | 'base-prep'
  | 'primer'
  | 'screed-semidry'
  | 'screed-wet'
  | 'self-leveling'
  | 'waterproofing'
  | 'finish-floor'
  | 'finish-plinth'
  | 'waste'
  | 'other-rough'

export type WallWorkKind =
  | 'demolition'
  | 'prep'
  | 'primer'
  | 'plaster-gypsum'
  | 'plaster-cement'
  | 'putty'
  | 'reinforce'
  | 'slopes'
  | 'finish-paint'
  | 'finish-wallpaper'
  | 'other'

export type EstimateWorkKind = FloorWorkKind | WallWorkKind

export type FloorQuantityField =
  | 'totalFloorArea'
  | 'demolitionArea'
  | 'screedArea'
  | 'wetZonesArea'
  | 'manual'

export type WallQuantityField =
  | 'totalWallArea'
  | 'demolitionArea'
  | 'plasterArea'
  | 'puttyArea'
  | 'finishArea'
  | 'slopesLength'
  | 'cornersLength'
  | 'manual'

export type EstimateLine = {
  id: string
  priceKey: string
  sectionId: string
  kind: EstimateWorkKind
  title: string
  unit: string
  unitPrice: number
  quantity: number
  coefficient: number
  enabled: boolean
  comment?: string
  /** Название зоны для zoned clone line (например «Кухня»). Без зоны — общая работа. */
  zoneName?: string
  source: EstimatePriceSource
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

export type WallEstimateInput = {
  totalWallArea: number
  demolitionArea: number
  plasterArea: number
  puttyArea: number
  finishArea: number
  wallHeightM: number
  slopesLengthM: number
  cornersLengthM: number
  surveyorComment?: string
}

export type WallEstimateResult = {
  section: EstimateSection
  selectedCount: number
  totalRub: number
  materialsExcluded: true
}

export type FloorPriceMappingItem = {
  /** Стабильный id → `EstimateLine.priceKey` / основа `id` строки */
  id: string
  title: string
  unit: string
  unitPrice: number
  source: EstimatePriceSource
  kind: FloorWorkKind
  frontendCategorySlug?: PriceCategorySlug
  /** Точное имя позиции на сайте для сверки, если `source` = both/frontend */
  frontendName?: string
  frontendUnitPrice?: number
  note?: string
  defaultEnabled: boolean
  defaultQuantityFrom: FloorQuantityField
}

export type WallPriceMappingItem = {
  id: string
  title: string
  unit: string
  unitPrice: number
  source: EstimatePriceSource
  kind: WallWorkKind
  frontendCategorySlug?: PriceCategorySlug
  frontendName?: string
  frontendUnitPrice?: number
  note?: string
  defaultEnabled: boolean
  defaultQuantityFrom: WallQuantityField
}
