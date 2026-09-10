import { useMemo, useState } from 'react'

import {
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
  createZonedWallEstimateLine,
  enableCanonicalEstimateLine,
  updateEstimateLine,
  removeRemovableEstimateLine,
  type EstimateLine,
  type EstimateZone,
  type WallEstimateInput,
  type WallScenarioApplication,
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
}

export function useWallEstimateEditor(initial: WallEstimateEditorInitial = {}) {
  const initialInput = initial.input ?? EMPTY_INPUT
  const [input, setInput] = useState<WallEstimateInput>(initialInput)
  const [lines, setLines] = useState<EstimateLine[]>(
    () => initial.lines ?? buildWallEstimateLines(initialInput),
  )

  const selectedCount = useMemo(() => countEnabledLines(lines), [lines])
  const totalRub = useMemo(() => calculateSectionTotal({ lines }), [lines])

  function patchInput(patch: Partial<WallEstimateInput>) {
    setInput((prev) => ({ ...prev, ...patch }))
  }

  function patchLine(
    lineId: string,
    patch: Partial<
      Pick<EstimateLine, 'enabled' | 'quantity' | 'unitPrice' | 'coefficient' | 'comment' | 'title' | 'unit'>
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
  ): { label: string; addedCount: number; zoneName?: string } {
    const zone = target?.zone
    let result = zone
      ? applyWallScenarioToZone(lines, zone, application)
      : applyWallScenario(lines, input, application)
    setLines((prev) => {
      result = zone
        ? applyWallScenarioToZone(prev, zone, application)
        : applyWallScenario(prev, input, application)
      return result.lines
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
        return result.lines
      })
      return ok
    }
    const line = createZonedWallEstimateLine(params)
    if (!line) return false
    setLines((prev) => [...prev, line])
    return true
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
    setLines(buildWallEstimateLines(EMPTY_INPUT))
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
    addManualLine,
    removeManualLine,
    addZonedLine,
    removeLinesByZoneId,
    syncZoneName,
    resetEstimate,
    replaceEstimate,
  }
}

export type WallEstimateEditor = ReturnType<typeof useWallEstimateEditor>
