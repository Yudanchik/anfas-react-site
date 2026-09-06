import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { createZonedCeilingEstimateLine } from './create-zoned-ceiling-estimate-line'
import {
  CEILING_ZONE_WORK_CATEGORIES,
  getCeilingZoneMappingOptions,
} from './ceiling-zone-catalog'

describe('ceiling zone work catalog', () => {
  it('exposes non-empty options for every category', () => {
    for (const category of CEILING_ZONE_WORK_CATEGORIES) {
      const options = getCeilingZoneMappingOptions(category.id)
      assert.ok(options.length > 0, category.id)
    }
  })

  it('creates a general (unzoned) clone without zoneId/zoneName', () => {
    const line = createZonedCeilingEstimateLine({
      priceKey: 'demolition-paint',
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
    const line = createZonedCeilingEstimateLine({
      priceKey: 'demolition-paint',
      quantity: 4,
      zoneName: 'Кухня',
      zoneId: 'zone-1',
    })
    assert.ok(line)
    assert.equal(line?.zoneId, 'zone-1')
    assert.equal(line?.zoneName, 'Кухня')
  })
})
