import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  isElectricScenarioAllowedForZone,
  resolveElectricScenarioOptionsForZone,
} from '../index'

describe('electric scenario soft filter by zoneType', () => {
  it('restricts kitchen scenario to kitchen (+ other/general)', () => {
    assert.equal(isElectricScenarioAllowedForZone('kitchen', 'kitchen'), true)
    assert.equal(isElectricScenarioAllowedForZone('kitchen', 'bathroom'), false)
    assert.equal(isElectricScenarioAllowedForZone('kitchen', 'room'), false)
    assert.equal(isElectricScenarioAllowedForZone('kitchen', 'other'), true)
    assert.equal(isElectricScenarioAllowedForZone('kitchen', null), true)
  })

  it('restricts bathroom scenario to bathroom (+ other/general)', () => {
    assert.equal(isElectricScenarioAllowedForZone('bathroom', 'bathroom'), true)
    assert.equal(isElectricScenarioAllowedForZone('bathroom', 'kitchen'), false)
  })

  it('room-rewire is for room/corridor', () => {
    assert.equal(isElectricScenarioAllowedForZone('room-rewire', 'room'), true)
    assert.equal(isElectricScenarioAllowedForZone('room-rewire', 'corridor'), true)
    assert.equal(isElectricScenarioAllowedForZone('room-rewire', 'kitchen'), false)
  })

  it('universal scenarios stay in primary for bathroom', () => {
    const { primary, other } = resolveElectricScenarioOptionsForZone('bathroom', false)
    assert.ok(primary.some((option) => option.id === 'bathroom'))
    assert.ok(primary.some((option) => option.id === 'lighting-only'))
    assert.ok(other.some((option) => option.id === 'kitchen'))
  })
})
