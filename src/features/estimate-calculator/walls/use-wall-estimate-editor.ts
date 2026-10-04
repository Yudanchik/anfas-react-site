import { applyUnifiedCatalogueFill } from '@/features/estimate-calculator/model/catalogue-volume-fill'
import {
  applyRoomWorkFill,
  type RoomFillChange,
} from '@/features/estimate-calculator/model/room-work-quantity'
import { useMemo, useState } from 'react'

import {
  applyActivePriceToCanonicalLine,
  applyWallCornersLength,
  applyWallDemolitionArea,
  applyWallFinishArea,
  applyWallPlasterArea,
  applyWallPuttyArea,
  applyWallScenario,
  applyWallScenarioToZone,
  applyWallSlopesLength,
  applyWallTotalAreaToSquareMeterWorks,
  buildWallEstimateLines,
  calculateSectionTotal,
  countEnabledLines,
  createManualWallEstimateLine,
  createZonedLineFromMapping,
  enableCanonicalEstimateLine,
  formatUnavailableScenarioMessage,
  getUnavailableMappingKeys,
  resolveWallScenarioKeys,
  wallScenarioForZone,
  syncNewLinesFromMapping,
  updateEstimateLine,
  removeRemovableEstimateLine,
  WALL_PRICE_MAPPING,
  WALL_SECTION_ID,
  type EstimateLine,
  type EstimateZone,
  type WallEstimateInput,
  type WallPriceMappingItem,
  type WallScenarioApplication,
  type WallScenarioApplyMode,
} from '@/entities/estimate'

import {
  countWallCornersTargets,
  countWallDemolitionAreaTargets,
  countWallFinishAreaTargets,
  countWallPlasterAreaTargets,
  countWallPuttyAreaTargets,
  countWallSlopesTargets,
  countWallTotalAreaTargets,
} from './wall-quick-action-feedback'

const EMPTY_INPUT: WallEstimateInput = {
  totalWallArea: 0,
  demolitionArea: 0,
  plasterArea: 0,
  puttyArea: 0,
  finishArea: 0,
  wallHeightM: 0,
  slopesLengthM: 0,
  cornersLengthM: 0,
  surveyorComment: '',
}

export type WallEstimateEditorInitial = {
  input?: WallEstimateInput
  lines?: EstimateLine[]
  mapping?: readonly WallPriceMappingItem[]
}

export function useWallEstimateEditor(initial: WallEstimateEditorInitial = {}) {
  const initialInput = initial.input ?? EMPTY_INPUT
  const mapping = initial.mapping ?? WALL_PRICE_MAPPING
  const [input, setInput] = useState<WallEstimateInput>(initialInput)
  const [lines, setLines] = useState<EstimateLine[]>(
    () => initial.lines ?? buildWallEstimateLines(initialInput, { mapping }),
  )

  const selectedCount = useMemo(() => countEnabledLines(lines), [lines])
  const totalRub = useMemo(() => calculateSectionTotal({ lines }), [lines])

  function patchInput(patch: Partial<WallEstimateInput>) {
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
    const affected = countWallTotalAreaTargets(lines)
    setLines((prev) => applyWallTotalAreaToSquareMeterWorks(prev, input.totalWallArea))
    return affected
  }

  function applyDemolitionArea(): number {
    const affected = countWallDemolitionAreaTargets(lines)
    setLines((prev) => applyWallDemolitionArea(prev, input.demolitionArea))
    return affected
  }

  function applyPlasterArea(): number {
    const affected = countWallPlasterAreaTargets(lines)
    setLines((prev) => applyWallPlasterArea(prev, input.plasterArea))
    return affected
  }

  function applyPuttyArea(): number {
    const affected = countWallPuttyAreaTargets(lines)
    setLines((prev) => applyWallPuttyArea(prev, input.puttyArea))
    return affected
  }

  function applyFinishArea(): number {
    const affected = countWallFinishAreaTargets(lines)
    setLines((prev) => applyWallFinishArea(prev, input.finishArea))
    return affected
  }

  function applyLinearMeters(): number {
    const slopes = countWallSlopesTargets(lines)
    const corners = countWallCornersTargets(lines)
    setLines((prev) => {
      let next = applyWallSlopesLength(prev, input.slopesLengthM)
      next = applyWallCornersLength(next, input.cornersLengthM)
      return next
    })
    return slopes + corners
  }

  function applyScenario(
    application: WallScenarioApplication,
    target?: { zone?: EstimateZone },
    mode: WallScenarioApplyMode = 'add',
  ): { label: string; addedCount: number; zoneName?: string; error?: string } {
    const zone = target?.zone
    const keys = resolveWallScenarioKeys(application)
    if (keys.length === 0)
      return {
        label: '',
        addedCount: 0,
        error:
          'По этим ответам нельзя безопасно подобрать работы. Проверьте состояние основания и финиш.',
      }
    const unavailable = getUnavailableMappingKeys(keys, mapping)
    if (unavailable.length > 0) {
      return {
        label: '',
        addedCount: 0,
        error: formatUnavailableScenarioMessage(unavailable),
      }
    }

    let result = zone
      ? applyWallScenarioToZone(lines, zone, application, mode)
      : applyWallScenario(lines, input, application)
    setLines((prev) => {
      result = zone
        ? applyWallScenarioToZone(prev, zone, application, mode)
        : applyWallScenario(prev, input, application)
      return syncNewLinesFromMapping(prev, result.lines, WALL_SECTION_ID, mapping)
    })
    return {
      label: result.scenarioLabel,
      addedCount: result.addedCount,
      zoneName: zone?.name,
    }
  }

  function applyScenarioToZones(
    application: WallScenarioApplication,
    targetZones: readonly EstimateZone[],
    mode: WallScenarioApplyMode = 'add',
  ): { addedCount: number; error?: string } {
    const scenarios = targetZones.map((zone) => ({
      zone,
      application: wallScenarioForZone(application, zone),
    }))
    if (
      scenarios.some(
        ({ application: effective }) => resolveWallScenarioKeys(effective).length === 0,
      )
    ) {
      return {
        addedCount: 0,
        error: 'Для одного из помещений не удалось подобрать безопасный сценарий.',
      }
    }
    const keys = scenarios.flatMap(({ application: effective }) =>
      resolveWallScenarioKeys(effective),
    )
    const unavailable = getUnavailableMappingKeys([...new Set(keys)], mapping)
    if (unavailable.length > 0) {
      return { addedCount: 0, error: formatUnavailableScenarioMessage(unavailable) }
    }
    setLines((prev) => {
      let next = prev
      for (const scenario of scenarios) {
        next = applyWallScenarioToZone(next, scenario.zone, scenario.application, mode).lines
      }
      return syncNewLinesFromMapping(prev, next, WALL_SECTION_ID, mapping)
    })
    return { addedCount: keys.length }
  }

  function addManualLine(params: {
    title: string
    unit: string
    unitPrice: number
    quantity: number
  }) {
    setLines((prev) => [...prev, createManualWallEstimateLine(params)])
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
    const line = createZonedLineFromMapping(WALL_SECTION_ID, mapping, params)
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
    setLines(buildWallEstimateLines(EMPTY_INPUT, { mapping }))
  }

  function replaceEstimate(next: { input: WallEstimateInput; lines: EstimateLine[] }) {
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
    applyTotalArea,
    applyDemolitionArea,
    applyPlasterArea,
    applyPuttyArea,
    applyFinishArea,
    applyLinearMeters,
    applyScenario,
    applyScenarioToZones,
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

export type WallEstimateEditor = ReturnType<typeof useWallEstimateEditor>
