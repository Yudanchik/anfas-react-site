import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyPlumbingScenario,
  applyPlumbingWaterPipeLength,
  assertPlumbingMappingMatchesFrontend,
  buildFloorEstimateLines,
  buildPlumbingEstimate,
  buildPlumbingEstimateLines,
  calculateEstimateTotal,
  PLUMBING_PRICE_MAPPING,
  resolvePlumbingScenarioKeys,
} from '../index'

const emptyInput = {
  plumbingWaterPointsCount: 0,
  plumbingSewerPointsCount: 0,
  plumbingWaterPipeLength: 0,
  plumbingSewerPipeLength: 0,
  plumbingCollectorsCount: 0,
  plumbingToiletsCount: 0,
  plumbingSinksCount: 0,
  plumbingBathtubsCount: 0,
  plumbingShowersCount: 0,
  plumbingMixersCount: 0,
  plumbingInstallationsCount: 0,
  plumbingDrainsCount: 0,
  plumbingWasherConnectionsCount: 0,
  plumbingDishwasherConnectionsCount: 0,
  plumbingWaterHeatersCount: 0,
  plumbingTowelWarmersCount: 0,
  plumbingWarmFloorArea: 0,
  surveyorComment: '',
}

const sampleInput = {
  ...emptyInput,
  plumbingWaterPointsCount: 8,
  plumbingSewerPointsCount: 4,
  plumbingWaterPipeLength: 25,
  plumbingSewerPipeLength: 18,
  plumbingCollectorsCount: 1,
  plumbingToiletsCount: 1,
  plumbingSinksCount: 2,
  plumbingBathtubsCount: 1,
  plumbingShowersCount: 0,
  plumbingMixersCount: 3,
  plumbingInstallationsCount: 1,
  plumbingDrainsCount: 1,
  plumbingWasherConnectionsCount: 1,
  plumbingWarmFloorArea: 6,
}

describe('plumbing estimate domain', () => {
  it('keeps mapping prices aligned with frontend preview for source=both', () => {
    assert.doesNotThrow(() => assertPlumbingMappingMatchesFrontend())
  })

  it('exposes a wide labour-only mapping without materials/heating/out-of-scope keys', () => {
    assert.ok(PLUMBING_PRICE_MAPPING.length >= 80)
    const forbidden = [
      'radiator',
      'boiler',
      'convector',
      'heating-opress',
      'heating-start',
      'callout',
      'chase-dm3',
      'strobe-fill',
      'sound-riser',
      'towel-electric',
      'material-pipe',
      'demolition-radiator',
    ]
    for (const item of PLUMBING_PRICE_MAPPING) {
      const id = item.id.toLowerCase()
      const title = item.title.toLowerCase()
      for (const needle of forbidden) {
        assert.equal(id.includes(needle), false, `unexpected key ${item.id}`)
      }
      assert.equal(title.includes('опрессовка системы отопления'), false, item.id)
      assert.equal(title.includes('радиатор'), false, item.id)
      assert.equal(title.includes('выезд'), false, item.id)
      assert.equal(item.defaultEnabled, false)
    }
  })

  it('builds all mapping rows disabled by default', () => {
    const lines = buildPlumbingEstimateLines(sampleInput)
    assert.equal(lines.length, PLUMBING_PRICE_MAPPING.length)
    assert.ok(lines.every((line) => line.enabled === false))
    assert.ok(lines.every((line) => line.sectionId === 'plumbing'))
  })

  it('does not auto-enable lines from inputs alone', () => {
    const result = buildPlumbingEstimate(sampleInput)
    assert.equal(result.selectedCount, 0)
    assert.equal(result.totalRub, 0)
    assert.equal(result.materialsExcluded, true)
  })

  it('applies quantity helpers without enabling rows', () => {
    let lines = buildPlumbingEstimateLines(emptyInput)
    lines = applyPlumbingWaterPipeLength(lines, 22)
    const pipe = lines.find((line) => line.priceKey === 'water-pipe-d16-20')
    assert.ok(pipe)
    assert.equal(pipe.quantity, 22)
    assert.equal(pipe.enabled, false)
  })

  it('bathroom-from-scratch enables a compact typical set', () => {
    const keys = resolvePlumbingScenarioKeys({ state: 'bathroom-from-scratch' })
    assert.ok(keys.includes('drainage-pipe-d32-50'))
    assert.ok(keys.includes('water-pipe-d16-20'))
    assert.ok(keys.includes('install-frame'))
    assert.ok(keys.includes('finish-toilet-soft'))
    assert.ok(!keys.includes('drainage-riser-d110'))
    assert.ok(!keys.includes('finish-glass-door'))
    assert.ok(!keys.includes('ufh-pipe-100'))

    const applied = applyPlumbingScenario(buildPlumbingEstimateLines(sampleInput), sampleInput, {
      state: 'bathroom-from-scratch',
    })
    assert.equal(applied.addedCount, keys.length)
    for (const key of keys) {
      const line = applied.lines.find((entry) => entry.priceKey === key && !entry.zoneId)
      assert.ok(line, key)
      assert.equal(line.enabled, true)
    }
  })

  it('scenarios do not include rare risers/glass-door/heating/callout', () => {
    const states = [
      'bathroom-from-scratch',
      'bathroom-replacement',
      'kitchen',
      'bath-zone',
      'toilet-zone',
      'manifold',
      'drainage-only',
      'water-supply-only',
      'fixtures-only',
      'demolition-only',
    ] as const
    for (const state of states) {
      const keys = resolvePlumbingScenarioKeys({ state })
      assert.ok(!keys.includes('drainage-riser-d110'), state)
      assert.ok(!keys.includes('finish-glass-door'), state)
      assert.ok(!keys.includes('finish-bath-quaryl'), state)
      assert.ok(!keys.includes('water-riser-replace'), state)
    }
  })

  it('combines floors + plumbing totals across sections', () => {
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
    const plumbingLines = applyPlumbingScenario(
      buildPlumbingEstimateLines(sampleInput),
      sampleInput,
      { state: 'fixtures-only' },
    ).lines
    const total = calculateEstimateTotal([
      { id: 'floors', title: 'Полы', lines: floorLines },
      { id: 'plumbing', title: 'Сантехника', lines: plumbingLines },
    ])
    assert.ok(total > 0)
  })
})
