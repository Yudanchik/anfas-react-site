import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  formatEstimateNumberDisplay,
  getEstimateNumberFocusDraft,
  parseEstimateNumberInput,
  sanitizeEstimateNumberDraft,
} from './estimate-number-input'

describe('estimate number input helpers', () => {
  it('parses empty and invalid values as 0', () => {
    assert.equal(parseEstimateNumberInput(''), 0)
    assert.equal(parseEstimateNumberInput('   '), 0)
    assert.equal(parseEstimateNumberInput('.'), 0)
    assert.equal(parseEstimateNumberInput('abc'), 0)
  })

  it('strips letters and keeps a single decimal separator', () => {
    assert.equal(sanitizeEstimateNumberDraft('12a3'), '123')
    assert.equal(sanitizeEstimateNumberDraft('12,5м'), '12,5')
    assert.equal(sanitizeEstimateNumberDraft('1.2.3'), '1.23')
    assert.equal(sanitizeEstimateNumberDraft('1,2,3'), '1,23')
    assert.equal(sanitizeEstimateNumberDraft('-12,5'), '12,5')
  })

  it('parses decimals with comma or dot; minus is stripped (not stored as negative)', () => {
    assert.equal(parseEstimateNumberInput('12,5'), 12.5)
    assert.equal(parseEstimateNumberInput('12.5'), 12.5)
    assert.equal(parseEstimateNumberInput('12abc,5'), 12.5)
    assert.equal(parseEstimateNumberInput('-3'), 3)
    assert.equal(parseEstimateNumberInput('02332'), 2332)
  })

  it('uses blank focus draft for zero so typing replaces the value', () => {
    assert.equal(getEstimateNumberFocusDraft(0), '')
    assert.equal(getEstimateNumberFocusDraft(12.5), '12.5')
    assert.equal(formatEstimateNumberDisplay(0), '0')
    assert.equal(formatEstimateNumberDisplay(12.5), '12.5')
  })
})
