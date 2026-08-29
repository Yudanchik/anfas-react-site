export type {
  EstimateLine,
  EstimatePriceSource,
  EstimateSection,
  EstimateWorkKind,
  FloorEstimateInput,
  FloorEstimateResult,
  FloorPriceMappingItem,
  FloorPriceSource,
  FloorQuantityField,
  FloorRecommendation,
  FloorRecommendationLevel,
  FloorWorkKind,
  WallEstimateInput,
  WallEstimateResult,
  WallPriceMappingItem,
  WallQuantityField,
  WallWorkKind,
} from './shared/estimate.types'

export {
  calculateLineTotal,
  normalizeNonNegative,
  normalizePositiveCoefficient,
} from './shared/calculate-line-total'
export { calculateSectionTotal, countEnabledLines } from './shared/calculate-section-total'
export {
  calculateEstimateSelectedCount,
  calculateEstimateTotal,
} from './shared/calculate-estimate-total'
export {
  applyQuantityToMatchingLines,
  createManualEstimateLine,
  updateEstimateLine,
} from './shared/estimate-line-helpers'
export {
  calculateSelectedSectionsGrandTotal,
  countSelectedSectionRows,
  ESTIMATE_SECTION_LABELS,
  getCombinedSelectedEstimateLines,
  getSelectedEstimateLines,
  getSelectedEstimateSections,
  resolveEstimateSectionTitle,
} from './shared/get-selected-estimate-lines'
export type {
  EstimateSectionSelection,
  SelectedEstimateLineView,
  SelectedEstimateSectionGroup,
} from './shared/get-selected-estimate-lines'
export { formatEstimatePositionCount } from './shared/format-estimate-position-count'

export { getFloorRecommendation } from './floors/get-floor-recommendation'
export {
  buildFloorEstimateLines,
  resolveDefaultQuantity,
} from './floors/build-floor-estimate-lines'
export type { BuildFloorEstimateLinesOptions } from './floors/build-floor-estimate-lines'
export {
  buildFloorEstimate,
  calculateFloorEstimateTotalFromResult,
} from './floors/build-floor-estimate'
export {
  FLOOR_PRICE_MAPPING,
  FLOOR_SECTION_ID,
  FLOOR_SECTION_TITLE,
} from './floors/floor-price.mapping'
export {
  assertFloorMappingMatchesFrontend,
  findFloorMappingConflicts,
} from './floors/assert-floor-mapping'
export type { FloorMappingConflict } from './floors/assert-floor-mapping'
export {
  applyDemolitionAreaToDemolitionWorks,
  applyScreedAreaToScreedWorks,
  applyTotalAreaToSquareMeterWorks,
  applyWetAreaToWaterproofing,
} from './floors/apply-floor-quantities'
export {
  getDefaultOpenFloorGroupIds,
  getFloorEstimateGroupTitle,
  groupFloorEstimateLines,
  resolveFloorEstimateGroupId,
} from './floors/floor-estimate-groups'
export type { FloorEstimateGroup, FloorEstimateGroupId } from './floors/floor-estimate-groups'
export {
  disableConflictingAlternatives,
  FLOOR_CONFLICT_GROUPS,
  getFloorConflictGroupId,
} from './floors/floor-conflict-groups'
export {
  applyFloorPreset,
  formatFloorPresetFeedback,
  getFloorPresetLabel,
} from './floors/apply-floor-preset'
export type {
  ApplyFloorPresetResult,
  DemolitionCoveringOption,
  FloorPresetApplication,
  FloorPresetId,
  ScreedTypeOption,
  WasteTripOption,
  WaterproofingLayersOption,
} from './floors/apply-floor-preset'

export {
  WALL_PRICE_MAPPING,
  WALL_SECTION_ID,
  WALL_SECTION_TITLE,
} from './walls/wall-price.mapping'
export {
  assertWallMappingMatchesFrontend,
  findWallMappingConflicts,
} from './walls/assert-wall-mapping'
export type { WallMappingConflict } from './walls/assert-wall-mapping'
export {
  buildWallEstimateLines,
  resolveFinishQuantity,
  resolvePlasterQuantity,
  resolvePuttyQuantity,
  resolveWallDefaultQuantity,
} from './walls/build-wall-estimate-lines'
export type { BuildWallEstimateLinesOptions } from './walls/build-wall-estimate-lines'
export { buildWallEstimate } from './walls/build-wall-estimate'
export {
  applyWallCornersLength,
  applyWallDemolitionArea,
  applyWallFinishArea,
  applyWallPlasterArea,
  applyWallPuttyArea,
  applyWallSlopesLength,
  applyWallTotalAreaToSquareMeterWorks,
  createManualWallEstimateLine,
} from './walls/apply-wall-quantities'
export {
  getDefaultOpenWallGroupIds,
  getWallEstimateGroupTitle,
  groupWallEstimateLines,
  resolveWallEstimateGroupId,
} from './walls/wall-estimate-groups'
export type { WallEstimateGroup, WallEstimateGroupId } from './walls/wall-estimate-groups'
export {
  disableWallConflictingAlternatives,
  getWallConflictGroupId,
  WALL_CONFLICT_GROUPS,
  WALL_PAINT_FINISH_KEYS,
  WALL_WALLPAPER_FINISH_KEYS,
} from './walls/wall-conflict-groups'
export {
  applyWallScenario,
  formatWallScenarioFeedback,
  formatWallScenarioLabel,
  isWallFinishPriceKey,
  resolveWallScenarioKeys,
  wallScenarioIncludesFinish,
} from './walls/apply-wall-scenario'
export type {
  ApplyWallScenarioResult,
  WallDemolitionCoveringOption,
  WallFinishTargetOption,
  WallPaintLayersOption,
  WallScenarioApplication,
  WallStateOption,
  WallWallpaperTypeOption,
} from './walls/apply-wall-scenario'
