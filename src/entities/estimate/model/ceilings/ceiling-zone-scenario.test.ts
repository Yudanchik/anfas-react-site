import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyCeilingScenario,
  applyCeilingScenarioToZone,
  buildCeilingEstimateLines,
  createEstimateZone,
  createZonedCeilingEstimateLine,
} from '@/entities/estimate'

const emptyInput = {
  totalCeilingArea: 0,
  demolitionArea: 0,
  plasterArea: 0,
  puttyArea: 0,
  finishArea: 0,
  surveyorComment: '',
}

describe('ceiling scenarios by zone', () => {
  it('applyCeilingScenarioToZone upserts clones and scopes conflicts', () => {
    const kitchen = createEstimateZone({
      name: 'Кухня',
      fields: {
        ceilingArea: 40,
        demolitionCeilingArea: 40,
        plasterCeilingArea: 40,
        puttyCeilingArea: 40,
        finishCeilingArea: 40,
      },
    })
    const bath = createEstimateZone({
      name: 'Санузел',
      fields: { demolitionCeilingArea: 10, ceilingArea: 10 },
    })

    let lines = buildCeilingEstimateLines(emptyInput)
    const bathLine = createZonedCeilingEstimateLine({
      priceKey: 'demolition-paint',
      quantity: 10,
      zoneName: bath.name,
      zoneId: bath.id,
    })
    assert.ok(bathLine)
    lines = [...lines, bathLine]

    const first = applyCeilingScenarioToZone(lines, kitchen, {
      state: 'demolition-only',
      finishTarget: 'none',
      demolitionCovering: 'paint',
    })
    lines = first.lines

    const kitchenDemo = lines.find(
      (line) => line.zoneId === kitchen.id && line.priceKey === 'demolition-paint',
    )
    assert.ok(kitchenDemo)
    assert.equal(kitchenDemo.enabled, true)
    assert.equal(kitchenDemo.quantity, 40)

    const canonical = lines.find((line) => line.id === 'ceilings:demolition-paint')
    assert.ok(canonical)
    assert.equal(canonical.enabled, false)

    const second = applyCeilingScenarioToZone(lines, kitchen, {
      state: 'demolition-only',
      finishTarget: 'none',
      demolitionCovering: 'plaster',
    })
    lines = second.lines

    const kitchenPaint = lines.find(
      (line) => line.zoneId === kitchen.id && line.priceKey === 'demolition-paint',
    )
    const kitchenPlaster = lines.find(
      (line) => line.zoneId === kitchen.id && line.priceKey === 'demolition-plaster',
    )
    assert.ok(kitchenPaint)
    assert.equal(kitchenPaint.enabled, false)
    assert.ok(kitchenPlaster)
    assert.equal(kitchenPlaster.enabled, true)

    const stillBath = lines.find((line) => line.id === bathLine.id)
    assert.ok(stillBath)
    assert.equal(stillBath.enabled, true)
  })

  it('object-level ceiling scenario skips zoned clones', () => {
    const kitchen = createEstimateZone({ name: 'Кухня', fields: { demolitionCeilingArea: 12 } })
    let lines = buildCeilingEstimateLines({
      ...emptyInput,
      demolitionArea: 50,
      totalCeilingArea: 50,
    })
    const zoned = createZonedCeilingEstimateLine({
      priceKey: 'demolition-plaster',
      quantity: 12,
      zoneName: kitchen.name,
      zoneId: kitchen.id,
    })
    assert.ok(zoned)
    lines = [...lines, zoned]

    const result = applyCeilingScenario(
      lines,
      { ...emptyInput, demolitionArea: 50, totalCeilingArea: 50 },
      { state: 'demolition-only', finishTarget: 'none', demolitionCovering: 'paint' },
    )
    const stillZoned = result.lines.find((line) => line.id === zoned.id)
    assert.ok(stillZoned)
    assert.equal(stillZoned.enabled, true)
    assert.equal(stillZoned.quantity, 12)
  })
})
