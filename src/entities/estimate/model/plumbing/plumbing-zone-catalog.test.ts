import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  PLUMBING_PRICE_MAPPING,
  PLUMBING_ZONE_WORK_CATEGORIES,
  getPlumbingZoneMappingOptions,
} from '../index'

describe('plumbing zone work catalog', () => {
  it('exposes non-empty options for every category', () => {
    assert.ok(PLUMBING_ZONE_WORK_CATEGORIES.length >= 8)
    for (const category of PLUMBING_ZONE_WORK_CATEGORIES) {
      const options = getPlumbingZoneMappingOptions(category.id)
      assert.ok(options.length > 0, category.id)
      assert.ok(options.every((item) => item.kind === category.id))
    }
  })

  it('catalog options stay inside PLUMBING_PRICE_MAPPING', () => {
    const ids = new Set(PLUMBING_PRICE_MAPPING.map((item) => item.id))
    for (const category of PLUMBING_ZONE_WORK_CATEGORIES) {
      for (const option of getPlumbingZoneMappingOptions(category.id)) {
        assert.ok(ids.has(option.id))
      }
    }
  })
})
