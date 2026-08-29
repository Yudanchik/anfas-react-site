import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyFloorPreset,
  applyFloorPresetToZone,
  attachZonesToSelectedSections,
  buildFloorEstimateLines,
  calculateLineTotal,
  createEstimateZone,
  createZonedFloorEstimateLine,
  ESTIMATE_GENERAL_WORKS_TITLE,
  getSelectedEstimateSections,
  groupSelectedSectionItemsByZone,
} from '@/entities/estimate'

const emptyInput = {
  totalFloorArea: 0,
  demolitionArea: 0,
  screedArea: 0,
  wetZonesArea: 0,
  avgDeltaMm: 0,
  surveyorComment: '',
}

describe('estimate zones grouping and floor zone presets', () => {
  it('groups selected lines as section → general/zone with matching subtots', () => {
    const kitchen = createEstimateZone({ name: 'Кухня' })
    let lines = buildFloorEstimateLines({ ...emptyInput, demolitionArea: 40 })
    lines = lines.map((line) =>
      line.priceKey === 'demolition-laminate'
        ? { ...line, enabled: true, quantity: 40 }
        : line,
    )
    const zoned = createZonedFloorEstimateLine({
      priceKey: 'demolition-floor-tile',
      quantity: 8,
      zoneName: kitchen.name,
      zoneId: kitchen.id,
    })
    assert.ok(zoned)
    lines = [...lines, zoned]

    const sections = getSelectedEstimateSections([
      {
        sectionId: 'floors',
        sectionTitle: 'Полы',
        lines,
        resolveGroupTitle: () => 'Демонтаж',
      },
    ])
    assert.equal(sections.length, 1)
    const section = sections[0]!
    const zones = groupSelectedSectionItemsByZone(
      section,
      new Map([[kitchen.id, kitchen.name]]),
    )
    assert.equal(zones.length, 2)
    assert.equal(zones[0]?.zoneTitle, ESTIMATE_GENERAL_WORKS_TITLE)
    assert.equal(zones[1]?.zoneTitle, 'Кухня')
    assert.equal(
      zones.reduce((sum, zone) => sum + zone.subtotalRub, 0),
      section.subtotalRub,
    )

    const withZones = attachZonesToSelectedSections(sections, new Map([[kitchen.id, kitchen.name]]))
    assert.equal(withZones[0]?.zones.length, 2)
    assert.equal(
      withZones[0]!.zones.reduce((sum, zone) => sum + zone.subtotalRub, 0),
      withZones[0]!.subtotalRub,
    )
  })

  it('applyFloorPresetToZone upserts clones and leaves general/other zones alone', () => {
    const kitchen = createEstimateZone({
      name: 'Кухня',
      fields: { demolitionFloorArea: 12 },
    })
    const bath = createEstimateZone({
      name: 'Санузел',
      fields: { demolitionFloorArea: 5 },
    })

    let lines = buildFloorEstimateLines(emptyInput)
    const bathLine = createZonedFloorEstimateLine({
      priceKey: 'demolition-floor-tile',
      quantity: 5,
      zoneName: bath.name,
      zoneId: bath.id,
    })
    assert.ok(bathLine)
    lines = [...lines, bathLine]

    const first = applyFloorPresetToZone(lines, kitchen, {
      presetId: 'demolition-covering',
      covering: 'laminate',
    })
    lines = first.lines

    const kitchenClone = lines.find(
      (line) => line.zoneId === kitchen.id && line.priceKey === 'demolition-laminate',
    )
    assert.ok(kitchenClone)
    assert.equal(kitchenClone.quantity, 12)
    assert.equal(kitchenClone.enabled, true)

    const canonical = lines.find((line) => line.id === 'floors:demolition-laminate')
    assert.ok(canonical)
    assert.equal(canonical.enabled, false)

    const untouchedBath = lines.find((line) => line.id === bathLine.id)
    assert.ok(untouchedBath)
    assert.equal(untouchedBath.enabled, true)
    assert.equal(untouchedBath.quantity, 5)

    const second = applyFloorPresetToZone(lines, kitchen, {
      presetId: 'demolition-covering',
      covering: 'tile',
    })
    lines = second.lines

    const kitchenLaminate = lines.find(
      (line) => line.zoneId === kitchen.id && line.priceKey === 'demolition-laminate',
    )
    const kitchenTile = lines.find(
      (line) => line.zoneId === kitchen.id && line.priceKey === 'demolition-floor-tile',
    )
    assert.ok(kitchenLaminate)
    assert.equal(kitchenLaminate.enabled, false)
    assert.ok(kitchenTile)
    assert.equal(kitchenTile.enabled, true)
    assert.equal(kitchenTile.quantity, 12)

    const stillBath = lines.find((line) => line.id === bathLine.id)
    assert.ok(stillBath)
    assert.equal(stillBath.enabled, true)
  })

  it('object-level floor preset does not touch zone clones', () => {
    const kitchen = createEstimateZone({
      name: 'Кухня',
      fields: { demolitionFloorArea: 12 },
    })
    let lines = buildFloorEstimateLines({ ...emptyInput, demolitionArea: 40 })
    const zoned = createZonedFloorEstimateLine({
      priceKey: 'demolition-linoleum',
      quantity: 12,
      zoneName: kitchen.name,
      zoneId: kitchen.id,
    })
    assert.ok(zoned)
    lines = [...lines, zoned]

    const result = applyFloorPreset(lines, { ...emptyInput, demolitionArea: 40 }, {
      presetId: 'demolition-covering',
      covering: 'laminate',
    })
    const stillZoned = result.lines.find((line) => line.id === zoned.id)
    assert.ok(stillZoned)
    assert.equal(stillZoned.enabled, true)
    assert.equal(stillZoned.quantity, 12)
    assert.equal(calculateLineTotal(stillZoned), calculateLineTotal(zoned))
  })
})
