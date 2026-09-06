import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyTileCladArea,
  applyTileScenario,
  assertTileMappingMatchesFrontend,
  buildCeilingEstimateLines,
  buildFloorEstimateLines,
  buildTileEstimate,
  buildTileEstimateLines,
  calculateEstimateTotal,
  calculateLineTotal,
  formatTileScenarioLabel,
  getDefaultOpenTileGroupIds,
  groupTileEstimateLines,
  resolveTileScenarioKeys,
  TILE_PRICE_MAPPING,
} from '../index'

const sampleTileInput = {
  floorTileArea: 8,
  wallTileArea: 24,
  backsplashArea: 3,
  cuttingLength: 6,
  cornerLength: 10,
  holesCount: 4,
  repairCount: 1,
}

const sampleFloorInput = {
  totalFloorArea: 50,
  demolitionArea: 40,
  screedArea: 45,
  wetZonesArea: 6,
  avgDeltaMm: 12,
}

const sampleCeilingInput = {
  totalCeilingArea: 80,
  demolitionArea: 60,
  plasterArea: 70,
  puttyArea: 75,
  finishArea: 75,
}

describe('tile estimate domain', () => {
  it('keeps mapping prices aligned with frontend preview for source=both', () => {
    assert.doesNotThrow(() => assertTileMappingMatchesFrontend())
  })

  it('keeps bath/door seal prices aligned with PDF', () => {
    const bath = TILE_PRICE_MAPPING.find((entry) => entry.id === 'seal-bath')
    const door = TILE_PRICE_MAPPING.find((entry) => entry.id === 'seal-door')
    assert.ok(bath)
    assert.ok(door)
    assert.equal(bath.unitPrice, 1050)
    assert.equal(bath.title, 'Герметизация примыкания ванны к стене')
    assert.equal(door.unitPrice, 350)
    assert.equal(door.title, 'Герметизация примыкания дверного блока')
  })

  it('uses PDF/FE 900 for wall tile demolition (source=both)', () => {
    const wallDemo = TILE_PRICE_MAPPING.find((item) => item.id === 'demolition-wall-tile')
    assert.ok(wallDemo)
    assert.equal(wallDemo.source, 'both')
    assert.equal(wallDemo.unitPrice, 900)
    assert.equal(wallDemo.unit, 'м²')
  })

  it('excludes hydro/svp/membrane/profile keys from mapping', () => {
    const forbidden = ['hydro', 'svp', 'membrane', 'profile', 'hatch', 'screen', 'apron']
    for (const item of TILE_PRICE_MAPPING) {
      for (const needle of forbidden) {
        assert.equal(
          item.id.toLowerCase().includes(needle),
          false,
          `unexpected key ${item.id}`,
        )
      }
    }
  })

  it('builds all mapping rows disabled by default', () => {
    assert.ok(TILE_PRICE_MAPPING.length >= 40)
    const lines = buildTileEstimateLines(sampleTileInput)
    assert.equal(lines.length, TILE_PRICE_MAPPING.length)
    assert.ok(lines.every((line) => line.enabled === false))
    assert.ok(lines.every((line) => line.sectionId === 'tile'))
  })

  it('does not auto-enable lines from inputs alone', () => {
    const result = buildTileEstimate(sampleTileInput)
    assert.equal(result.selectedCount, 0)
    assert.equal(result.totalRub, 0)
    assert.equal(result.materialsExcluded, true)
  })

  it('applies quantity helpers without enabling rows', () => {
    let lines = buildTileEstimateLines(sampleTileInput)
    lines = applyTileCladArea(lines, 40)
    const layout = lines.find((line) => line.priceKey === 'prep-layout')
    assert.equal(layout?.quantity, 40)
    assert.equal(layout?.enabled, false)
  })

  it('bathroom-from-scratch has prep/clad/grout and no demolition or hydro', () => {
    const keys = resolveTileScenarioKeys({
      state: 'bathroom-from-scratch',
      cladFormat: '301-1300',
      grout: 'cement',
    })
    assert.ok(keys.includes('prep-dust'))
    assert.ok(keys.includes('prep-primer'))
    assert.ok(keys.includes('prep-layout'))
    assert.ok(keys.includes('clad-301-1300'))
    assert.ok(keys.includes('grout-cement'))
    assert.ok(keys.includes('grout-clean-cement'))
    assert.equal(keys.includes('demolition-floor-tile'), false)
    assert.equal(keys.includes('demolition-wall-tile'), false)
    assert.ok(keys.every((key) => !key.startsWith('hydro')))
  })

  it('bathroom-replacement includes demolition and mentions it in the label', () => {
    const application = {
      state: 'bathroom-replacement' as const,
      cladFormat: '301-1300' as const,
      grout: 'cement' as const,
    }
    const keys = resolveTileScenarioKeys(application)
    assert.ok(keys.includes('demolition-floor-tile'))
    assert.ok(keys.includes('demolition-wall-tile'))
    assert.ok(keys.includes('prep-layout'))
    assert.ok(keys.includes('clad-301-1300'))
    assert.match(formatTileScenarioLabel(application), /демонтаж/i)

    const result = applyTileScenario(
      buildTileEstimateLines(sampleTileInput),
      sampleTileInput,
      application,
    )
    assert.equal(
      result.lines.find((line) => line.priceKey === 'demolition-floor-tile')?.quantity,
      8,
    )
    assert.equal(
      result.lines.find((line) => line.priceKey === 'demolition-wall-tile')?.quantity,
      24,
    )
    assert.equal(
      result.lines.find((line) => line.priceKey === 'clad-301-1300')?.quantity,
      32,
    )
  })

  it('kitchen-backsplash uses backsplash area only', () => {
    const result = applyTileScenario(buildTileEstimateLines(sampleTileInput), sampleTileInput, {
      state: 'kitchen-backsplash',
      cladFormat: 'mosaic',
    })
    assert.equal(result.lines.find((line) => line.priceKey === 'clad-mosaic')?.quantity, 3)
    assert.equal(result.lines.find((line) => line.priceKey === 'prep-layout')?.quantity, 3)
  })

  it('large-format prefers 1701-3600 with cut and hole package', () => {
    const keys = resolveTileScenarioKeys({ state: 'large-format' })
    assert.ok(keys.includes('clad-1701-3600'))
    assert.ok(keys.includes('prep-layout'))
    assert.ok(keys.includes('cut-edge-large-small'))
    assert.ok(keys.includes('hole-up-to-100'))
  })

  it('demolition-only surfaces and label mention демонтаж', () => {
    const both = resolveTileScenarioKeys({
      state: 'demolition-only',
      demolitionSurfaces: 'both',
    })
    assert.deepEqual(both, ['demolition-floor-tile', 'demolition-wall-tile'])
    assert.match(
      formatTileScenarioLabel({ state: 'demolition-only', demolitionSurfaces: 'walls' }),
      /демонтаж/i,
    )
  })

  it('grout-repair-only falls back to repair-one-tile when grout is none', () => {
    const keys = resolveTileScenarioKeys({ state: 'grout-repair-only', grout: 'none' })
    assert.deepEqual(keys, ['repair-one-tile'])
  })

  it('disables conflicting clad formats', () => {
    let lines = buildTileEstimateLines(sampleTileInput)
    lines = lines.map((line) =>
      line.priceKey === 'clad-mosaic' ? { ...line, enabled: true } : line,
    )

    const result = applyTileScenario(lines, sampleTileInput, {
      state: 'floor-only',
      cladFormat: '301-1300',
      grout: 'none',
    })

    assert.equal(result.lines.find((line) => line.priceKey === 'clad-301-1300')?.enabled, true)
    assert.equal(result.lines.find((line) => line.priceKey === 'clad-mosaic')?.enabled, false)
  })

  it('combines floors + ceilings + tile totals across sections', () => {
    const floorLines = buildFloorEstimateLines(sampleFloorInput, {
      enabledByKey: { 'self-leveling-device': true },
    })
    const ceilingLines = buildCeilingEstimateLines(sampleCeilingInput, {
      enabledByKey: { 'demolition-paint': true },
    })
    const tileResult = applyTileScenario(buildTileEstimateLines(sampleTileInput), sampleTileInput, {
      state: 'demolition-only',
      demolitionSurfaces: 'floor',
    })

    const total = calculateEstimateTotal([
      { id: 'floors', title: 'floors', lines: floorLines },
      { id: 'ceilings', title: 'ceilings', lines: ceilingLines },
      { id: 'tile', title: 'tile', lines: tileResult.lines },
    ])

    const expected =
      calculateLineTotal({
        enabled: true,
        quantity: 45,
        unitPrice: 900,
        coefficient: 1,
      }) +
      calculateLineTotal({
        enabled: true,
        quantity: 60,
        unitPrice: 350,
        coefficient: 1,
      }) +
      calculateLineTotal({
        enabled: true,
        quantity: 8,
        unitPrice: 900,
        coefficient: 1,
      })

    assert.equal(total, expected)
  })

  it('keeps tile groups collapsed by default', () => {
    const groups = groupTileEstimateLines(buildTileEstimateLines(sampleTileInput))
    assert.deepEqual(getDefaultOpenTileGroupIds(groups), [])
  })
})
