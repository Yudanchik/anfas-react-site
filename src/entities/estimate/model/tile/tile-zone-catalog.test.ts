import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { createZonedTileEstimateLine } from './create-zoned-tile-estimate-line'
import {
  TILE_ZONE_WORK_CATEGORIES,
  getTileZoneMappingOptions,
} from './tile-zone-catalog'

describe('tile zone work catalog', () => {
  it('exposes non-empty options for every category', () => {
    for (const category of TILE_ZONE_WORK_CATEGORIES) {
      const options = getTileZoneMappingOptions(category.id)
      assert.ok(options.length > 0, category.id)
    }
  })

  it('creates a general (unzoned) clone without zoneId/zoneName', () => {
    const line = createZonedTileEstimateLine({
      priceKey: 'demolition-floor-tile',
      quantity: 12,
      zoneName: '',
    })
    assert.ok(line)
    assert.equal(line?.zoneId, undefined)
    assert.equal(line?.zoneName, undefined)
    assert.equal(line?.enabled, true)
    assert.equal(line?.quantity, 12)
  })

  it('creates a zoned clone with zone snapshot', () => {
    const line = createZonedTileEstimateLine({
      priceKey: 'demolition-wall-tile',
      quantity: 4,
      zoneName: 'Санузел',
      zoneId: 'zone-1',
    })
    assert.ok(line)
    assert.equal(line?.zoneId, 'zone-1')
    assert.equal(line?.zoneName, 'Санузел')
    assert.equal(line?.unitPrice, 900)
  })
})
