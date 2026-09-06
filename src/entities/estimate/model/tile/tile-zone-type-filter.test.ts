import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  createEstimateZone,
  ESTIMATE_ZONE_TEMPLATES,
  partitionScenariosByZoneType,
  resolveTileScenarioOptionsForZone,
  TILE_SCENARIO_OPTIONS,
} from '../index'

describe('estimate zone templates and zoneType', () => {
  it('sets zoneType from templates', () => {
    for (const template of ESTIMATE_ZONE_TEMPLATES) {
      const zone = createEstimateZone({
        name: template.name,
        fields: { zoneType: template.zoneType },
      })
      assert.equal(zone.zoneType, template.zoneType)
    }

    const kitchen = ESTIMATE_ZONE_TEMPLATES.find((entry) => entry.name === 'Кухня')
    const bath = ESTIMATE_ZONE_TEMPLATES.find((entry) => entry.name === 'Санузел')
    assert.equal(kitchen?.zoneType, 'kitchen')
    assert.equal(bath?.zoneType, 'bathroom')
  })

  it('defaults missing zoneType to other', () => {
    const zone = createEstimateZone({ name: 'Свободная' })
    assert.equal(zone.zoneType, 'other')
  })
})

describe('tile scenario soft filter by zoneType', () => {
  it('puts kitchen-backsplash in primary for kitchen and in other for bathroom', () => {
    const kitchen = resolveTileScenarioOptionsForZone('kitchen', false)
    assert.ok(kitchen.primary.some((option) => option.id === 'kitchen-backsplash'))
    assert.ok(!kitchen.other.some((option) => option.id === 'kitchen-backsplash'))

    const bathroom = resolveTileScenarioOptionsForZone('bathroom', false)
    assert.ok(!bathroom.primary.some((option) => option.id === 'kitchen-backsplash'))
    assert.ok(bathroom.other.some((option) => option.id === 'kitchen-backsplash'))
    assert.ok(bathroom.primary.some((option) => option.id === 'bathroom-from-scratch'))
  })

  it('showAll returns every scenario in primary', () => {
    const bathroomAll = resolveTileScenarioOptionsForZone('bathroom', true)
    assert.equal(bathroomAll.primary.length, TILE_SCENARIO_OPTIONS.length)
    assert.equal(bathroomAll.other.length, 0)
    assert.ok(bathroomAll.primary.some((option) => option.id === 'kitchen-backsplash'))
  })

  it('other and general (null) show all scenarios', () => {
    const other = resolveTileScenarioOptionsForZone('other', false)
    const general = resolveTileScenarioOptionsForZone(null, false)
    assert.equal(other.primary.length, TILE_SCENARIO_OPTIONS.length)
    assert.equal(general.primary.length, TILE_SCENARIO_OPTIONS.length)
    assert.equal(other.other.length, 0)
    assert.equal(general.other.length, 0)
  })

  it('partition helper keeps shared API for future sections', () => {
    const partitioned = partitionScenariosByZoneType(
      [
        { id: 'a', recommendedZoneTypes: ['kitchen'] },
        { id: 'b', recommendedZoneTypes: 'all' },
      ],
      'bathroom',
      false,
    )
    assert.deepEqual(
      partitioned.primary.map((entry) => entry.id),
      ['b'],
    )
    assert.deepEqual(
      partitioned.other.map((entry) => entry.id),
      ['a'],
    )
  })
})
