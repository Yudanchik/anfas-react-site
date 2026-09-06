import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  createEstimateZone,
  ESTIMATE_ZONE_TEMPLATES,
  formatTileScenarioZoneMismatchMessage,
  inferEstimateZoneTypeFromName,
  isTileScenarioAllowedForZone,
  partitionScenariosByZoneType,
  resolveEstimateZoneType,
  resolveTileScenarioOptionsForZone,
  TILE_SCENARIO_OPTIONS,
  updateEstimateZone,
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
    const corridor = ESTIMATE_ZONE_TEMPLATES.find((entry) => entry.name === 'Коридор')
    const room = ESTIMATE_ZONE_TEMPLATES.find((entry) => entry.name === 'Комната')
    assert.equal(kitchen?.zoneType, 'kitchen')
    assert.equal(bath?.zoneType, 'bathroom')
    assert.equal(corridor?.zoneType, 'corridor')
    assert.equal(room?.zoneType, 'room')
  })

  it('defaults unrecognized names without type to other', () => {
    const zone = createEstimateZone({ name: 'Свободная' })
    assert.equal(zone.zoneType, 'other')
  })

  it('infers bathroom type when creating manual «Санузел»', () => {
    const zone = createEstimateZone({ name: 'Санузел' })
    assert.equal(zone.zoneType, 'bathroom')
  })

  it('does not overwrite an explicit non-other zoneType', () => {
    const zone = createEstimateZone({
      name: 'Санузел',
      fields: { zoneType: 'kitchen' },
    })
    assert.equal(zone.zoneType, 'kitchen')
    assert.equal(
      resolveEstimateZoneType({ name: 'Санузел', zoneType: 'room' }),
      'room',
    )
  })

  it('infers bathroom/kitchen types from common names', () => {
    assert.equal(inferEstimateZoneTypeFromName('Санузел'), 'bathroom')
    assert.equal(inferEstimateZoneTypeFromName('Ванная'), 'bathroom')
    assert.equal(inferEstimateZoneTypeFromName('с/у'), 'bathroom')
    assert.equal(inferEstimateZoneTypeFromName('Кухня'), 'kitchen')
    assert.equal(inferEstimateZoneTypeFromName('Спальня'), 'room')
    assert.equal(inferEstimateZoneTypeFromName('Кладовка'), undefined)
  })

  it('renames other→inferred type by name, keeps explicit non-other', () => {
    const otherBath = createEstimateZone({
      name: 'Зона 1',
      fields: { zoneType: 'other' },
    })
    const [renamed] = updateEstimateZone([otherBath], otherBath.id, { name: 'Санузел' })
    assert.equal(renamed?.zoneType, 'bathroom')

    const kitchen = createEstimateZone({
      name: 'Кухня',
      fields: { zoneType: 'kitchen' },
    })
    const [kept] = updateEstimateZone([kitchen], kitchen.id, { name: 'Санузел' })
    assert.equal(kept?.zoneType, 'kitchen')
  })
})

describe('tile scenario soft filter and apply guard by zoneType', () => {
  it('does not include kitchen-backsplash for bathroom in primary options', () => {
    assert.equal(isTileScenarioAllowedForZone('kitchen-backsplash', 'bathroom'), false)
    assert.equal(isTileScenarioAllowedForZone('kitchen-backsplash', 'room'), false)
    assert.equal(isTileScenarioAllowedForZone('kitchen-backsplash', 'corridor'), false)

    const bathroom = resolveTileScenarioOptionsForZone('bathroom', false)
    assert.ok(!bathroom.primary.some((option) => option.id === 'kitchen-backsplash'))
    assert.ok(bathroom.other.some((option) => option.id === 'kitchen-backsplash'))
  })

  it('allows kitchen-backsplash for kitchen, other and general', () => {
    assert.equal(isTileScenarioAllowedForZone('kitchen-backsplash', 'kitchen'), true)
    assert.equal(isTileScenarioAllowedForZone('kitchen-backsplash', 'other'), true)
    assert.equal(isTileScenarioAllowedForZone('kitchen-backsplash', null), true)

    const kitchen = resolveTileScenarioOptionsForZone('kitchen', false)
    assert.ok(kitchen.primary.some((option) => option.id === 'kitchen-backsplash'))
  })

  it('keeps incompatible scenarios out of primary even when showAll is requested', () => {
    const bathroomAll = resolveTileScenarioOptionsForZone('bathroom', true)
    assert.ok(!bathroomAll.primary.some((option) => option.id === 'kitchen-backsplash'))
    assert.ok(bathroomAll.other.some((option) => option.id === 'kitchen-backsplash'))
  })

  it('resets incompatible selection target to a compatible primary scenario', () => {
    const bathroom = createEstimateZone({
      name: 'Санузел',
      fields: { zoneType: 'bathroom' },
    })
    assert.equal(bathroom.zoneType, 'bathroom')
    assert.equal(isTileScenarioAllowedForZone('kitchen-backsplash', bathroom.zoneType), false)

    const { primary } = resolveTileScenarioOptionsForZone(bathroom.zoneType, false)
    const fallback = primary[0]?.id
    assert.ok(fallback)
    assert.notEqual(fallback, 'kitchen-backsplash')
    assert.equal(isTileScenarioAllowedForZone(fallback, bathroom.zoneType), true)
  })

  it('formats a clear mismatch message for kitchen backsplash', () => {
    assert.match(
      formatTileScenarioZoneMismatchMessage('kitchen-backsplash'),
      /Кухонный фартук.*кухни/,
    )
  })

  it('other and general (null) show all scenarios', () => {
    const other = resolveTileScenarioOptionsForZone('other', false)
    const general = resolveTileScenarioOptionsForZone(null, false)
    assert.equal(other.primary.length, TILE_SCENARIO_OPTIONS.length)
    assert.equal(general.primary.length, TILE_SCENARIO_OPTIONS.length)
    assert.equal(other.other.length, 0)
    assert.equal(general.other.length, 0)
  })

  it('room and corridor show only universal scenarios', () => {
    const room = resolveTileScenarioOptionsForZone('room', false)
    const corridor = resolveTileScenarioOptionsForZone('corridor', false)
    assert.ok(!room.primary.some((option) => option.id === 'kitchen-backsplash'))
    assert.ok(!room.primary.some((option) => option.id === 'bathroom-from-scratch'))
    assert.ok(!corridor.primary.some((option) => option.id === 'kitchen-backsplash'))
    assert.ok(room.primary.every((option) => isTileScenarioAllowedForZone(option.id, 'room')))
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
