import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyTileScenario,
  applyTileScenarioToZone,
  buildTileEstimateLines,
  createEstimateZone,
  createZonedTileEstimateLine,
} from '@/entities/estimate'

const emptyInput = {
  floorTileArea: 0,
  wallTileArea: 0,
  backsplashArea: 0,
  cuttingLength: 0,
  cornerLength: 0,
  holesCount: 0,
  repairCount: 0,
  surveyorComment: '',
}

describe('tile scenarios by zone', () => {
  it('applyTileScenarioToZone upserts clones and scopes conflicts', () => {
    const bath = createEstimateZone({
      name: 'Санузел',
      fields: {
        tileFloorArea: 6,
        tileWallArea: 18,
      },
    })
    const kitchen = createEstimateZone({
      name: 'Кухня',
      fields: { tileBacksplashArea: 4 },
    })

    let lines = buildTileEstimateLines(emptyInput)
    const kitchenLine = createZonedTileEstimateLine({
      priceKey: 'clad-mosaic',
      quantity: 4,
      zoneName: kitchen.name,
      zoneId: kitchen.id,
    })
    assert.ok(kitchenLine)
    lines = [...lines, kitchenLine]

    const first = applyTileScenarioToZone(lines, bath, {
      state: 'bathroom-from-scratch',
      cladFormat: '301-1300',
      grout: 'cement',
    })
    lines = first.lines

    const bathClad = lines.find(
      (line) => line.zoneId === bath.id && line.priceKey === 'clad-301-1300',
    )
    assert.ok(bathClad)
    assert.equal(bathClad.enabled, true)
    assert.equal(bathClad.quantity, 24)

    const canonical = lines.find((line) => line.id === 'tile:clad-301-1300')
    assert.ok(canonical)
    assert.equal(canonical.enabled, false)

    const second = applyTileScenarioToZone(lines, bath, {
      state: 'bathroom-from-scratch',
      cladFormat: 'mosaic',
      grout: 'cement',
    })
    lines = second.lines

    const bath301 = lines.find(
      (line) => line.zoneId === bath.id && line.priceKey === 'clad-301-1300',
    )
    const bathMosaic = lines.find(
      (line) => line.zoneId === bath.id && line.priceKey === 'clad-mosaic',
    )
    assert.ok(bath301)
    assert.equal(bath301.enabled, false)
    assert.ok(bathMosaic)
    assert.equal(bathMosaic.enabled, true)

    const stillKitchen = lines.find((line) => line.id === kitchenLine.id)
    assert.ok(stillKitchen)
    assert.equal(stillKitchen.enabled, true)
  })

  it('object-level tile scenario skips zoned clones', () => {
    const bath = createEstimateZone({ name: 'Санузел', fields: { tileFloorArea: 5 } })
    let lines = buildTileEstimateLines({
      ...emptyInput,
      floorTileArea: 20,
    })
    const zoned = createZonedTileEstimateLine({
      priceKey: 'demolition-floor-tile',
      quantity: 5,
      zoneName: bath.name,
      zoneId: bath.id,
    })
    assert.ok(zoned)
    lines = [...lines, zoned]

    const result = applyTileScenario(
      lines,
      { ...emptyInput, floorTileArea: 20 },
      { state: 'demolition-only', demolitionSurfaces: 'floor' },
    )
    const stillZoned = result.lines.find((line) => line.id === zoned.id)
    assert.ok(stillZoned)
    assert.equal(stillZoned.enabled, true)
    assert.equal(stillZoned.quantity, 5)
  })

  it('zoned upsert does not duplicate the same priceKey in a zone', () => {
    const bath = createEstimateZone({
      name: 'Санузел',
      fields: { tileFloorArea: 8, tileWallArea: 20 },
    })
    let lines = buildTileEstimateLines(emptyInput)

    const first = applyTileScenarioToZone(lines, bath, {
      state: 'bathroom-replacement',
      cladFormat: '301-1300',
      grout: 'epoxy',
    })
    lines = first.lines
    const second = applyTileScenarioToZone(lines, bath, {
      state: 'bathroom-replacement',
      cladFormat: '301-1300',
      grout: 'epoxy',
    })

    const cladClones = second.lines.filter(
      (line) => line.zoneId === bath.id && line.priceKey === 'clad-301-1300',
    )
    assert.equal(cladClones.length, 1)
  })
})
