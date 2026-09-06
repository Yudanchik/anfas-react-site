import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ELECTRIC_PRICE_MAPPING,
  ELECTRIC_ZONE_WORK_CATEGORIES,
  getElectricZoneMappingOptions,
} from '../index'

describe('electric zone work catalog', () => {
  it('exposes non-empty options for every category', () => {
    assert.ok(ELECTRIC_ZONE_WORK_CATEGORIES.length >= 10)
    for (const category of ELECTRIC_ZONE_WORK_CATEGORIES) {
      const options = getElectricZoneMappingOptions(category.id)
      assert.ok(options.length > 0, category.id)
      assert.ok(options.every((item) => item.kind === category.id))
    }
  })

  it('catalog options stay inside ELECTRIC_PRICE_MAPPING', () => {
    const ids = new Set(ELECTRIC_PRICE_MAPPING.map((item) => item.id))
    for (const category of ELECTRIC_ZONE_WORK_CATEGORIES) {
      for (const option of getElectricZoneMappingOptions(category.id)) {
        assert.ok(ids.has(option.id))
      }
    }
  })
})
