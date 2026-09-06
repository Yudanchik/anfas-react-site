import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyCeilingDemolitionArea,
  applyCeilingFinishArea,
  applyCeilingScenario,
  assertCeilingMappingMatchesFrontend,
  buildCeilingEstimate,
  buildCeilingEstimateLines,
  buildFloorEstimateLines,
  calculateEstimateTotal,
  calculateLineTotal,
  ceilingScenarioIncludesFinish,
  CEILING_PRICE_MAPPING,
  createManualCeilingEstimateLine,
  getDefaultOpenCeilingGroupIds,
  groupCeilingEstimateLines,
  isCeilingFinishPriceKey,
  resolveCeilingScenarioKeys,
} from '../index'

const sampleCeilingInput = {
  totalCeilingArea: 80,
  demolitionArea: 60,
  plasterArea: 70,
  puttyArea: 75,
  finishArea: 75,
}

const sampleFloorInput = {
  totalFloorArea: 50,
  demolitionArea: 40,
  screedArea: 45,
  wetZonesArea: 6,
  avgDeltaMm: 12,
}

describe('ceiling estimate domain', () => {
  it('keeps mapping prices aligned with frontend preview for source=both', () => {
    assert.doesNotThrow(() => assertCeilingMappingMatchesFrontend())
  })

  it('builds all mapping rows disabled by default', () => {
    assert.ok(CEILING_PRICE_MAPPING.length >= 30)
    const lines = buildCeilingEstimateLines(sampleCeilingInput)
    assert.equal(lines.length, CEILING_PRICE_MAPPING.length)
    assert.ok(lines.every((line) => line.enabled === false))
    assert.ok(lines.every((line) => line.sectionId === 'ceilings'))
  })

  it('does not auto-enable lines from inputs alone', () => {
    const result = buildCeilingEstimate(sampleCeilingInput)
    assert.equal(result.selectedCount, 0)
    assert.equal(result.totalRub, 0)
    assert.equal(result.materialsExcluded, true)
  })

  it('applies quantity helpers without enabling rows', () => {
    let lines = buildCeilingEstimateLines(sampleCeilingInput)
    lines = applyCeilingDemolitionArea(lines, 55)
    const paint = lines.find((line) => line.priceKey === 'demolition-paint')
    assert.equal(paint?.quantity, 55)
    assert.equal(paint?.enabled, false)
  })

  it('from-scratch without finish excludes paint labour', () => {
    const application = { state: 'from-scratch' as const, finishTarget: 'none' as const }
    assert.equal(ceilingScenarioIncludesFinish(application), false)

    const keys = resolveCeilingScenarioKeys(application)
    assert.ok(keys.includes('primer-deep-penetration'))
    assert.ok(keys.includes('plaster-beacons-ceiling'))
    assert.ok(keys.includes('plaster-ceiling-main'))
    assert.ok(keys.includes('plaster-beacon-removal-ceiling'))
    assert.ok(keys.includes('putty-ceiling-2'))
    assert.ok(keys.includes('putty-sanding-ceiling'))
    assert.ok(keys.every((key) => !isCeilingFinishPriceKey(key)))

    const result = applyCeilingScenario(
      buildCeilingEstimateLines(sampleCeilingInput),
      sampleCeilingInput,
      application,
    )
    const enabled = result.lines.filter((line) => line.enabled)
    assert.ok(enabled.every((line) => !isCeilingFinishPriceKey(line.priceKey)))
  })

  it('from-scratch under paint includes paint finish and glassfiber', () => {
    const result = applyCeilingScenario(
      buildCeilingEstimateLines(sampleCeilingInput),
      sampleCeilingInput,
      { state: 'from-scratch', finishTarget: 'paint', paintLayers: 'paint-ceiling-2' },
    )

    const enabledKeys = result.lines.filter((line) => line.enabled).map((line) => line.priceKey)
    assert.ok(enabledKeys.includes('paint-ceiling-2'))
    assert.ok(enabledKeys.includes('reinforce-glassfiber-ceiling'))
    assert.ok(enabledKeys.includes('putty-finish-ceiling-1'))
    assert.equal(
      result.lines.find((line) => line.priceKey === 'paint-ceiling-2')?.quantity,
      75,
    )
  })

  it('prefinish does not include full plaster package', () => {
    const keys = resolveCeilingScenarioKeys({ state: 'prefinish', finishTarget: 'paint' })
    assert.equal(keys.includes('plaster-ceiling-main'), false)
    assert.ok(keys.includes('putty-ceiling-2'))
    assert.ok(keys.includes('paint-ceiling-2'))
  })

  it('demolition-only enables one covering and no finish', () => {
    const result = applyCeilingScenario(
      buildCeilingEstimateLines(sampleCeilingInput),
      sampleCeilingInput,
      { state: 'demolition-only', finishTarget: 'none', demolitionCovering: 'paint' },
    )
    const enabled = result.lines.filter((line) => line.enabled)
    assert.equal(enabled.length, 1)
    assert.equal(enabled[0]?.priceKey, 'demolition-paint')
    assert.equal(enabled[0]?.quantity, 60)
  })

  it('finish-only paint enables paint labour without plaster chain', () => {
    const result = applyCeilingScenario(
      buildCeilingEstimateLines(sampleCeilingInput),
      sampleCeilingInput,
      { state: 'finish-only', finishTarget: 'paint', paintLayers: 'paint-ceiling-2' },
    )
    const enabledKeys = result.lines.filter((line) => line.enabled).map((line) => line.priceKey)
    assert.deepEqual(enabledKeys, ['paint-ceiling-2'])
  })

  it('disables conflicting plaster modes and paint layers', () => {
    let lines = buildCeilingEstimateLines(sampleCeilingInput)
    lines = lines.map((line) =>
      line.priceKey === 'plaster-ceiling-partial' || line.priceKey === 'paint-ceiling-1'
        ? { ...line, enabled: true }
        : line,
    )

    const result = applyCeilingScenario(lines, sampleCeilingInput, {
      state: 'from-scratch',
      finishTarget: 'paint',
      paintLayers: 'paint-ceiling-2',
    })

    assert.equal(
      result.lines.find((line) => line.priceKey === 'plaster-ceiling-main')?.enabled,
      true,
    )
    assert.equal(
      result.lines.find((line) => line.priceKey === 'plaster-ceiling-partial')?.enabled,
      false,
    )
    assert.equal(result.lines.find((line) => line.priceKey === 'paint-ceiling-2')?.enabled, true)
    assert.equal(result.lines.find((line) => line.priceKey === 'paint-ceiling-1')?.enabled, false)
  })

  it('keeps manual rows and unrelated enabled rows when applying a scenario', () => {
    let lines = buildCeilingEstimateLines(sampleCeilingInput)
    const manual = createManualCeilingEstimateLine({
      title: 'Ручной потолок',
      unit: 'м²',
      unitPrice: 100,
      quantity: 2,
    })
    lines = [
      ...lines.map((line) =>
        line.priceKey === 'prep-diamond-grind' ? { ...line, enabled: true } : line,
      ),
      manual,
    ]

    const result = applyCeilingScenario(lines, sampleCeilingInput, {
      state: 'demolition-only',
      finishTarget: 'none',
      demolitionCovering: 'plaster',
    })

    assert.equal(result.lines.find((line) => line.id === manual.id)?.enabled, true)
    assert.equal(result.lines.find((line) => line.priceKey === 'prep-diamond-grind')?.enabled, true)
    assert.equal(result.lines.find((line) => line.priceKey === 'demolition-plaster')?.enabled, true)
  })

  it('applies finish quantity helpers without enabling rows', () => {
    let lines = buildCeilingEstimateLines(sampleCeilingInput)
    lines = applyCeilingFinishArea(lines, 66)
    const paint = lines.find((line) => line.priceKey === 'paint-ceiling-2')
    assert.equal(paint?.quantity, 66)
    assert.equal(paint?.enabled, false)
  })

  it('combines floors + ceilings totals across sections', () => {
    const floorLines = buildFloorEstimateLines(sampleFloorInput, {
      enabledByKey: { 'self-leveling-device': true },
    })
    const ceilingResult = applyCeilingScenario(
      buildCeilingEstimateLines(sampleCeilingInput),
      sampleCeilingInput,
      { state: 'demolition-only', finishTarget: 'none', demolitionCovering: 'paint' },
    )

    const total = calculateEstimateTotal([
      { id: 'floors', title: 'floors', lines: floorLines },
      { id: 'ceilings', title: 'ceilings', lines: ceilingResult.lines },
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
      })

    assert.equal(total, expected)
  })

  it('keeps ceiling groups collapsed by default', () => {
    const groups = groupCeilingEstimateLines(buildCeilingEstimateLines(sampleCeilingInput))
    assert.deepEqual(getDefaultOpenCeilingGroupIds(groups), [])
  })
})
