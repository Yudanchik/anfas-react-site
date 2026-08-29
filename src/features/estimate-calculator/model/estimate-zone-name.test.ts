import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ESTIMATE_ZONE_NAME_MAX_LENGTH,
  validateEstimateZoneName,
} from './estimate-zone-name'

describe('validateEstimateZoneName', () => {
  it('rejects empty zone after trim', () => {
    const result = validateEstimateZoneName('   ')
    assert.equal(result.ok, false)
    if (!result.ok) {
      assert.match(result.message, /зону/i)
    }
  })

  it('allows common zone labels including digits and slash', () => {
    for (const name of ['Кухня', 'Коридор', 'Санузел', 'Комната 1', 'Кухня-гостиная', 'С/у 2']) {
      const result = validateEstimateZoneName(name)
      assert.equal(result.ok, true, name)
      if (result.ok) assert.equal(result.value, name)
    }
  })

  it('rejects unsupported characters with a clear message', () => {
    const result = validateEstimateZoneName('Кухня 😊')
    assert.equal(result.ok, false)
    if (!result.ok) {
      assert.match(result.message, /допустимы/i)
    }
  })

  it('rejects oversized names', () => {
    const result = validateEstimateZoneName('А'.repeat(ESTIMATE_ZONE_NAME_MAX_LENGTH + 1))
    assert.equal(result.ok, false)
    if (!result.ok) {
      assert.match(result.message, /длинное/i)
    }
  })
})
