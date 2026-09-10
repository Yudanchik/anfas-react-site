import { useMemo, useState } from 'react'

import {
  applyPlumbingScenario,
  applyPlumbingScenarioToZone,
  applyPlumbingSewerPipeLength,
  applyPlumbingSewerPointsCount,
  applyPlumbingWarmFloorArea,
  applyPlumbingWaterPipeLength,
  applyPlumbingWaterPointsCount,
  buildPlumbingEstimateLines,
  calculateSectionTotal,
  countEnabledLines,
  createManualPlumbingEstimateLine,
  createZonedPlumbingEstimateLine,
  enableCanonicalEstimateLine,
  removeRemovableEstimateLine,
  updateEstimateLine,
  type EstimateLine,
  type EstimateZone,
  type PlumbingEstimateInput,
  type PlumbingScenarioApplication,
} from '@/entities/estimate'

import {
  countPlumbingSewerPipeTargets,
  countPlumbingSewerPointsTargets,
  countPlumbingWarmFloorTargets,
  countPlumbingWaterPipeTargets,
  countPlumbingWaterPointsTargets,
} from './plumbing-quick-action-feedback'

const EMPTY_INPUT: PlumbingEstimateInput = {
  plumbingWaterPointsCount: 0,
  plumbingSewerPointsCount: 0,
  plumbingWaterPipeLength: 0,
  plumbingSewerPipeLength: 0,
  plumbingCollectorsCount: 0,
  plumbingToiletsCount: 0,
  plumbingSinksCount: 0,
  plumbingBathtubsCount: 0,
  plumbingShowersCount: 0,
  plumbingMixersCount: 0,
  plumbingInstallationsCount: 0,
  plumbingDrainsCount: 0,
  plumbingWasherConnectionsCount: 0,
  plumbingDishwasherConnectionsCount: 0,
  plumbingWaterHeatersCount: 0,
  plumbingTowelWarmersCount: 0,
  plumbingWarmFloorArea: 0,
  surveyorComment: '',
}

export type PlumbingEstimateEditorInitial = {
  input?: PlumbingEstimateInput
  lines?: EstimateLine[]
}

export function usePlumbingEstimateEditor(initial: PlumbingEstimateEditorInitial = {}) {
  const initialInput = initial.input ?? EMPTY_INPUT
  const [input, setInput] = useState<PlumbingEstimateInput>(initialInput)
  const [lines, setLines] = useState<EstimateLine[]>(
    () => initial.lines ?? buildPlumbingEstimateLines(initialInput),
  )

  const selectedCount = useMemo(() => countEnabledLines(lines), [lines])
  const totalRub = useMemo(() => calculateSectionTotal({ lines }), [lines])

  function patchInput(patch: Partial<PlumbingEstimateInput>) {
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

  function applyWaterPipeLength(): number {
    const affected = countPlumbingWaterPipeTargets(lines)
    setLines((prev) => applyPlumbingWaterPipeLength(prev, input.plumbingWaterPipeLength))
    return affected
  }

  function applySewerPipeLength(): number {
    const affected = countPlumbingSewerPipeTargets(lines)
    setLines((prev) => applyPlumbingSewerPipeLength(prev, input.plumbingSewerPipeLength))
    return affected
  }

  function applyWaterPointsCount(): number {
    const affected = countPlumbingWaterPointsTargets(lines)
    setLines((prev) => applyPlumbingWaterPointsCount(prev, input.plumbingWaterPointsCount))
    return affected
  }

  function applySewerPointsCount(): number {
    const affected = countPlumbingSewerPointsTargets(lines)
    setLines((prev) => applyPlumbingSewerPointsCount(prev, input.plumbingSewerPointsCount))
    return affected
  }

  function applyWarmFloorArea(): number {
    const affected = countPlumbingWarmFloorTargets(lines)
    setLines((prev) => applyPlumbingWarmFloorArea(prev, input.plumbingWarmFloorArea))
    return affected
  }

  function applyScenario(
    application: PlumbingScenarioApplication,
    target?: { zone?: EstimateZone },
  ): { label: string; addedCount: number; zoneName?: string } {
    const zone = target?.zone
    let result = zone
      ? applyPlumbingScenarioToZone(lines, zone, application)
      : applyPlumbingScenario(lines, input, application)
    setLines((prev) => {
      result = zone
        ? applyPlumbingScenarioToZone(prev, zone, application)
        : applyPlumbingScenario(prev, input, application)
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
    setLines((prev) => [...prev, createManualPlumbingEstimateLine(params)])
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
    const line = createZonedPlumbingEstimateLine(params)
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
    setLines(buildPlumbingEstimateLines(EMPTY_INPUT))
  }

  function replaceEstimate(next: { input: PlumbingEstimateInput; lines: EstimateLine[] }) {
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
    applyWaterPipeLength,
    applySewerPipeLength,
    applyWaterPointsCount,
    applySewerPointsCount,
    applyWarmFloorArea,
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

export type PlumbingEstimateEditor = ReturnType<typeof usePlumbingEstimateEditor>
