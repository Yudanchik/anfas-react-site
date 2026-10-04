export type {
  CeilingEstimateInput,
  CeilingEstimateResult,
  CeilingPriceMappingItem,
  CeilingQuantityField,
  CeilingWorkKind,
  ElectricEstimateInput,
  ElectricEstimateResult,
  ElectricPriceMappingItem,
  ElectricQuantityField,
  ElectricWorkKind,
  PlumbingEstimateInput,
  PlumbingEstimateResult,
  PlumbingPriceMappingItem,
  PlumbingQuantityField,
  PlumbingWorkKind,
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
  TileEstimateInput,
  TileEstimateResult,
  TilePriceMappingItem,
  TileQuantityField,
  TileWorkKind,
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
  noteManualLineIds,
  removeManualEstimateLine,
  removeRemovableEstimateLine,
  enableCanonicalEstimateLine,
  updateEstimateLine,
} from './shared/estimate-line-helpers'
export {
  createZonedEstimateLine,
  isZonedEstimateLine,
  noteZonedLineIds,
} from './shared/estimate-zoned-line'
export type { CreateZonedEstimateLineParams } from './shared/estimate-zoned-line'
export {
  createEstimateZone,
  EMPTY_ESTIMATE_ZONE_FIELDS,
  ESTIMATE_ZONE_NAME_TEMPLATES,
  ESTIMATE_ZONE_TEMPLATES,
  ESTIMATE_ZONE_TYPE_LABELS,
  ESTIMATE_ZONE_TYPE_OPTIONS,
  isEstimateZoneId,
  isEstimateZoneType,
  lineBelongsToZone,
  normalizeEstimateZoneType,
  noteEstimateZoneIds,
  removeEstimateLinesByZoneId,
  removeEstimateZone,
  syncEstimateLineZoneNames,
  updateEstimateZone,
  inferEstimateZoneTypeFromName,
  resolveEstimateZoneType,
} from './shared/estimate-zone'
export type { EstimateZone, EstimateZoneId, EstimateZoneType } from './shared/estimate-zone'
export {
  calculateWallMeasurements,
  createRectangularWalls,
  EMPTY_WALL_MEASUREMENTS,
  relinkRectangularWalls,
  roomFootprintArea,
  syncRoomFootprintAreas,
  updateRoomDimensions,
} from './shared/wall-measurements'
export type { WallMeasurements, MeasuredWall, WallOpening } from './shared/wall-measurements'
export {
  partitionScenariosByZoneType,
  scenarioMatchesZoneType,
} from './shared/estimate-zone-scenario-filter'
export type {
  PartitionScenariosByZoneResult,
  ScenarioWithZoneTypes,
  ScenarioZoneScope,
} from './shared/estimate-zone-scenario-filter'
export {
  attachZonesToSelectedSections,
  calculateSelectedSectionsGrandTotal,
  countSelectedSectionRows,
  ESTIMATE_GENERAL_WORKS_TITLE,
  ESTIMATE_SECTION_LABELS,
  getCombinedSelectedEstimateLines,
  getSelectedEstimateLines,
  getSelectedEstimateSections,
  groupSelectedSectionItemsByZone,
  resolveEstimateSectionTitle,
} from './shared/get-selected-estimate-lines'
export type {
  EstimateSectionSelection,
  SelectedEstimateLineView,
  SelectedEstimateSectionGroup,
  SelectedEstimateSectionWithZones,
  SelectedEstimateZoneGroup,
} from './shared/get-selected-estimate-lines'
export { formatEstimatePositionCount } from './shared/format-estimate-position-count'
export {
  applyActivePriceToCanonicalLine,
  buildActiveEstimateMappings,
  countAvailableMappingItems,
  countPriceEditedLines,
  createZonedLineFromMapping,
  findActiveMappingItem,
  formatUnavailableScenarioMessage,
  getPriceProfileRef,
  getUnavailableMappingKeys,
  isMappingItemAvailable,
  recalculateSectionLinesFromMapping,
  syncNewLinesFromMapping,
  BUILTIN_PRICE_PROFILE_REF,
} from './shared/estimate-price-profile'
export type {
  ActiveEstimateMappings,
  EstimatePriceProfile,
  EstimatePriceProfileImportResult,
  EstimatePriceProfileItem,
  EstimatePriceProfileMappingItem,
  EstimatePriceProfileRef,
  EstimatePriceProfileSectionId,
  RecalculatePriceLinesOptions,
  UnavailableMappingKey,
} from './shared/estimate-price-profile'

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
  FLOOR_ZONE_WORK_CATEGORIES,
  findFloorMappingItem,
  getFloorZoneMappingOptions,
} from './floors/floor-zone-catalog'
export type { FloorZoneWorkCategory, FloorZoneWorkCategoryId } from './floors/floor-zone-catalog'
export { createZonedFloorEstimateLine } from './floors/create-zoned-floor-estimate-line'
export type { CreateZonedFloorEstimateLineParams } from './floors/create-zoned-floor-estimate-line'
export {
  disableConflictingAlternatives,
  disableConflictingAlternativesInZone,
  FLOOR_CONFLICT_GROUPS,
  getFloorConflictGroupId,
} from './floors/floor-conflict-groups'
export {
  applyFloorPreset,
  applyFloorPresetToZone,
  formatFloorPresetFeedback,
  formatFloorPresetZoneFeedback,
  getFloorPresetLabel,
  resolveFloorPresetKeys,
  resolveFloorRoomPlan,
} from './floors/apply-floor-preset'
export type {
  ApplyFloorPresetResult,
  DemolitionCoveringOption,
  FloorPresetApplication,
  FloorPresetId,
  FloorRoomPlan,
  ScreedTypeOption,
  WasteTripOption,
  WaterproofingLayersOption,
} from './floors/apply-floor-preset'

export { WALL_PRICE_MAPPING, WALL_SECTION_ID, WALL_SECTION_TITLE } from './walls/wall-price.mapping'
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
  disableWallConflictingAlternativesInZone,
  getWallConflictGroupId,
  WALL_CONFLICT_GROUPS,
  WALL_PAINT_FINISH_KEYS,
  WALL_WALLPAPER_FINISH_KEYS,
} from './walls/wall-conflict-groups'
export {
  applyWallScenario,
  applyWallScenarioToZone,
  formatWallScenarioFeedback,
  formatWallScenarioLabel,
  formatWallScenarioZoneFeedback,
  isWallFinishPriceKey,
  resolveWallScenarioPlan,
  resolveWallScenarioKeys,
  wallScenarioForZone,
  wallScenarioIncludesFinish,
} from './walls/apply-wall-scenario'
export {
  getWallScenarioProgress,
  wallScenarioMeasureSignature,
} from './walls/wall-scenario-progress'
export type { WallScenarioProgress } from './walls/wall-scenario-progress'
export type {
  ApplyWallScenarioResult,
  WallDemolitionCoveringOption,
  WallFinishTargetOption,
  WallPaintLayersOption,
  WallSubstrateOption,
  WallLevelingOption,
  WallMoistureOption,
  WallQualityOption,
  WallScenarioApplyMode,
  WallBaseConditionOption,
  WallScenarioApplication,
  WallScenarioPlan,
  WallSlopesWorkOption,
  WallStateOption,
  WallWallpaperTypeOption,
} from './walls/apply-wall-scenario'
export {
  createZonedWallEstimateLine,
  findWallMappingItem,
} from './walls/create-zoned-wall-estimate-line'
export type { CreateZonedWallEstimateLineParams } from './walls/create-zoned-wall-estimate-line'
export { getWallZoneMappingOptions, WALL_ZONE_WORK_CATEGORIES } from './walls/wall-zone-catalog'
export type { WallZoneWorkCategory, WallZoneWorkCategoryId } from './walls/wall-zone-catalog'

export {
  CEILING_PRICE_MAPPING,
  CEILING_SECTION_ID,
  CEILING_SECTION_TITLE,
} from './ceilings/ceiling-price.mapping'
export {
  assertCeilingMappingMatchesFrontend,
  findCeilingMappingConflicts,
} from './ceilings/assert-ceiling-mapping'
export type { CeilingMappingConflict } from './ceilings/assert-ceiling-mapping'
export {
  buildCeilingEstimateLines,
  resolveCeilingDefaultQuantity,
  resolveCeilingFinishQuantity,
  resolveCeilingPlasterQuantity,
  resolveCeilingPuttyQuantity,
} from './ceilings/build-ceiling-estimate-lines'
export type { BuildCeilingEstimateLinesOptions } from './ceilings/build-ceiling-estimate-lines'
export { buildCeilingEstimate } from './ceilings/build-ceiling-estimate'
export {
  applyCeilingDemolitionArea,
  applyCeilingFinishArea,
  applyCeilingPlasterArea,
  applyCeilingPuttyArea,
  applyCeilingTotalAreaToSquareMeterWorks,
  createManualCeilingEstimateLine,
} from './ceilings/apply-ceiling-quantities'
export {
  getCeilingEstimateGroupTitle,
  getDefaultOpenCeilingGroupIds,
  groupCeilingEstimateLines,
  resolveCeilingEstimateGroupId,
} from './ceilings/ceiling-estimate-groups'
export type {
  CeilingEstimateGroup,
  CeilingEstimateGroupId,
} from './ceilings/ceiling-estimate-groups'
export {
  CEILING_CONFLICT_GROUPS,
  disableCeilingConflictingAlternatives,
  disableCeilingConflictingAlternativesInZone,
  getCeilingConflictGroupId,
} from './ceilings/ceiling-conflict-groups'
export {
  applyCeilingScenario,
  applyCeilingScenarioToZone,
  ceilingScenarioIncludesFinish,
  formatCeilingScenarioFeedback,
  formatCeilingScenarioLabel,
  formatCeilingScenarioZoneFeedback,
  isCeilingFinishPriceKey,
  resolveCeilingScenarioKeys,
  resolveCeilingScenarioPlan,
} from './ceilings/apply-ceiling-scenario'
export type {
  ApplyCeilingScenarioResult,
  CeilingDemolitionCoveringOption,
  CeilingFinishTargetOption,
  CeilingPaintLayersOption,
  CeilingScenarioApplication,
  CeilingScenarioPlan,
  CeilingStateOption,
} from './ceilings/apply-ceiling-scenario'
export {
  createZonedCeilingEstimateLine,
  findCeilingMappingItem,
} from './ceilings/create-zoned-ceiling-estimate-line'
export type { CreateZonedCeilingEstimateLineParams } from './ceilings/create-zoned-ceiling-estimate-line'
export {
  CEILING_ZONE_WORK_CATEGORIES,
  getCeilingZoneMappingOptions,
} from './ceilings/ceiling-zone-catalog'
export type {
  CeilingZoneWorkCategory,
  CeilingZoneWorkCategoryId,
} from './ceilings/ceiling-zone-catalog'

export { TILE_PRICE_MAPPING, TILE_SECTION_ID, TILE_SECTION_TITLE } from './tile/tile-price.mapping'
export {
  assertTileMappingMatchesFrontend,
  findTileMappingConflicts,
} from './tile/assert-tile-mapping'
export type { TileMappingConflict } from './tile/assert-tile-mapping'
export {
  buildTileEstimateLines,
  resolveTileCladArea,
  resolveTileDefaultQuantity,
  resolveTileFloorWallCladArea,
} from './tile/build-tile-estimate-lines'
export type { BuildTileEstimateLinesOptions } from './tile/build-tile-estimate-lines'
export { buildTileEstimate } from './tile/build-tile-estimate'
export {
  applyTileCladArea,
  applyTileCuttingLength,
  applyTileFloorArea,
  applyTileHolesCount,
  applyTileRepairCount,
  applyTileSealLength,
  applyTileWallArea,
  createManualTileEstimateLine,
} from './tile/apply-tile-quantities'
export {
  getDefaultOpenTileGroupIds,
  getTileEstimateGroupTitle,
  groupTileEstimateLines,
  resolveTileEstimateGroupId,
} from './tile/tile-estimate-groups'
export type { TileEstimateGroup, TileEstimateGroupId } from './tile/tile-estimate-groups'
export {
  disableTileConflictingAlternatives,
  disableTileConflictingAlternativesInZone,
  getTileConflictGroupId,
  TILE_CONFLICT_GROUPS,
} from './tile/tile-conflict-groups'
export {
  applyTileScenario,
  applyTileScenarioToZone,
  formatTileScenarioFeedback,
  formatTileScenarioLabel,
  formatTileScenarioZoneFeedback,
  resolveTileScenarioKeys,
} from './tile/apply-tile-scenario'
export type {
  ApplyTileScenarioResult,
  TileCladFormatOption,
  TileDemolitionSurfacesOption,
  TileGroutOption,
  TileScenarioApplication,
  TileStateOption,
} from './tile/apply-tile-scenario'
export {
  createZonedTileEstimateLine,
  findTileMappingItem,
} from './tile/create-zoned-tile-estimate-line'
export type { CreateZonedTileEstimateLineParams } from './tile/create-zoned-tile-estimate-line'
export { getTileZoneMappingOptions, TILE_ZONE_WORK_CATEGORIES } from './tile/tile-zone-catalog'
export type { TileZoneWorkCategory, TileZoneWorkCategoryId } from './tile/tile-zone-catalog'
export {
  formatTileScenarioZoneMismatchMessage,
  getTileScenarioOptionLabel,
  getTileScenarioRecommendedZoneTypes,
  isTileScenarioAllowedForZone,
  resolveTileScenarioOptionsForZone,
  TILE_SCENARIO_OPTIONS,
} from './tile/tile-scenario-options'
export type { TileScenarioOptionMeta } from './tile/tile-scenario-options'

export {
  ELECTRIC_PRICE_MAPPING,
  ELECTRIC_SECTION_ID,
  ELECTRIC_SECTION_TITLE,
} from './electrics/electric-price.mapping'
export {
  assertElectricMappingMatchesFrontend,
  findElectricMappingConflicts,
} from './electrics/assert-electric-mapping'
export type { ElectricMappingConflict } from './electrics/assert-electric-mapping'
export {
  buildElectricEstimateLines,
  resolveElectricDefaultQuantity,
} from './electrics/build-electric-estimate-lines'
export type { BuildElectricEstimateLinesOptions } from './electrics/build-electric-estimate-lines'
export { buildElectricEstimate } from './electrics/build-electric-estimate'
export { estimateSocketBoxes, patchElectricPoints } from './electrics/electric-measurements'
export {
  estimatePlumbingPoints,
  patchPlumbingFixturePoints,
} from './plumbing/plumbing-measurements'
export {
  applyElectricCableLength,
  applyElectricLightPointsCount,
  applyElectricSocketsCount,
  applyElectricStrobeLength,
  applyElectricSwitchesCount,
  applyElectricWarmFloorArea,
  createManualElectricEstimateLine,
} from './electrics/apply-electric-quantities'
export {
  getDefaultOpenElectricGroupIds,
  getElectricEstimateGroupTitle,
  groupElectricEstimateLines,
  resolveElectricEstimateGroupId,
} from './electrics/electric-estimate-groups'
export type {
  ElectricEstimateGroup,
  ElectricEstimateGroupId,
} from './electrics/electric-estimate-groups'
export {
  disableElectricConflictingAlternatives,
  disableElectricConflictingAlternativesInZone,
  ELECTRIC_CONFLICT_GROUPS,
  getElectricConflictGroupId,
} from './electrics/electric-conflict-groups'
export {
  applyElectricScenario,
  applyElectricScenarioToZone,
  electricInputFromZone,
  formatElectricScenarioFeedback,
  formatElectricScenarioLabel,
  formatElectricScenarioZoneFeedback,
  resolveElectricScenarioKeys,
  resolveMeasuredElectricScenarioKeys,
  resolveElectricScenarioPlan,
  resolveElectricScenarioQuantity,
} from './electrics/apply-electric-scenario'
export type {
  ApplyElectricScenarioResult,
  ElectricScenarioApplication,
  ElectricScenarioPlan,
  ElectricStateOption,
} from './electrics/apply-electric-scenario'
export {
  createZonedElectricEstimateLine,
  findElectricMappingItem,
} from './electrics/create-zoned-electric-estimate-line'
export type { CreateZonedElectricEstimateLineParams } from './electrics/create-zoned-electric-estimate-line'
export {
  ELECTRIC_ZONE_WORK_CATEGORIES,
  getElectricZoneMappingOptions,
} from './electrics/electric-zone-catalog'
export type {
  ElectricZoneWorkCategory,
  ElectricZoneWorkCategoryId,
} from './electrics/electric-zone-catalog'
export {
  ELECTRIC_SCENARIO_OPTIONS,
  formatElectricScenarioZoneMismatchMessage,
  getElectricScenarioOptionLabel,
  getElectricScenarioRecommendedZoneTypes,
  isElectricScenarioAllowedForZone,
  resolveElectricScenarioOptionsForZone,
} from './electrics/electric-scenario-options'
export type { ElectricScenarioOptionMeta } from './electrics/electric-scenario-options'

export {
  PLUMBING_PRICE_MAPPING,
  PLUMBING_SECTION_ID,
  PLUMBING_SECTION_TITLE,
} from './plumbing/plumbing-price.mapping'
export {
  assertPlumbingMappingMatchesFrontend,
  findPlumbingMappingConflicts,
} from './plumbing/assert-plumbing-mapping'
export type { PlumbingMappingConflict } from './plumbing/assert-plumbing-mapping'
export {
  buildPlumbingEstimateLines,
  resolvePlumbingDefaultQuantity,
} from './plumbing/build-plumbing-estimate-lines'
export type { BuildPlumbingEstimateLinesOptions } from './plumbing/build-plumbing-estimate-lines'
export { buildPlumbingEstimate } from './plumbing/build-plumbing-estimate'
export {
  applyPlumbingSewerPipeLength,
  applyPlumbingSewerPointsCount,
  applyPlumbingWarmFloorArea,
  applyPlumbingWaterPipeLength,
  applyPlumbingWaterPointsCount,
  createManualPlumbingEstimateLine,
} from './plumbing/apply-plumbing-quantities'
export {
  getDefaultOpenPlumbingGroupIds,
  getPlumbingEstimateGroupTitle,
  groupPlumbingEstimateLines,
  resolvePlumbingEstimateGroupId,
} from './plumbing/plumbing-estimate-groups'
export type {
  PlumbingEstimateGroup,
  PlumbingEstimateGroupId,
} from './plumbing/plumbing-estimate-groups'
export {
  disablePlumbingConflictingAlternatives,
  disablePlumbingConflictingAlternativesInZone,
  PLUMBING_CONFLICT_GROUPS,
  getPlumbingConflictGroupId,
} from './plumbing/plumbing-conflict-groups'
export {
  applyPlumbingScenario,
  applyPlumbingScenarioToZone,
  formatPlumbingScenarioFeedback,
  formatPlumbingScenarioLabel,
  formatPlumbingScenarioZoneFeedback,
  plumbingInputFromZone,
  resolvePlumbingScenarioKeys,
  resolveMeasuredPlumbingScenarioKeys,
  resolvePlumbingScenarioQuantity,
  resolvePlumbingScenarioPlan,
} from './plumbing/apply-plumbing-scenario'
export type {
  ApplyPlumbingScenarioResult,
  PlumbingScenarioApplication,
  PlumbingScenarioPlan,
  PlumbingStateOption,
} from './plumbing/apply-plumbing-scenario'
export {
  createZonedPlumbingEstimateLine,
  findPlumbingMappingItem,
} from './plumbing/create-zoned-plumbing-estimate-line'
export type { CreateZonedPlumbingEstimateLineParams } from './plumbing/create-zoned-plumbing-estimate-line'
export {
  PLUMBING_ZONE_WORK_CATEGORIES,
  getPlumbingZoneMappingOptions,
} from './plumbing/plumbing-zone-catalog'
export type {
  PlumbingZoneWorkCategory,
  PlumbingZoneWorkCategoryId,
} from './plumbing/plumbing-zone-catalog'
export {
  PLUMBING_SCENARIO_OPTIONS,
  formatPlumbingScenarioZoneMismatchMessage,
  getPlumbingScenarioOptionLabel,
  getPlumbingScenarioRecommendedZoneTypes,
  isPlumbingScenarioAllowedForZone,
  resolvePlumbingScenarioOptionsForZone,
} from './plumbing/plumbing-scenario-options'
export type { PlumbingScenarioOptionMeta } from './plumbing/plumbing-scenario-options'
