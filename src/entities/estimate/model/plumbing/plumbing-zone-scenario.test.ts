import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyPlumbingScenario,
  applyPlumbingScenarioToZone,
  buildPlumbingEstimateLines,
  createEstimateZone,
  createZonedPlumbingEstimateLine,
} from '@/entities/estimate'

const emptyInput = {
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

describe('plumbing scenarios by zone', () => {
  it('applyPlumbingScenarioToZone upserts clones and scopes conflicts', () => {
    const bathroom = createEstimateZone({
      name: 'Санузел',
      fields: {
        zoneType: 'bathroom',
        plumbingToiletsCount: 1,
        plumbingSinksCount: 1,
        plumbingBathtubsCount: 1,
        plumbingMixersCount: 2,
        plumbingInstallationsCount: 1,
        plumbingWaterPipeLength: 12,
        plumbingSewerPipeLength: 8,
        plumbingWaterPointsCount: 4,
      },
    })
    const kitchen = createEstimateZone({
      name: 'Кухня',
      fields: { zoneType: 'kitchen', plumbingSinksCount: 1 },
    })

    let lines = buildPlumbingEstimateLines(emptyInput)
    const kitchenLine = createZonedPlumbingEstimateLine({
      priceKey: 'finish-kitchen-sink',
      quantity: 1,
      zoneName: kitchen.name,
      zoneId: kitchen.id,
    })
    assert.ok(kitchenLine)
    lines = [...lines, kitchenLine]

    const first = applyPlumbingScenarioToZone(lines, bathroom, { state: 'toilet-zone' })
    lines = first.lines

    const soft = lines.find(
      (line) => line.zoneId === bathroom.id && line.priceKey === 'finish-toilet-soft',
    )
    assert.ok(soft)
    assert.equal(soft.enabled, true)
    assert.equal(soft.quantity, 1)

    const canonical = lines.find((line) => line.id === 'plumbing:finish-toilet-soft')
    assert.ok(canonical)
    assert.equal(canonical.enabled, false)

    const kitchenClone = lines.find(
      (line) => line.zoneId === kitchen.id && line.priceKey === 'finish-kitchen-sink',
    )
    assert.ok(kitchenClone)
    assert.equal(kitchenClone.enabled, true)

    const second = applyPlumbingScenarioToZone(lines, bathroom, { state: 'toilet-zone' })
    const softClones = second.lines.filter(
      (line) => line.zoneId === bathroom.id && line.priceKey === 'finish-toilet-soft',
    )
    assert.equal(softClones.length, 1)
  })

  it('object-level plumbing scenario skips zoned clones', () => {
    const zone = createEstimateZone({
      name: 'Кухня',
      fields: { zoneType: 'kitchen', plumbingSinksCount: 1 },
    })
    let lines = buildPlumbingEstimateLines(emptyInput)
    const zoned = createZonedPlumbingEstimateLine({
      priceKey: 'finish-kitchen-sink',
      quantity: 1,
      zoneName: zone.name,
      zoneId: zone.id,
    })
    assert.ok(zoned)
    lines = [...lines, zoned]

    const applied = applyPlumbingScenario(lines, emptyInput, { state: 'kitchen' })
    const zonedAfter = applied.lines.find(
      (line) => line.zoneId === zone.id && line.priceKey === 'finish-kitchen-sink',
    )
    assert.ok(zonedAfter)
    assert.equal(zonedAfter.enabled, true)
    assert.equal(zonedAfter.quantity, 1)

    const canonical = applied.lines.find((line) => line.id === 'plumbing:finish-kitchen-sink')
    assert.ok(canonical)
    assert.equal(canonical.enabled, true)
  })

  it('zoned upsert does not duplicate the same priceKey in a zone', () => {
    const zone = createEstimateZone({
      name: 'Санузел',
      fields: {
        zoneType: 'bathroom',
        plumbingToiletsCount: 1,
        plumbingInstallationsCount: 1,
        plumbingWaterPipeLength: 10,
        plumbingSewerPipeLength: 8,
        plumbingWaterPointsCount: 2,
      },
    })
    const lines = buildPlumbingEstimateLines(emptyInput)
    const first = applyPlumbingScenarioToZone(lines, zone, { state: 'toilet-zone' })
    const second = applyPlumbingScenarioToZone(first.lines, zone, { state: 'toilet-zone' })
    const keys = second.lines
      .filter((line) => line.zoneId === zone.id)
      .map((line) => line.priceKey)
    assert.equal(keys.length, new Set(keys).size)
  })

  it('bath material conflict is scoped by zone', () => {
    const zoneA = createEstimateZone({
      name: 'С/у 1',
      fields: { zoneType: 'bathroom', plumbingBathtubsCount: 1 },
    })
    const zoneB = createEstimateZone({
      name: 'С/у 2',
      fields: { zoneType: 'bathroom', plumbingBathtubsCount: 1 },
    })
    let lines = buildPlumbingEstimateLines(emptyInput)
    const acrylicA = createZonedPlumbingEstimateLine({
      priceKey: 'finish-bath-acrylic',
      quantity: 1,
      zoneName: zoneA.name,
      zoneId: zoneA.id,
    })
    const castB = createZonedPlumbingEstimateLine({
      priceKey: 'finish-bath-cast-iron',
      quantity: 1,
      zoneName: zoneB.name,
      zoneId: zoneB.id,
    })
    assert.ok(acrylicA)
    assert.ok(castB)
    lines = [...lines, acrylicA, castB]

    const applied = applyPlumbingScenarioToZone(lines, zoneA, { state: 'bath-zone' })
    const acrylicInA = applied.lines.find(
      (line) => line.zoneId === zoneA.id && line.priceKey === 'finish-bath-acrylic',
    )
    const castInB = applied.lines.find(
      (line) => line.zoneId === zoneB.id && line.priceKey === 'finish-bath-cast-iron',
    )
    assert.ok(acrylicInA)
    assert.equal(acrylicInA.enabled, true)
    assert.ok(castInB)
    assert.equal(castInB.enabled, true)
  })
})
