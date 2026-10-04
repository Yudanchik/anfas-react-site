import { applyUnifiedCatalogueFill } from '@/features/estimate-calculator/model/catalogue-volume-fill'
import {
  applyRoomWorkFill,
  type RoomFillChange,
} from '@/features/estimate-calculator/model/room-work-quantity'
import { useMemo, useState } from 'react'

import {
  applyActivePriceToCanonicalLine,
  applyTileCladArea,
  applyTileCuttingLength,
  applyTileFloorArea,
  applyTileHolesCount,
  applyTileScenario,
  applyTileScenarioToZone,
  applyTileWallArea,
  buildTileEstimateLines,
  calculateSectionTotal,
  countEnabledLines,
  createManualTileEstimateLine,
  createZonedLineFromMapping,
  enableCanonicalEstimateLine,
  formatUnavailableScenarioMessage,
  getUnavailableMappingKeys,
  removeRemovableEstimateLine,
  resolveTileCladArea,
  resolveTileScenarioKeys,
  syncNewLinesFromMapping,
  TILE_PRICE_MAPPING,
  TILE_SECTION_ID,
  updateEstimateLine,
  type EstimateLine,
  type EstimateZone,
  type TileEstimateInput,
  type TilePriceMappingItem,
  type TileScenarioApplication,
} from '@/entities/estimate'

import {
  countTileCladAreaTargets,
  countTileCuttingLengthTargets,
  countTileFloorAreaTargets,
  countTileHolesCountTargets,
  countTileWallAreaTargets,
} from './tile-quick-action-feedback'

const EMPTY_INPUT: TileEstimateInput = {
  floorTileArea: 0,
  wallTileArea: 0,
  backsplashArea: 0,
  cuttingLength: 0,
  cornerLength: 0,
  holesCount: 0,
  repairCount: 0,
  surveyorComment: '',
}

export type TileEstimateEditorInitial = {
  input?: TileEstimateInput
  lines?: EstimateLine[]
  mapping?: readonly TilePriceMappingItem[]
}

export function useTileEstimateEditor(initial: TileEstimateEditorInitial = {}) {
  const initialInput = initial.input ?? EMPTY_INPUT
  const mapping = initial.mapping ?? TILE_PRICE_MAPPING
  const [input, setInput] = useState<TileEstimateInput>(initialInput)
  const [lines, setLines] = useState<EstimateLine[]>(
    () => initial.lines ?? buildTileEstimateLines(initialInput, { mapping }),
  )

  const selectedCount = useMemo(() => countEnabledLines(lines), [lines])
  const totalRub = useMemo(() => calculateSectionTotal({ lines }), [lines])

  function patchInput(patch: Partial<TileEstimateInput>) {
    setInput((prev) => ({ ...prev, ...patch }))
  }

  function patchLine(
    lineId: string,
    patch: Partial<
      Pick<
        EstimateLine,
        'enabled' | 'quantity' | 'unitPrice' | 'coefficient' | 'comment' | 'title' | 'unit'
      >
    >,
  ) {
    setLines((prev) => updateEstimateLine(prev, lineId, patch))
  }

  function toggleLine(lineId: string) {
    setLines((prev) =>
      prev.map((line) => (line.id === lineId ? { ...line, enabled: !line.enabled } : line)),
    )
  }

  function applyCladArea(): number {
    const affected = countTileCladAreaTargets(lines)
    const qty = resolveTileCladArea(input)
    setLines((prev) => applyTileCladArea(prev, qty))
    return affected
  }

  function applyFloorArea(): number {
    const affected = countTileFloorAreaTargets(lines)
    setLines((prev) => applyTileFloorArea(prev, input.floorTileArea))
    return affected
  }

  function applyWallArea(): number {
    const affected = countTileWallAreaTargets(lines)
    setLines((prev) => applyTileWallArea(prev, input.wallTileArea))
    return affected
  }

  function applyCuttingLength(): number {
    const affected = countTileCuttingLengthTargets(lines)
    setLines((prev) => applyTileCuttingLength(prev, input.cuttingLength))
    return affected
  }

  function applyHolesCount(): number {
    const affected = countTileHolesCountTargets(lines)
    setLines((prev) => applyTileHolesCount(prev, input.holesCount))
    return affected
  }

  function applyScenario(
    application: TileScenarioApplication,
    target?: { zone?: EstimateZone },
  ): { label: string; addedCount: number; zoneName?: string; error?: string } {
    const zone = target?.zone
    const keys = resolveTileScenarioKeys(application)
    const unavailable = getUnavailableMappingKeys(keys, mapping)
    if (unavailable.length > 0) {
      return {
        label: '',
        addedCount: 0,
        error: formatUnavailableScenarioMessage(unavailable),
      }
    }

    let result = zone
      ? applyTileScenarioToZone(lines, zone, application)
      : applyTileScenario(lines, input, application)
    setLines((prev) => {
      result = zone
        ? applyTileScenarioToZone(prev, zone, application)
        : applyTileScenario(prev, input, application)
      return syncNewLinesFromMapping(prev, result.lines, TILE_SECTION_ID, mapping)
    })
    return {
      label: result.scenarioLabel,
      addedCount: result.addedCount,
      zoneName: zone?.name,
    }
  }

  function addManualLine(params: {
    title: string
    unit: string
    unitPrice: number
    quantity: number
  }) {
    setLines((prev) => [...prev, createManualTileEstimateLine(params)])
  }

  function removeManualLine(lineId: string) {
    setLines((prev) => removeRemovableEstimateLine(prev, lineId))
  }

  function addZonedLine(params: {
    priceKey: string
    quantity: number
    zoneName: string
    zoneId?: string
    comment?: string
  }): boolean {
    if (!params.zoneId && !params.zoneName.trim()) {
      let ok = false
      setLines((prev) => {
        const result = enableCanonicalEstimateLine(prev, params)
        ok = result.ok
        if (!ok) return prev
        return result.lines.map((line) =>
          line.priceKey === params.priceKey && !line.zoneId
            ? applyActivePriceToCanonicalLine(line, mapping)
            : line,
        )
      })
      return ok
    }
    const line = createZonedLineFromMapping(TILE_SECTION_ID, mapping, params)
    if (!line) return false
    setLines((prev) => [...prev, line])
    return true
  }

  function fillCatalogueQuantities(changes: readonly RoomFillChange[]) {
    setLines((previous) => applyUnifiedCatalogueFill(previous, changes))
  }

  function fillRoomWorkQuantities(zone: EstimateZone, changes: readonly RoomFillChange[]) {
    setLines((previous) => applyRoomWorkFill(previous, zone, changes))
  }

  function removeLinesByZoneId(zoneId: string) {
    setLines((prev) => prev.filter((line) => line.zoneId !== zoneId))
  }

  function syncZoneName(zoneId: string, zoneName: string) {
    const name = zoneName.trim()
    if (!name) return
    setLines((prev) =>
      prev.map((line) => (line.zoneId === zoneId ? { ...line, zoneName: name } : line)),
    )
  }

  function resetEstimate() {
    setInput(EMPTY_INPUT)
    setLines(buildTileEstimateLines(EMPTY_INPUT, { mapping }))
  }

  function replaceEstimate(next: { input: TileEstimateInput; lines: EstimateLine[] }) {
    setInput(next.input)
    setLines(next.lines)
  }

  return {
    input,
    lines,
    selectedCount,
    totalRub,
    materialsExcluded: true as const,
    patchInput,
    patchLine,
    toggleLine,
    applyCladArea,
    applyFloorArea,
    applyWallArea,
    applyCuttingLength,
    applyHolesCount,
    applyScenario,
    addManualLine,
    removeManualLine,
    addZonedLine,
    removeLinesByZoneId,
    fillRoomWorkQuantities,
    fillCatalogueQuantities,
    syncZoneName,
    resetEstimate,
    replaceEstimate,
  }
}

export type TileEstimateEditor = ReturnType<typeof useTileEstimateEditor>
