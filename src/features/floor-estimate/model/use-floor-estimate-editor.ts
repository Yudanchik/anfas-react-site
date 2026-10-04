import { applyUnifiedCatalogueFill } from '@/features/estimate-calculator/model/catalogue-volume-fill'
import {
  applyRoomWorkFill,
  type RoomFillChange,
} from '@/features/estimate-calculator/model/room-work-quantity'
import { useMemo, useState } from 'react'

import {
  applyActivePriceToCanonicalLine,
  applyDemolitionAreaToDemolitionWorks,
  applyFloorPreset,
  applyFloorPresetToZone,
  applyScreedAreaToScreedWorks,
  applyTotalAreaToSquareMeterWorks,
  applyWetAreaToWaterproofing,
  buildFloorEstimateLines,
  calculateSectionTotal,
  countEnabledLines,
  createManualEstimateLine,
  createZonedLineFromMapping,
  enableCanonicalEstimateLine,
  FLOOR_PRICE_MAPPING,
  FLOOR_SECTION_ID,
  formatUnavailableScenarioMessage,
  getFloorRecommendation,
  getUnavailableMappingKeys,
  removeRemovableEstimateLine,
  resolveFloorPresetKeys,
  syncNewLinesFromMapping,
  updateEstimateLine,
  type EstimateLine,
  type EstimateZone,
  type FloorEstimateInput,
  type FloorPriceMappingItem,
  type FloorPresetApplication,
} from '@/entities/estimate'

import {
  countDemolitionAreaTargets,
  countScreedAreaTargets,
  countTotalAreaTargets,
  countWetAreaTargets,
} from './quick-action-feedback'

const EMPTY_INPUT: FloorEstimateInput = {
  totalFloorArea: 0,
  demolitionArea: 0,
  screedArea: 0,
  wetZonesArea: 0,
  avgDeltaMm: 0,
  surveyorComment: '',
}

export type FloorEstimateEditorInitial = {
  input?: FloorEstimateInput
  lines?: EstimateLine[]
  mapping?: readonly FloorPriceMappingItem[]
}

export type FloorScenarioApplyResult = {
  label: string
  addedCount: number
  zoneName?: string
  error?: string
}

export function useFloorEstimateEditor(initial: FloorEstimateEditorInitial = {}) {
  const initialInput = initial.input ?? EMPTY_INPUT
  const mapping = initial.mapping ?? FLOOR_PRICE_MAPPING
  const [input, setInput] = useState<FloorEstimateInput>(initialInput)
  const [lines, setLines] = useState<EstimateLine[]>(
    () => initial.lines ?? buildFloorEstimateLines(initialInput, { mapping }),
  )

  const recommendation = useMemo(() => getFloorRecommendation(input.avgDeltaMm), [input.avgDeltaMm])
  const selectedCount = useMemo(() => countEnabledLines(lines), [lines])
  const totalRub = useMemo(() => calculateSectionTotal({ lines }), [lines])

  function patchInput(patch: Partial<FloorEstimateInput>) {
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

  function applyTotalArea(): number {
    const affected = countTotalAreaTargets(lines)
    setLines((prev) => applyTotalAreaToSquareMeterWorks(prev, input.totalFloorArea))
    return affected
  }

  function applyDemolitionArea(): number {
    const affected = countDemolitionAreaTargets(lines)
    setLines((prev) => applyDemolitionAreaToDemolitionWorks(prev, input.demolitionArea))
    return affected
  }

  function applyScreedArea(): number {
    const affected = countScreedAreaTargets(lines)
    setLines((prev) => applyScreedAreaToScreedWorks(prev, input.screedArea))
    return affected
  }

  function applyWetArea(): number {
    const affected = countWetAreaTargets(lines)
    setLines((prev) => applyWetAreaToWaterproofing(prev, input.wetZonesArea))
    return affected
  }

  function applyPreset(
    application: FloorPresetApplication,
    target?: { zone?: EstimateZone },
  ): FloorScenarioApplyResult {
    const zone = target?.zone
    const keys = resolveFloorPresetKeys(application)
    const unavailable = getUnavailableMappingKeys(keys, mapping)
    if (unavailable.length > 0) {
      return {
        label: '',
        addedCount: 0,
        error: formatUnavailableScenarioMessage(unavailable),
      }
    }

    let result = zone
      ? applyFloorPresetToZone(lines, zone, application)
      : applyFloorPreset(lines, input, application)
    setLines((prev) => {
      result = zone
        ? applyFloorPresetToZone(prev, zone, application)
        : applyFloorPreset(prev, input, application)
      return syncNewLinesFromMapping(prev, result.lines, FLOOR_SECTION_ID, mapping)
    })
    return {
      label: result.presetLabel,
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
    setLines((prev) => [...prev, createManualEstimateLine(params)])
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
    const line = createZonedLineFromMapping(FLOOR_SECTION_ID, mapping, params)
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
    setLines(buildFloorEstimateLines(EMPTY_INPUT, { mapping }))
  }

  function replaceEstimate(next: { input: FloorEstimateInput; lines: EstimateLine[] }) {
    setInput(next.input)
    setLines(next.lines)
  }

  return {
    input,
    lines,
    recommendation,
    selectedCount,
    totalRub,
    materialsExcluded: true as const,
    patchInput,
    patchLine,
    toggleLine,
    applyTotalArea,
    applyDemolitionArea,
    applyScreedArea,
    applyWetArea,
    applyPreset,
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

export type FloorEstimateEditor = ReturnType<typeof useFloorEstimateEditor>
