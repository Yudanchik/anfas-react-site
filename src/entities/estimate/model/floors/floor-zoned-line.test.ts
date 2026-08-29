import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyFloorPreset,
  buildFloorEstimateLines,
  calculateLineTotal,
  createZonedFloorEstimateLine,
  disableConflictingAlternatives,
  isZonedEstimateLine,
} from '../index'

const emptyInput = {
  totalFloorArea: 0,
  demolitionArea: 0,
  screedArea: 0,
  wetZonesArea: 0,
  avgDeltaMm: 0,
}

describe('zoned floor estimate lines', () => {
  it('creates an enabled clone from mapping with unique id and shared priceKey', () => {
    const a = createZonedFloorEstimateLine({
      priceKey: 'demolition-laminate',
      quantity: 20,
      zoneName: 'Комната 1',
    })
    const b = createZonedFloorEstimateLine({
      priceKey: 'demolition-laminate',
      quantity: 12,
      zoneName: 'Коридор',
      comment: 'остатки',
    })

    assert.ok(a)
    assert.ok(b)
    assert.notEqual(a.id, b.id)
    assert.equal(a.priceKey, 'demolition-laminate')
    assert.equal(b.priceKey, 'demolition-laminate')
    assert.equal(a.zoneName, 'Комната 1')
    assert.equal(b.zoneName, 'Коридор')
    assert.equal(b.comment, 'остатки')
    assert.equal(a.enabled, true)
    assert.ok(isZonedEstimateLine(a))
    assert.ok(isZonedEstimateLine(b))
  })

  it('uses the same line total formula as canonical rows', () => {
    const zoned = createZonedFloorEstimateLine({
      priceKey: 'demolition-laminate',
      quantity: 10,
      zoneName: 'Кухня',
    })
    assert.ok(zoned)
    assert.equal(calculateLineTotal(zoned), Math.round(10 * 300 * 1))
  })

  it('keeps multiple clones with the same priceKey when conflicts run', () => {
    let lines = buildFloorEstimateLines({ ...emptyInput, demolitionArea: 40 })
    const kitchen = createZonedFloorEstimateLine({
      priceKey: 'demolition-laminate',
      quantity: 20,
      zoneName: 'Кухня',
    })
    const bath = createZonedFloorEstimateLine({
      priceKey: 'demolition-floor-tile',
      quantity: 5,
      zoneName: 'Санузел',
    })
    assert.ok(kitchen)
    assert.ok(bath)
    lines = [...lines, kitchen, bath]

    lines = disableConflictingAlternatives(lines, ['demolition-linoleum'])
    const kitchenAfter = lines.find((line) => line.id === kitchen.id)
    const bathAfter = lines.find((line) => line.id === bath.id)
    assert.ok(kitchenAfter?.enabled)
    assert.ok(bathAfter?.enabled)
    assert.equal(kitchenAfter?.quantity, 20)
    assert.equal(bathAfter?.quantity, 5)
  })

  it('does not rewrite zoned clones when applying a floor preset', () => {
    let lines = buildFloorEstimateLines({ ...emptyInput, demolitionArea: 40 })
    const zoned = createZonedFloorEstimateLine({
      priceKey: 'demolition-laminate',
      quantity: 20,
      zoneName: 'Комната',
    })
    assert.ok(zoned)
    lines = [...lines, zoned]

    const result = applyFloorPreset(lines, { ...emptyInput, demolitionArea: 40 }, {
      presetId: 'demolition-covering',
      covering: 'linoleum',
    })

    const still = result.lines.find((line) => line.id === zoned.id)
    assert.ok(still)
    assert.equal(still.enabled, true)
    assert.equal(still.quantity, 20)
    assert.equal(still.priceKey, 'demolition-laminate')
  })
})
