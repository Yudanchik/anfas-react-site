import { applyUnifiedCatalogueFill } from '@/features/estimate-calculator/model/catalogue-volume-fill'
import {
  applyRoomWorkFill,
  type RoomFillChange,
} from '@/features/estimate-calculator/model/room-work-quantity'
import { useMemo, useState } from 'react'

import {
  applyActivePriceToCanonicalLine,
  applyElectricCableLength,
  applyElectricLightPointsCount,
  applyElectricScenario,
  applyElectricScenarioToZone,
  applyElectricSocketsCount,
  applyElectricStrobeLength,
  applyElectricSwitchesCount,
  applyElectricWarmFloorArea,
  buildElectricEstimateLines,
  calculateSectionTotal,
  countEnabledLines,
  createManualElectricEstimateLine,
  createZonedLineFromMapping,
  electricInputFromZone,
  ELECTRIC_PRICE_MAPPING,
  ELECTRIC_SECTION_ID,
  enableCanonicalEstimateLine,
  formatUnavailableScenarioMessage,
  getUnavailableMappingKeys,
  removeRemovableEstimateLine,
  resolveMeasuredElectricScenarioKeys,
  syncNewLinesFromMapping,
  updateEstimateLine,
  type ElectricEstimateInput,
  type ElectricPriceMappingItem,
  type ElectricScenarioApplication,
  type EstimateLine,
  type EstimateZone,
} from '@/entities/estimate'

import {
  countElectricCableTargets,
  countElectricLightTargets,
  countElectricSocketTargets,
  countElectricStrobeTargets,
  countElectricSwitchTargets,
  countElectricWarmFloorTargets,
} from './electric-quick-action-feedback'

const EMPTY_INPUT: ElectricEstimateInput = {
  electricSocketsCount: 0,
  electricSwitchesCount: 0,
  electricLightPointsCount: 0,
  electricDataPointsCount: 0,
  electricStrobeLength: 0,
  electricCableLength: 0,
  electricSocketBoxesCount: 0,
  electricJunctionBoxesCount: 0,
  electricPanelModulesCount: 0,
  electricWarmFloorArea: 0,
  electricApplianceConnectionsCount: 0,
  surveyorComment: '',
}

export type ElectricEstimateEditorInitial = {
  input?: ElectricEstimateInput
  lines?: EstimateLine[]
  mapping?: readonly ElectricPriceMappingItem[]
}

export function useElectricEstimateEditor(initial: ElectricEstimateEditorInitial = {}) {
  const initialInput = initial.input ?? EMPTY_INPUT
  const mapping = initial.mapping ?? ELECTRIC_PRICE_MAPPING
  const [input, setInput] = useState<ElectricEstimateInput>(initialInput)
  const [lines, setLines] = useState<EstimateLine[]>(
    () => initial.lines ?? buildElectricEstimateLines(initialInput, { mapping }),
  )

  const selectedCount = useMemo(() => countEnabledLines(lines), [lines])
  const totalRub = useMemo(() => calculateSectionTotal({ lines }), [lines])

  function patchInput(patch: Partial<ElectricEstimateInput>) {
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

  function applySocketsCount(): number {
    const affected = countElectricSocketTargets(lines)
    setLines((prev) =>
      applyElectricSocketsCount(prev, input.electricSocketsCount, input.electricSwitchesCount),
    )
    return affected
  }

  function applySwitchesCount(): number {
    const affected = countElectricSwitchTargets(lines)
    setLines((prev) =>
      applyElectricSwitchesCount(prev, input.electricSwitchesCount, input.electricSocketsCount),
    )
    return affected
  }

  function applyLightPointsCount(): number {
    const affected = countElectricLightTargets(lines)
    setLines((prev) => applyElectricLightPointsCount(prev, input.electricLightPointsCount))
    return affected
  }

  function applyStrobeLength(): number {
    const affected = countElectricStrobeTargets(lines)
    setLines((prev) => applyElectricStrobeLength(prev, input.electricStrobeLength))
    return affected
  }

  function applyCableLength(): number {
    const affected = countElectricCableTargets(lines)
    setLines((prev) => applyElectricCableLength(prev, input.electricCableLength))
    return affected
  }

  function applyWarmFloorArea(): number {
    const affected = countElectricWarmFloorTargets(lines)
    setLines((prev) => applyElectricWarmFloorArea(prev, input.electricWarmFloorArea))
    return affected
  }

  function applyScenario(
    application: ElectricScenarioApplication,
    target?: { zone?: EstimateZone },
  ): { label: string; addedCount: number; zoneName?: string; error?: string } {
    const zone = target?.zone
    const scenarioInput = zone ? electricInputFromZone(zone) : input
    const keys = resolveMeasuredElectricScenarioKeys(application, scenarioInput)
    const unavailable = getUnavailableMappingKeys(keys, mapping)
    if (unavailable.length > 0) {
      return {
        label: '',
        addedCount: 0,
        error: formatUnavailableScenarioMessage(unavailable),
      }
    }

    let result = zone
      ? applyElectricScenarioToZone(lines, zone, application)
      : applyElectricScenario(lines, input, application)
    setLines((prev) => {
      result = zone
        ? applyElectricScenarioToZone(prev, zone, application)
        : applyElectricScenario(prev, input, application)
      return syncNewLinesFromMapping(prev, result.lines, ELECTRIC_SECTION_ID, mapping)
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
    setLines((prev) => [...prev, createManualElectricEstimateLine(params)])
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
    const line = createZonedLineFromMapping(ELECTRIC_SECTION_ID, mapping, params)
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
    setLines(buildElectricEstimateLines(EMPTY_INPUT, { mapping }))
  }

  function replaceEstimate(next: { input: ElectricEstimateInput; lines: EstimateLine[] }) {
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
    applySocketsCount,
    applySwitchesCount,
    applyLightPointsCount,
    applyStrobeLength,
    applyCableLength,
    applyWarmFloorArea,
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

export type ElectricEstimateEditor = ReturnType<typeof useElectricEstimateEditor>
