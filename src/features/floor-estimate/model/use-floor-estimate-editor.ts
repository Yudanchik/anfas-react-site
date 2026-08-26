import { useMemo, useState } from 'react'

import {
  applyDemolitionAreaToDemolitionWorks,
  applyScreedAreaToScreedWorks,
  applyTotalAreaToSquareMeterWorks,
  applyWetAreaToWaterproofing,
  buildFloorEstimateLines,
  calculateLineTotal,
  calculateSectionTotal,
  countEnabledLines,
  createManualEstimateLine,
  getFloorRecommendation,
  updateEstimateLine,
  type EstimateLine,
  type FloorEstimateInput,
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

export function useFloorEstimateEditor(initialInput: FloorEstimateInput = EMPTY_INPUT) {
  const [input, setInput] = useState<FloorEstimateInput>(initialInput)
  const [lines, setLines] = useState<EstimateLine[]>(() => buildFloorEstimateLines(initialInput))

  const recommendation = useMemo(
    () => getFloorRecommendation(input.avgDeltaMm),
    [input.avgDeltaMm],
  )
  const selectedCount = useMemo(() => countEnabledLines(lines), [lines])
  const totalRub = useMemo(() => calculateSectionTotal({ lines }), [lines])

  function patchInput(patch: Partial<FloorEstimateInput>) {
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

  function addManualLine(params: {
    title: string
    unit: string
    unitPrice: number
    quantity: number
  }) {
    setLines((prev) => [...prev, createManualEstimateLine(params)])
  }

  function resetEstimate() {
    setInput(EMPTY_INPUT)
    setLines(buildFloorEstimateLines(EMPTY_INPUT))
  }

  function lineTotal(line: EstimateLine) {
    return calculateLineTotal(line)
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
    addManualLine,
    resetEstimate,
    lineTotal,
  }
}

export type FloorEstimateEditor = ReturnType<typeof useFloorEstimateEditor>
