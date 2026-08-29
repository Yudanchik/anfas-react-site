import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyWallDemolitionArea,
  applyWallFinishArea,
  applyWallScenario,
  assertWallMappingMatchesFrontend,
  buildFloorEstimateLines,
  buildWallEstimate,
  buildWallEstimateLines,
  calculateEstimateTotal,
  calculateLineTotal,
  calculateSelectedSectionsGrandTotal,
  createManualWallEstimateLine,
  getCombinedSelectedEstimateLines,
  getSelectedEstimateSections,
  isWallFinishPriceKey,
  resolveWallScenarioKeys,
  WALL_PRICE_MAPPING,
  wallScenarioIncludesFinish,
} from '../index'

const sampleWallInput = {
  totalWallArea: 80,
  demolitionArea: 60,
  plasterArea: 70,
  puttyArea: 75,
  finishArea: 75,
  wallHeightM: 2.7,
  slopesLengthM: 12,
  cornersLengthM: 18,
}

const sampleFloorInput = {
  totalFloorArea: 50,
  demolitionArea: 40,
  screedArea: 45,
  wetZonesArea: 6,
  avgDeltaMm: 12,
}

describe('wall estimate domain', () => {
  it('keeps mapping prices aligned with frontend preview for source=both', () => {
    assert.doesNotThrow(() => assertWallMappingMatchesFrontend())
  })

  it('builds all mapping rows disabled by default', () => {
    assert.ok(WALL_PRICE_MAPPING.length >= 40)
    const lines = buildWallEstimateLines(sampleWallInput)
    assert.equal(lines.length, WALL_PRICE_MAPPING.length)
    assert.ok(lines.every((line) => line.enabled === false))
    assert.ok(lines.every((line) => line.sectionId === 'walls'))
  })

  it('does not auto-enable lines from inputs alone', () => {
    const result = buildWallEstimate(sampleWallInput)
    assert.equal(result.selectedCount, 0)
    assert.equal(result.totalRub, 0)
    assert.equal(result.materialsExcluded, true)
  })

  it('applies quantity helpers without enabling rows', () => {
    let lines = buildWallEstimateLines(sampleWallInput)
    lines = applyWallDemolitionArea(lines, 55)
    const wallpaper = lines.find((line) => line.priceKey === 'demolition-wallpaper')
    assert.equal(wallpaper?.quantity, 55)
    assert.equal(wallpaper?.enabled, false)
  })

  it('from-scratch without finish excludes paint and wallpaper labour', () => {
    const application = { state: 'from-scratch' as const, finishTarget: 'none' as const }
    assert.equal(wallScenarioIncludesFinish(application), false)

    const keys = resolveWallScenarioKeys(application)
    assert.ok(keys.includes('primer-deep-penetration'))
    assert.ok(keys.includes('plaster-gypsum-beacons'))
    assert.ok(keys.includes('plaster-gypsum-main'))
    assert.ok(keys.includes('putty-base-2'))
    assert.ok(keys.includes('putty-sanding'))
    assert.ok(keys.every((key) => !isWallFinishPriceKey(key)))

    const result = applyWallScenario(buildWallEstimateLines(sampleWallInput), sampleWallInput, application)
    const enabled = result.lines.filter((line) => line.enabled)
    assert.ok(enabled.every((line) => !isWallFinishPriceKey(line.priceKey)))
    assert.equal(enabled.find((line) => line.priceKey === 'plaster-cement-main'), undefined)
  })

  it('from-scratch under wallpaper includes wallpaper finish labour', () => {
    const result = applyWallScenario(buildWallEstimateLines(sampleWallInput), sampleWallInput, {
      state: 'from-scratch',
      finishTarget: 'wallpaper',
      wallpaperType: 'flizelin',
    })

    const enabledKeys = result.lines.filter((line) => line.enabled).map((line) => line.priceKey)
    assert.ok(enabledKeys.includes('wallpaper-flizelin'))
    assert.equal(enabledKeys.includes('paint-2'), false)
    assert.equal(
      result.lines.find((line) => line.priceKey === 'wallpaper-flizelin')?.quantity,
      75,
    )
  })

  it('from-scratch under paint includes paint finish and glassfiber', () => {
    const result = applyWallScenario(buildWallEstimateLines(sampleWallInput), sampleWallInput, {
      state: 'from-scratch',
      finishTarget: 'paint',
      paintLayers: 'paint-2',
    })

    const enabledKeys = result.lines.filter((line) => line.enabled).map((line) => line.priceKey)
    assert.ok(enabledKeys.includes('paint-2'))
    assert.ok(enabledKeys.includes('reinforce-glassfiber'))
    assert.ok(enabledKeys.includes('putty-finish-1'))
    assert.equal(enabledKeys.includes('wallpaper-flizelin'), false)
  })

  it('prefinish under wallpaper does not include full plaster package', () => {
    const keys = resolveWallScenarioKeys({
      state: 'prefinish',
      finishTarget: 'wallpaper',
    })
    assert.equal(keys.includes('plaster-gypsum-main'), false)
    assert.ok(keys.includes('wallpaper-flizelin'))
    assert.ok(keys.includes('putty-base-2'))
  })

  it('demolition-only enables one covering and no finish', () => {
    const result = applyWallScenario(buildWallEstimateLines(sampleWallInput), sampleWallInput, {
      state: 'demolition-only',
      finishTarget: 'none',
      demolitionCovering: 'wallpaper',
    })
    const enabled = result.lines.filter((line) => line.enabled)
    assert.equal(enabled.length, 1)
    assert.equal(enabled[0]?.priceKey, 'demolition-wallpaper')
    assert.equal(enabled[0]?.quantity, 60)
  })

  it('finish-only paint enables paint labour without plaster chain', () => {
    const result = applyWallScenario(buildWallEstimateLines(sampleWallInput), sampleWallInput, {
      state: 'finish-only',
      finishTarget: 'paint',
      paintLayers: 'paint-2',
    })
    const enabledKeys = result.lines.filter((line) => line.enabled).map((line) => line.priceKey)
    assert.deepEqual(enabledKeys, ['paint-2'])
  })

  it('finish-only wallpaper enables wallpaper labour without plaster chain', () => {
    const result = applyWallScenario(buildWallEstimateLines(sampleWallInput), sampleWallInput, {
      state: 'finish-only',
      finishTarget: 'wallpaper',
      wallpaperType: 'vinyl-match',
    })
    const enabledKeys = result.lines.filter((line) => line.enabled).map((line) => line.priceKey)
    assert.deepEqual(enabledKeys, ['wallpaper-vinyl-match'])
  })

  it('disables conflicting plaster systems and paint layers', () => {
    let lines = buildWallEstimateLines(sampleWallInput)
    lines = lines.map((line) =>
      line.priceKey === 'plaster-cement-main' || line.priceKey === 'paint-1'
        ? { ...line, enabled: true }
        : line,
    )

    const result = applyWallScenario(lines, sampleWallInput, {
      state: 'from-scratch',
      finishTarget: 'paint',
      paintLayers: 'paint-2',
    })

    assert.equal(result.lines.find((line) => line.priceKey === 'plaster-gypsum-main')?.enabled, true)
    assert.equal(result.lines.find((line) => line.priceKey === 'plaster-cement-main')?.enabled, false)
    assert.equal(result.lines.find((line) => line.priceKey === 'paint-2')?.enabled, true)
    assert.equal(result.lines.find((line) => line.priceKey === 'paint-1')?.enabled, false)
  })

  it('wallpaper scenario disables paint finish alternatives', () => {
    let lines = buildWallEstimateLines(sampleWallInput)
    lines = lines.map((line) =>
      line.priceKey === 'paint-2' ? { ...line, enabled: true } : line,
    )

    const result = applyWallScenario(lines, sampleWallInput, {
      state: 'finish-only',
      finishTarget: 'wallpaper',
      wallpaperType: 'flizelin',
    })

    assert.equal(result.lines.find((line) => line.priceKey === 'wallpaper-flizelin')?.enabled, true)
    assert.equal(result.lines.find((line) => line.priceKey === 'paint-2')?.enabled, false)
  })

  it('keeps manual rows and unrelated enabled rows when applying a scenario', () => {
    let lines = buildWallEstimateLines(sampleWallInput)
    const manual = createManualWallEstimateLine({
      title: 'Ручная стена',
      unit: 'м²',
      unitPrice: 100,
      quantity: 2,
    })
    lines = [
      ...lines.map((line) =>
        line.priceKey === 'slopes-gasblock' ? { ...line, enabled: true } : line,
      ),
      manual,
    ]

    const result = applyWallScenario(lines, sampleWallInput, {
      state: 'demolition-only',
      finishTarget: 'none',
      demolitionCovering: 'paint',
    })

    assert.equal(result.lines.find((line) => line.id === manual.id)?.enabled, true)
    assert.equal(result.lines.find((line) => line.priceKey === 'slopes-gasblock')?.enabled, true)
    assert.equal(result.lines.find((line) => line.priceKey === 'demolition-paint')?.enabled, true)
  })

  it('applies finish quantity helpers without enabling rows', () => {
    let lines = buildWallEstimateLines(sampleWallInput)
    lines = applyWallFinishArea(lines, 66)
    const paint = lines.find((line) => line.priceKey === 'paint-2')
    assert.equal(paint?.quantity, 66)
    assert.equal(paint?.enabled, false)
  })

  it('combines floors + walls totals across sections', () => {
    const floorLines = buildFloorEstimateLines(sampleFloorInput, {
      enabledByKey: { 'self-leveling-device': true },
    })
    const wallResult = applyWallScenario(buildWallEstimateLines(sampleWallInput), sampleWallInput, {
      state: 'demolition-only',
      finishTarget: 'none',
      demolitionCovering: 'wallpaper',
    })

    const total = calculateEstimateTotal([
      { id: 'floors', title: 'floors', lines: floorLines },
      { id: 'walls', title: 'walls', lines: wallResult.lines },
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
        unitPrice: 250,
        coefficient: 1,
      })

    assert.equal(total, expected)
  })

  it('builds combined selected lines for floors + walls summary', () => {
    const floorLines = buildFloorEstimateLines(sampleFloorInput, {
      enabledByKey: { 'self-leveling-device': true },
    })
    const wallLines = applyWallScenario(buildWallEstimateLines(sampleWallInput), sampleWallInput, {
      state: 'finish-only',
      finishTarget: 'paint',
      paintLayers: 'paint-2',
    }).lines

    const selected = getCombinedSelectedEstimateLines([
      {
        sectionId: 'floors',
        sectionTitle: 'Полы',
        lines: floorLines,
        resolveGroupTitle: () => 'Наливной',
      },
      {
        sectionId: 'walls',
        sectionTitle: 'Стены',
        lines: wallLines,
        resolveGroupTitle: () => 'Финиш',
      },
    ])

    assert.equal(selected.length, 2)
    assert.ok(selected.some((item) => item.sectionTitle === 'Полы'))
    assert.ok(selected.some((item) => item.sectionTitle === 'Стены'))
  })

  it('groups selected summary lines by section and omits empty sections', () => {
    const floorLines = buildFloorEstimateLines(sampleFloorInput, {
      enabledByKey: { 'self-leveling-device': true },
    })
    const wallLines = buildWallEstimateLines(sampleWallInput)
    const sections = [
      {
        sectionId: 'floors',
        sectionTitle: 'Полы',
        lines: floorLines,
        resolveGroupTitle: () => 'Наливной',
      },
      {
        sectionId: 'walls',
        sectionTitle: 'Стены',
        lines: wallLines,
        resolveGroupTitle: () => 'Финиш',
      },
      {
        sectionId: 'ceilings',
        sectionTitle: 'Потолки',
        lines: [],
        resolveGroupTitle: () => 'Прочее',
      },
    ] as const

    const groups = getSelectedEstimateSections(sections)
    assert.equal(groups.length, 1)
    assert.equal(groups[0]?.sectionId, 'floors')
    assert.equal(groups[0]?.selectedCount, 1)
    assert.equal(
      groups[0]?.subtotalRub,
      calculateLineTotal({
        enabled: true,
        quantity: 45,
        unitPrice: 900,
        coefficient: 1,
      }),
    )

    const withWalls = applyWallScenario(wallLines, sampleWallInput, {
      state: 'finish-only',
      finishTarget: 'paint',
      paintLayers: 'paint-2',
    }).lines

    const both = getSelectedEstimateSections([
      sections[0],
      { ...sections[1], lines: withWalls },
      sections[2],
    ])
    assert.equal(both.length, 2)
    assert.deepEqual(
      both.map((group) => group.sectionId),
      ['floors', 'walls'],
    )

    const floorsSub = both.find((group) => group.sectionId === 'floors')?.subtotalRub ?? 0
    const wallsSub = both.find((group) => group.sectionId === 'walls')?.subtotalRub ?? 0
    const expectedGrand =
      calculateLineTotal({
        enabled: true,
        quantity: 45,
        unitPrice: 900,
        coefficient: 1,
      }) +
      calculateLineTotal({
        enabled: true,
        quantity: 75,
        unitPrice: 480,
        coefficient: 1,
      })

    assert.equal(floorsSub + wallsSub, expectedGrand)
    assert.equal(calculateSelectedSectionsGrandTotal(both), expectedGrand)
    assert.equal(
      calculateEstimateTotal([
        { id: 'floors', title: 'Полы', lines: floorLines },
        { id: 'walls', title: 'Стены', lines: withWalls },
      ]),
      expectedGrand,
    )
  })
})
