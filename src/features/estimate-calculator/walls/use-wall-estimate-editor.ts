import { useMemo, useState } from 'react'

import {
  applyWallCornersLength,
  applyWallDemolitionArea,
  applyWallFinishArea,
  applyWallPlasterArea,
  applyWallPuttyArea,
  applyWallScenario,
  applyWallSlopesLength,
  applyWallTotalAreaToSquareMeterWorks,
  buildWallEstimateLines,
  calculateSectionTotal,
  countEnabledLines,
  createManualWallEstimateLine,
  updateEstimateLine,
  type EstimateLine,
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

export function useWallEstimateEditor(initialInput: WallEstimateInput = EMPTY_INPUT) {
  const [input, setInput] = useState<WallEstimateInput>(initialInput)
  const [lines, setLines] = useState<EstimateLine[]>(() => buildWallEstimateLines(initialInput))

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
  ): { label: string; addedCount: number } {
    let result = applyWallScenario(lines, input, application)
    setLines((prev) => {
      result = applyWallScenario(prev, input, application)
      return result.lines
    })
    return { label: result.scenarioLabel, addedCount: result.addedCount }
  }

  function addManualLine(params: {
    title: string
    unit: string
    unitPrice: number
    quantity: number
  }) {
    setLines((prev) => [...prev, createManualWallEstimateLine(params)])
  }

  function resetEstimate() {
    setInput(EMPTY_INPUT)
    setLines(buildWallEstimateLines(EMPTY_INPUT))
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
    resetEstimate,
  }
}

export type WallEstimateEditor = ReturnType<typeof useWallEstimateEditor>
