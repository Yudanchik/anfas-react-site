import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { validateManualEstimateLineInput } from './validate-manual-estimate-line'

describe('validateManualEstimateLineInput', () => {
  it('requires a non-empty title', () => {
    const result = validateManualEstimateLineInput({
      title: '  ',
      quantity: 1,
      unitPrice: 100,
    })
    assert.equal(result.ok, false)
    if (!result.ok) assert.match(result.message, /название/i)
  })

  it('requires quantity greater than 0', () => {
    const result = validateManualEstimateLineInput({
      title: 'Работа',
      quantity: 0,
      unitPrice: 100,
    })
    assert.equal(result.ok, false)
    if (!result.ok) assert.match(result.message, /объём/i)
  })

  it('requires unit price greater than 0', () => {
    const result = validateManualEstimateLineInput({
      title: 'Работа',
      quantity: 2,
      unitPrice: 0,
    })
    assert.equal(result.ok, false)
    if (!result.ok) assert.equal(result.message, 'Укажите цену больше 0')
  })

  it('accepts a valid draft', () => {
    const result = validateManualEstimateLineInput({
      title: 'Доп. работа',
      quantity: 3,
      unitPrice: 450,
    })
    assert.equal(result.ok, true)
  })
})
