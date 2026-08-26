export type {
  EstimateLine,
  EstimateSection,
  FloorEstimateInput,
  FloorEstimateResult,
  FloorPriceMappingItem,
  FloorPriceSource,
  FloorQuantityField,
  FloorRecommendation,
  FloorRecommendationLevel,
  FloorWorkKind,
} from './estimate.types'
export { calculateLineTotal, normalizeNonNegative, normalizePositiveCoefficient } from './calculate-line-total'
export { calculateSectionTotal, countEnabledLines } from './calculate-section-total'
export { calculateEstimateSelectedCount, calculateEstimateTotal } from './calculate-estimate-total'
export { getFloorRecommendation } from './get-floor-recommendation'
export { buildFloorEstimateLines, resolveDefaultQuantity } from './build-floor-estimate-lines'
export type { BuildFloorEstimateLinesOptions } from './build-floor-estimate-lines'
export { buildFloorEstimate, calculateFloorEstimateTotalFromResult } from './build-floor-estimate'
export { FLOOR_PRICE_MAPPING, FLOOR_SECTION_ID, FLOOR_SECTION_TITLE } from './floor-price.mapping'
export {
  assertFloorMappingMatchesFrontend,
  findFloorMappingConflicts,
} from './assert-floor-mapping'
export type { FloorMappingConflict } from './assert-floor-mapping'
export {
  applyDemolitionAreaToDemolitionWorks,
  applyQuantityToMatchingLines,
  applyScreedAreaToScreedWorks,
  applyTotalAreaToSquareMeterWorks,
  applyWetAreaToWaterproofing,
  createManualEstimateLine,
  updateEstimateLine,
} from './apply-floor-quantities'
export {
  getDefaultOpenFloorGroupIds,
  getFloorEstimateGroupTitle,
  groupFloorEstimateLines,
  resolveFloorEstimateGroupId,
} from './floor-estimate-groups'
export type { FloorEstimateGroup, FloorEstimateGroupId } from './floor-estimate-groups'
export {
  disableConflictingAlternatives,
  FLOOR_CONFLICT_GROUPS,
  getFloorConflictGroupId,
} from './floor-conflict-groups'
export {
  applyFloorPreset,
  formatFloorPresetFeedback,
  getFloorPresetLabel,
} from './apply-floor-preset'
export type {
  ApplyFloorPresetResult,
  DemolitionCoveringOption,
  FloorPresetApplication,
  FloorPresetId,
  ScreedTypeOption,
  WasteTripOption,
  WaterproofingLayersOption,
} from './apply-floor-preset'
