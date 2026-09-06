import { useMemo, useState } from 'react'

import {
  applyCeilingDemolitionArea,
  applyCeilingFinishArea,
  applyCeilingPlasterArea,
  applyCeilingPuttyArea,
  applyCeilingScenario,
  applyCeilingScenarioToZone,
  applyCeilingTotalAreaToSquareMeterWorks,
  buildCeilingEstimateLines,
  calculateSectionTotal,
  countEnabledLines,
  createManualCeilingEstimateLine,
  createZonedCeilingEstimateLine,
  enableCanonicalEstimateLine,
  removeRemovableEstimateLine,
  updateEstimateLine,
  type CeilingEstimateInput,
  type CeilingScenarioApplication,
  type EstimateLine,
  type EstimateZone,
} from '@/entities/estimate'

import {
  countCeilingDemolitionAreaTargets,
  countCeilingFinishAreaTargets,
  countCeilingPlasterAreaTargets,
  countCeilingPuttyAreaTargets,
  countCeilingTotalAreaTargets,
} from './ceiling-quick-action-feedback'

const EMPTY_INPUT: CeilingEstimateInput = {
  totalCeilingArea: 0,
  demolitionArea: 0,
  plasterArea: 0,
  puttyArea: 0,
  finishArea: 0,
  surveyorComment: '',
}

export type CeilingEstimateEditorInitial = {
  input?: CeilingEstimateInput
  lines?: EstimateLine[]
}

export function useCeilingEstimateEditor(initial: CeilingEstimateEditorInitial = {}) {
  const initialInput = initial.input ?? EMPTY_INPUT
  const [input, setInput] = useState<CeilingEstimateInput>(initialInput)
  const [lines, setLines] = useState<EstimateLine[]>(
    () => initial.lines ?? buildCeilingEstimateLines(initialInput),
  )

  const selectedCount = useMemo(() => countEnabledLines(lines), [lines])
  const totalRub = useMemo(() => calculateSectionTotal({ lines }), [lines])

  function patchInput(patch: Partial<CeilingEstimateInput>) {
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
    const affected = countCeilingTotalAreaTargets(lines)
    setLines((prev) => applyCeilingTotalAreaToSquareMeterWorks(prev, input.totalCeilingArea))
    return affected
  }

  function applyDemolitionArea(): number {
    const affected = countCeilingDemolitionAreaTargets(lines)
    setLines((prev) => applyCeilingDemolitionArea(prev, input.demolitionArea))
    return affected
  }

  function applyPlasterArea(): number {
    const affected = countCeilingPlasterAreaTargets(lines)
    setLines((prev) => applyCeilingPlasterArea(prev, input.plasterArea))
    return affected
  }

  function applyPuttyArea(): number {
    const affected = countCeilingPuttyAreaTargets(lines)
    setLines((prev) => applyCeilingPuttyArea(prev, input.puttyArea))
    return affected
  }

  function applyFinishArea(): number {
    const affected = countCeilingFinishAreaTargets(lines)
    setLines((prev) => applyCeilingFinishArea(prev, input.finishArea))
    return affected
  }

  function applyScenario(
    application: CeilingScenarioApplication,
    target?: { zone?: EstimateZone },
  ): { label: string; addedCount: number; zoneName?: string } {
    const zone = target?.zone
    let result = zone
      ? applyCeilingScenarioToZone(lines, zone, application)
      : applyCeilingScenario(lines, input, application)
    setLines((prev) => {
      result = zone
        ? applyCeilingScenarioToZone(prev, zone, application)
        : applyCeilingScenario(prev, input, application)
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
    setLines((prev) => [...prev, createManualCeilingEstimateLine(params)])
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
    const line = createZonedCeilingEstimateLine(params)
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
    setLines(buildCeilingEstimateLines(EMPTY_INPUT))
  }

  function replaceEstimate(next: { input: CeilingEstimateInput; lines: EstimateLine[] }) {
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

export type CeilingEstimateEditor = ReturnType<typeof useCeilingEstimateEditor>
