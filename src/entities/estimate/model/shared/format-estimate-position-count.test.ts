import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { formatEstimatePositionCount } from './format-estimate-position-count'

describe('formatEstimatePositionCount', () => {
  it('uses Russian plural forms for позиция', () => {
    assert.equal(formatEstimatePositionCount(0), '0 позиций')
    assert.equal(formatEstimatePositionCount(1), '1 позиция')
    assert.equal(formatEstimatePositionCount(2), '2 позиции')
    assert.equal(formatEstimatePositionCount(3), '3 позиции')
    assert.equal(formatEstimatePositionCount(4), '4 позиции')
    assert.equal(formatEstimatePositionCount(5), '5 позиций')
    assert.equal(formatEstimatePositionCount(11), '11 позиций')
    assert.equal(formatEstimatePositionCount(12), '12 позиций')
    assert.equal(formatEstimatePositionCount(21), '21 позиция')
    assert.equal(formatEstimatePositionCount(22), '22 позиции')
    assert.equal(formatEstimatePositionCount(25), '25 позиций')
  })
})
