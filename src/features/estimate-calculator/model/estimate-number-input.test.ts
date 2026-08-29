import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  formatEstimateNumberDisplay,
  getEstimateNumberFocusDraft,
  parseEstimateNumberInput,
} from './estimate-number-input'

describe('estimate number input helpers', () => {
  it('parses empty and invalid values as 0', () => {
    assert.equal(parseEstimateNumberInput(''), 0)
    assert.equal(parseEstimateNumberInput('   '), 0)
    assert.equal(parseEstimateNumberInput('.'), 0)
    assert.equal(parseEstimateNumberInput('abc'), 0)
  })

  it('parses decimals with comma or dot and rejects negatives', () => {
    assert.equal(parseEstimateNumberInput('12,5'), 12.5)
    assert.equal(parseEstimateNumberInput('12.5'), 12.5)
    assert.equal(parseEstimateNumberInput('-3'), 0)
    assert.equal(parseEstimateNumberInput('02332'), 2332)
  })

  it('uses blank focus draft for zero so typing replaces the value', () => {
    assert.equal(getEstimateNumberFocusDraft(0), '')
    assert.equal(getEstimateNumberFocusDraft(12.5), '12.5')
    assert.equal(formatEstimateNumberDisplay(0), '0')
    assert.equal(formatEstimateNumberDisplay(12.5), '12.5')
  })
})
