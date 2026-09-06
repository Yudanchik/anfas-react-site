import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyElectricScenario,
  applyElectricScenarioToZone,
  buildElectricEstimateLines,
  createEstimateZone,
  createZonedElectricEstimateLine,
} from '@/entities/estimate'

const emptyInput = {
  electricSocketsCount: 0,
  electricSwitchesCount: 0,
  electricLightPointsCount: 0,
  electricDataPointsCount: 0,
  electricStrobeLength: 0,
  electricCableLength: 0,
  electricSocketBoxesCount: 0,
  electricJunctionBoxesCount: 0,
  electricPanelModulesCount: 0,
  electricWarmFloorArea: 0,
  electricApplianceConnectionsCount: 0,
  surveyorComment: '',
}

describe('electric scenarios by zone', () => {
  it('applyElectricScenarioToZone upserts clones and scopes conflicts', () => {
    const room = createEstimateZone({
      name: 'Комната',
      fields: {
        zoneType: 'room',
        electricSocketsCount: 8,
        electricLightPointsCount: 4,
        electricStrobeLength: 20,
        electricCableLength: 30,
        electricSocketBoxesCount: 8,
      },
    })
    const kitchen = createEstimateZone({
      name: 'Кухня',
      fields: { zoneType: 'kitchen', electricSocketsCount: 6 },
    })

    let lines = buildElectricEstimateLines(emptyInput)
    const kitchenLine = createZonedElectricEstimateLine({
      priceKey: 'finish-outlet-switch',
      quantity: 6,
      zoneName: kitchen.name,
      zoneId: kitchen.id,
    })
    assert.ok(kitchenLine)
    lines = [...lines, kitchenLine]

    const first = applyElectricScenarioToZone(lines, room, { state: 'room-rewire' })
    lines = first.lines

    const roomOutlet = lines.find(
      (line) => line.zoneId === room.id && line.priceKey === 'finish-outlet-switch',
    )
    assert.ok(roomOutlet)
    assert.equal(roomOutlet.enabled, true)
    assert.equal(roomOutlet.quantity, 8)

    const canonical = lines.find((line) => line.id === 'electrics:finish-outlet-switch')
    assert.ok(canonical)
    assert.equal(canonical.enabled, false)

    const kitchenClone = lines.find(
      (line) => line.zoneId === kitchen.id && line.priceKey === 'finish-outlet-switch',
    )
    assert.ok(kitchenClone)
    assert.equal(kitchenClone.enabled, true)

    const second = applyElectricScenarioToZone(lines, room, { state: 'room-rewire' })
    const roomOutlets = second.lines.filter(
      (line) => line.zoneId === room.id && line.priceKey === 'finish-outlet-switch',
    )
    assert.equal(roomOutlets.length, 1)
  })

  it('object-level electric scenario skips zoned clones', () => {
    const zone = createEstimateZone({
      name: 'Кухня',
      fields: { zoneType: 'kitchen', electricSocketsCount: 4 },
    })
    let lines = buildElectricEstimateLines(emptyInput)
    const zoned = createZonedElectricEstimateLine({
      priceKey: 'finish-outlet-switch',
      quantity: 4,
      zoneName: zone.name,
      zoneId: zone.id,
    })
    assert.ok(zoned)
    lines = [...lines, zoned]

    const applied = applyElectricScenario(lines, emptyInput, { state: 'outlets-switches' })
    const zonedAfter = applied.lines.find(
      (line) => line.zoneId === zone.id && line.priceKey === 'finish-outlet-switch',
    )
    assert.ok(zonedAfter)
    assert.equal(zonedAfter.enabled, true)
    assert.equal(zonedAfter.quantity, 4)

    const canonical = applied.lines.find((line) => line.id === 'electrics:finish-outlet-switch')
    assert.ok(canonical)
    assert.equal(canonical.enabled, true)
  })

  it('zoned upsert does not duplicate the same priceKey in a zone', () => {
    const zone = createEstimateZone({
      name: 'Санузел',
      fields: {
        zoneType: 'bathroom',
        electricSocketsCount: 3,
        electricLightPointsCount: 2,
        electricStrobeLength: 10,
        electricCableLength: 15,
        electricSocketBoxesCount: 3,
      },
    })
    const lines = buildElectricEstimateLines(emptyInput)
    const first = applyElectricScenarioToZone(lines, zone, { state: 'bathroom' })
    const second = applyElectricScenarioToZone(first.lines, zone, { state: 'bathroom' })
    const keys = second.lines
      .filter((line) => line.zoneId === zone.id)
      .map((line) => line.priceKey)
    assert.equal(keys.length, new Set(keys).size)
  })
})
