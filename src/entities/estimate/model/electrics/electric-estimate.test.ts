import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyElectricCableLength,
  applyElectricScenario,
  assertElectricMappingMatchesFrontend,
  buildElectricEstimate,
  buildElectricEstimateLines,
  buildFloorEstimateLines,
  calculateEstimateTotal,
  ELECTRIC_PRICE_MAPPING,
  resolveElectricScenarioKeys,
} from '../index'

const emptyInput = {
  electricSocketsCount: 0,
  electricSwitchesCount: 0,
  electricLightPointsCount: 0,
  electricDataPointsCount: 0,
  electricStrobeLength: 0,
  electricCableLength: 0,
  electricSocketBoxesCount: 0,
  electricJunctionBoxesCount: 0,
  electricPanelModulesCount: 0,
  electricWarmFloorArea: 0,
  electricApplianceConnectionsCount: 0,
  surveyorComment: '',
}

const sampleInput = {
  ...emptyInput,
  electricSocketsCount: 12,
  electricSwitchesCount: 6,
  electricLightPointsCount: 10,
  electricDataPointsCount: 4,
  electricStrobeLength: 40,
  electricCableLength: 80,
  electricSocketBoxesCount: 18,
  electricJunctionBoxesCount: 4,
  electricWarmFloorArea: 8,
  electricApplianceConnectionsCount: 3,
}

describe('electric estimate domain', () => {
  it('keeps mapping prices aligned with frontend preview for source=both', () => {
    assert.doesNotThrow(() => assertElectricMappingMatchesFrontend())
  })

  it('exposes a wide labour-only mapping without materials/questionable keys', () => {
    assert.ok(ELECTRIC_PRICE_MAPPING.length >= 100)
    const forbidden = [
      'tv-bracket',
      'wifi',
      'intercom',
      'домофон',
      'video-call',
      'callout',
      'water-ufh',
      'cable-material',
      'strobe-fill',
    ]
    for (const item of ELECTRIC_PRICE_MAPPING) {
      const id = item.id.toLowerCase()
      for (const needle of forbidden) {
        assert.equal(id.includes(needle), false, `unexpected key ${item.id}`)
      }
      assert.equal(item.defaultEnabled, false)
    }
  })

  it('builds all mapping rows disabled by default', () => {
    const lines = buildElectricEstimateLines(sampleInput)
    assert.equal(lines.length, ELECTRIC_PRICE_MAPPING.length)
    assert.ok(lines.every((line) => line.enabled === false))
    assert.ok(lines.every((line) => line.sectionId === 'electrics'))
  })

  it('does not auto-enable lines from inputs alone', () => {
    const result = buildElectricEstimate(sampleInput)
    assert.equal(result.selectedCount, 0)
    assert.equal(result.totalRub, 0)
    assert.equal(result.materialsExcluded, true)
  })

  it('applies quantity helpers without enabling rows', () => {
    let lines = buildElectricEstimateLines(emptyInput)
    lines = applyElectricCableLength(lines, 25)
    const cable = lines.find((line) => line.priceKey === 'cable-chase-1-5-2-5')
    assert.ok(cable)
    assert.equal(cable.quantity, 25)
    assert.equal(cable.enabled, false)
  })

  it('apartment-from-scratch enables a compact typical set', () => {
    const keys = resolveElectricScenarioKeys({ state: 'apartment-from-scratch' })
    assert.ok(keys.includes('chase-concrete-to-35'))
    assert.ok(keys.includes('panel-assembly-12'))
    assert.ok(keys.includes('finish-outlet-switch'))
    assert.ok(!keys.includes('conduit-tray-mount'))
    assert.ok(!keys.includes('finish-chandelier-heavy'))
    assert.ok(!keys.includes('finish-magnetic-bus'))

    const applied = applyElectricScenario(
      buildElectricEstimateLines(sampleInput),
      sampleInput,
      { state: 'apartment-from-scratch' },
    )
    assert.equal(applied.addedCount, keys.length)
    for (const key of keys) {
      const line = applied.lines.find((entry) => entry.priceKey === key && !entry.zoneId)
      assert.ok(line, key)
      assert.equal(line.enabled, true)
    }
  })

  it('scenarios do not include rare tray/heavy chandelier positions', () => {
    const states = [
      'apartment-from-scratch',
      'room-rewire',
      'kitchen',
      'bathroom',
      'lighting-only',
      'outlets-switches',
      'low-current',
      'panel-only',
      'demolition-only',
    ] as const
    for (const state of states) {
      const keys = resolveElectricScenarioKeys({ state })
      assert.ok(!keys.includes('conduit-tray-mount'), state)
      assert.ok(!keys.includes('finish-chandelier-heavy'), state)
      assert.ok(!keys.includes('finish-magnetic-bus'), state)
    }
  })

  it('combines floors + electrics totals across sections', () => {
    const floorLines = buildFloorEstimateLines({
      totalFloorArea: 50,
      demolitionArea: 0,
      screedArea: 0,
      wetZonesArea: 0,
      avgDeltaMm: 0,
    }).map((line) =>
      line.priceKey === 'demolition-laminate'
        ? { ...line, enabled: true, quantity: 10 }
        : line,
    )
    const electricLines = applyElectricScenario(
      buildElectricEstimateLines(sampleInput),
      sampleInput,
      { state: 'outlets-switches' },
    ).lines
    const total = calculateEstimateTotal([
      { id: 'floors', title: 'Полы', lines: floorLines },
      { id: 'electrics', title: 'Электрика', lines: electricLines },
    ])
    assert.ok(total > 0)
  })
})
