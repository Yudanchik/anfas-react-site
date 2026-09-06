import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  isPlumbingScenarioAllowedForZone,
  resolvePlumbingScenarioOptionsForZone,
} from '../index'

describe('plumbing scenario soft filter by zoneType', () => {
  it('restricts kitchen scenario to kitchen (+ other/general)', () => {
    assert.equal(isPlumbingScenarioAllowedForZone('kitchen', 'kitchen'), true)
    assert.equal(isPlumbingScenarioAllowedForZone('kitchen', 'bathroom'), false)
    assert.equal(isPlumbingScenarioAllowedForZone('kitchen', 'room'), false)
    assert.equal(isPlumbingScenarioAllowedForZone('kitchen', 'other'), true)
    assert.equal(isPlumbingScenarioAllowedForZone('kitchen', null), true)
  })

  it('restricts bathroom scenarios to bathroom (+ other/general)', () => {
    assert.equal(isPlumbingScenarioAllowedForZone('bathroom-from-scratch', 'bathroom'), true)
    assert.equal(isPlumbingScenarioAllowedForZone('bathroom-from-scratch', 'kitchen'), false)
    assert.equal(isPlumbingScenarioAllowedForZone('bath-zone', 'bathroom'), true)
    assert.equal(isPlumbingScenarioAllowedForZone('toilet-zone', 'room'), false)
  })

  it('universal scenarios stay in primary for bathroom', () => {
    const { primary, other } = resolvePlumbingScenarioOptionsForZone('bathroom', false)
    assert.ok(primary.some((option) => option.id === 'bathroom-from-scratch'))
    assert.ok(primary.some((option) => option.id === 'drainage-only'))
    assert.ok(other.some((option) => option.id === 'kitchen'))
  })
})
