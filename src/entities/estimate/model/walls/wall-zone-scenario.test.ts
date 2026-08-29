import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyWallScenario,
  applyWallScenarioToZone,
  buildWallEstimateLines,
  createEstimateZone,
  createZonedWallEstimateLine,
} from '@/entities/estimate'

const emptyInput = {
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

describe('wall scenarios by zone', () => {
  it('applyWallScenarioToZone upserts clones and scopes conflicts', () => {
    const kitchen = createEstimateZone({
      name: 'Кухня',
      fields: {
        wallArea: 40,
        demolitionWallArea: 40,
        plasterArea: 40,
        puttyArea: 40,
        finishArea: 40,
      },
    })
    const bath = createEstimateZone({
      name: 'Санузел',
      fields: { demolitionWallArea: 10, wallArea: 10 },
    })

    let lines = buildWallEstimateLines(emptyInput)
    const bathLine = createZonedWallEstimateLine({
      priceKey: 'demolition-wallpaper',
      quantity: 10,
      zoneName: bath.name,
      zoneId: bath.id,
    })
    assert.ok(bathLine)
    lines = [...lines, bathLine]

    const first = applyWallScenarioToZone(lines, kitchen, {
      state: 'demolition-only',
      finishTarget: 'none',
      demolitionCovering: 'wallpaper',
    })
    lines = first.lines

    const kitchenDemo = lines.find(
      (line) => line.zoneId === kitchen.id && line.priceKey === 'demolition-wallpaper',
    )
    assert.ok(kitchenDemo)
    assert.equal(kitchenDemo.enabled, true)
    assert.equal(kitchenDemo.quantity, 40)

    const canonical = lines.find((line) => line.id === 'walls:demolition-wallpaper')
    assert.ok(canonical)
    assert.equal(canonical.enabled, false)

    const second = applyWallScenarioToZone(lines, kitchen, {
      state: 'demolition-only',
      finishTarget: 'none',
      demolitionCovering: 'paint',
    })
    lines = second.lines

    const kitchenWallpaper = lines.find(
      (line) => line.zoneId === kitchen.id && line.priceKey === 'demolition-wallpaper',
    )
    const kitchenPaint = lines.find(
      (line) => line.zoneId === kitchen.id && line.priceKey === 'demolition-paint',
    )
    assert.ok(kitchenWallpaper)
    assert.equal(kitchenWallpaper.enabled, false)
    assert.ok(kitchenPaint)
    assert.equal(kitchenPaint.enabled, true)

    const stillBath = lines.find((line) => line.id === bathLine.id)
    assert.ok(stillBath)
    assert.equal(stillBath.enabled, true)
  })

  it('object-level wall scenario skips zoned clones', () => {
    const kitchen = createEstimateZone({ name: 'Кухня', fields: { demolitionWallArea: 12 } })
    let lines = buildWallEstimateLines({ ...emptyInput, demolitionArea: 50, totalWallArea: 50 })
    const zoned = createZonedWallEstimateLine({
      priceKey: 'demolition-paint',
      quantity: 12,
      zoneName: kitchen.name,
      zoneId: kitchen.id,
    })
    assert.ok(zoned)
    lines = [...lines, zoned]

    const result = applyWallScenario(lines, { ...emptyInput, demolitionArea: 50, totalWallArea: 50 }, {
      state: 'demolition-only',
      finishTarget: 'none',
      demolitionCovering: 'wallpaper',
    })
    const stillZoned = result.lines.find((line) => line.id === zoned.id)
    assert.ok(stillZoned)
    assert.equal(stillZoned.enabled, true)
    assert.equal(stillZoned.quantity, 12)
  })
})
