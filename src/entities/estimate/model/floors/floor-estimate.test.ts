import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyDemolitionAreaToDemolitionWorks,
  applyFloorPreset,
  applyWetAreaToWaterproofing,
  assertFloorMappingMatchesFrontend,
  buildFloorEstimate,
  buildFloorEstimateLines,
  calculateEstimateTotal,
  calculateLineTotal,
  createManualEstimateLine,
  FLOOR_PRICE_MAPPING,
  getDefaultOpenFloorGroupIds,
  getFloorRecommendation,
  groupFloorEstimateLines,
  updateEstimateLine,
} from '../index'

const sampleInput = {
  totalFloorArea: 50,
  demolitionArea: 40,
  screedArea: 45,
  wetZonesArea: 6,
  avgDeltaMm: 12,
}

describe('floor estimate domain', () => {
  it('keeps mapping prices aligned with frontend preview for source=both', () => {
    assert.doesNotThrow(() => assertFloorMappingMatchesFrontend())
  })

  it('treats disabled line as 0', () => {
    assert.equal(
      calculateLineTotal({
        enabled: false,
        quantity: 10,
        unitPrice: 1000,
        coefficient: 1,
      }),
      0,
    )
  })

  it('treats empty / negative quantity as 0', () => {
    assert.equal(
      calculateLineTotal({ enabled: true, quantity: 0, unitPrice: 1000, coefficient: 1 }),
      0,
    )
    assert.equal(
      calculateLineTotal({ enabled: true, quantity: -5, unitPrice: 1000, coefficient: 1 }),
      0,
    )
  })

  it('uses coefficient default 1 and changes total when coefficient changes', () => {
    const base = calculateLineTotal({
      enabled: true,
      quantity: 10,
      unitPrice: 900,
      coefficient: 1,
    })
    const boosted = calculateLineTotal({
      enabled: true,
      quantity: 10,
      unitPrice: 900,
      coefficient: 1.5,
    })
    assert.equal(base, 9000)
    assert.equal(boosted, 13500)
  })

  it('rounds each line to rubles; section total is sum of rounded lines', () => {
    const lineA = calculateLineTotal({
      enabled: true,
      quantity: 1.4,
      unitPrice: 100,
      coefficient: 1,
    })
    const lineB = calculateLineTotal({
      enabled: true,
      quantity: 1.4,
      unitPrice: 100,
      coefficient: 1,
    })
    assert.equal(lineA, 140)
    assert.equal(
      calculateEstimateTotal([
        {
          id: 'floors',
          title: 'floors',
          lines: [
            {
              id: 'a',
              priceKey: 'a',
              sectionId: 'floors',
              kind: 'self-leveling',
              title: 'A',
              unit: 'м²',
              unitPrice: 100,
              quantity: 1.4,
              coefficient: 1,
              enabled: true,
              source: 'pdf',
            },
            {
              id: 'b',
              priceKey: 'b',
              sectionId: 'floors',
              kind: 'self-leveling',
              title: 'B',
              unit: 'м²',
              unitPrice: 100,
              quantity: 1.4,
              coefficient: 1,
              enabled: true,
              source: 'pdf',
            },
          ],
        },
      ]),
      lineA + lineB,
    )
  })

  it('applies wetZonesArea only to waterproofing default quantities', () => {
    const lines = buildFloorEstimateLines(sampleInput)
    const waterproofing = lines.filter((line) => line.kind === 'waterproofing')
    const demolition = lines.filter((line) => line.kind === 'demolition')
    const waste = lines.filter((line) => line.kind === 'waste')

    assert.ok(waterproofing.length > 0)
    for (const line of waterproofing) {
      if (line.priceKey === 'waterproofing-shower-tray') {
        assert.equal(line.quantity, 0)
      } else {
        assert.equal(line.quantity, 6)
      }
    }

    for (const line of demolition) {
      if (line.unit === 'м²' && line.priceKey !== 'demolition-damper-sound-after-screed') {
        assert.equal(line.quantity, 40)
      }
    }

    for (const line of waste) {
      assert.equal(line.quantity, 0)
      assert.equal(line.enabled, false)
    }
  })

  it('returns recommendations by height difference without enabling lines', () => {
    assert.equal(getFloorRecommendation(3).level, 'up-to-5')
    assert.equal(getFloorRecommendation(12).level, '5-to-20')
    assert.equal(getFloorRecommendation(35).level, '20-to-50')
    assert.equal(getFloorRecommendation(80).level, 'over-50')

    const result = buildFloorEstimate({ ...sampleInput, avgDeltaMm: 35 })
    assert.equal(result.recommendation.level, '20-to-50')
    assert.equal(result.selectedCount, 0)
    assert.equal(result.totalRub, 0)
    assert.equal(result.materialsExcluded, true)
    assert.ok(result.recommendation.suggestedPriceKeys.includes('semidry-screed-up-to-80'))
  })

  it('keeps recommendation suggested keys inside FLOOR_PRICE_MAPPING', () => {
    const ids = new Set(FLOOR_PRICE_MAPPING.map((item) => item.id))
    for (const delta of [0, 3, 12, 35, 80]) {
      const recommendation = getFloorRecommendation(delta)
      for (const key of recommendation.suggestedPriceKeys) {
        assert.ok(ids.has(key), `missing mapping id for suggested key: ${key}`)
      }
    }
  })

  it('builds all mapping rows and can enable a line with total', () => {
    assert.ok(FLOOR_PRICE_MAPPING.length >= 40)

    const result = buildFloorEstimate(sampleInput, {
      enabledByKey: {
        'self-leveling-device': true,
        'waterproofing-acrylic-2': true,
      },
    })

    assert.equal(result.selectedCount, 2)
    assert.equal(result.totalRub, Math.round(45 * 900) + Math.round(6 * 700))
  })

  it('applies quantity helpers without auto-enabling rows', () => {
    let lines = buildFloorEstimateLines(sampleInput)
    lines = applyDemolitionAreaToDemolitionWorks(lines, 40)
    lines = applyWetAreaToWaterproofing(lines, 5)

    const demolition = lines.find((line) => line.priceKey === 'demolition-laminate')
    const hydro = lines.find((line) => line.priceKey === 'waterproofing-acrylic-1')
    assert.equal(demolition?.quantity, 40)
    assert.equal(demolition?.enabled, false)
    assert.equal(hydro?.quantity, 5)
    assert.equal(hydro?.enabled, false)
  })

  it('supports manual lines and price overrides in totals', () => {
    const manual = createManualEstimateLine({
      title: 'Доп. работа',
      unit: 'м²',
      unitPrice: 500,
      quantity: 3,
    })
    assert.equal(manual.source, 'manual')
    assert.equal(manual.enabled, true)
    assert.equal(calculateLineTotal(manual), 1500)

    const overridden = updateEstimateLine([manual], manual.id, {
      coefficient: 1.2,
      unitPrice: 500,
    })[0]
    assert.equal(calculateLineTotal(overridden), 1800)
  })

  it('groups lines and computes group totals from enabled rows only', () => {
    let lines = buildFloorEstimateLines(sampleInput)
    lines = lines.map((line) =>
      line.priceKey === 'demolition-laminate' || line.priceKey === 'semidry-screed-up-to-80'
        ? { ...line, enabled: true }
        : line,
    )

    const groups = groupFloorEstimateLines(lines)
    const demolition = groups.find((group) => group.id === 'demolition')
    const screed = groups.find((group) => group.id === 'screed')
    const waste = groups.find((group) => group.id === 'waste')

    assert.ok(demolition)
    assert.ok(screed)
    assert.ok(waste)
    assert.equal(demolition.selectedCount, 1)
    assert.equal(demolition.totalRub, Math.round(40 * 300))
    assert.equal(screed.selectedCount, 1)
    assert.equal(screed.totalRub, Math.round(45 * 1300))
    assert.equal(waste.selectedCount, 0)
    assert.equal(waste.totalRub, 0)
    assert.deepEqual(getDefaultOpenFloorGroupIds(groups), [])
  })

  it('keeps floor groups collapsed by default when nothing is selected', () => {
    const groups = groupFloorEstimateLines(buildFloorEstimateLines(sampleInput))
    assert.deepEqual(getDefaultOpenFloorGroupIds(groups), [])
  })

  it('applies demolition covering preset without conflicting alternatives', () => {
    let lines = buildFloorEstimateLines(sampleInput)
    lines = lines.map((line) =>
      line.priceKey === 'demolition-floating-laminate-engineered'
        ? { ...line, enabled: true, quantity: 40 }
        : line,
    )

    const result = applyFloorPreset(lines, sampleInput, {
      presetId: 'demolition-covering',
      covering: 'laminate',
    })

    const laminate = result.lines.find((line) => line.priceKey === 'demolition-laminate')
    const floating = result.lines.find(
      (line) => line.priceKey === 'demolition-floating-laminate-engineered',
    )
    const linoleum = result.lines.find((line) => line.priceKey === 'demolition-linoleum')
    const waste = result.lines.find((line) => line.priceKey === 'waste-gazelle-6')

    assert.equal(laminate?.enabled, true)
    assert.equal(laminate?.quantity, 40)
    assert.equal(floating?.enabled, false)
    assert.equal(linoleum?.enabled, false)
    assert.equal(waste?.enabled, false)
    assert.equal(result.addedCount, 1)
    assert.match(result.presetLabel, /Демонтаж/)
  })

  it('applies screed preset with one main screed type and prep chain', () => {
    const result = applyFloorPreset(buildFloorEstimateLines(sampleInput), sampleInput, {
      presetId: 'screed-on-slab',
      screedType: 'semidry-up-to-80',
    })

    const enabledKeys = result.lines.filter((line) => line.enabled).map((line) => line.priceKey)
    assert.deepEqual(enabledKeys.sort(), [
      'semidry-dust-removal',
      'semidry-prep',
      'semidry-primer',
      'semidry-screed-up-to-80',
    ])
    assert.equal(
      result.lines.find((line) => line.priceKey === 'semidry-screed-over-80')?.enabled,
      false,
    )
    assert.equal(result.lines.find((line) => line.priceKey === 'wet-screed-up-to-50')?.enabled, false)
    assert.equal(
      result.lines.find((line) => line.priceKey === 'self-leveling-device')?.enabled,
      false,
    )
  })

  it('applies self-leveling preset without enabling screed rows', () => {
    const result = applyFloorPreset(buildFloorEstimateLines(sampleInput), sampleInput, {
      presetId: 'self-leveling',
    })
    const enabledKeys = result.lines.filter((line) => line.enabled).map((line) => line.priceKey)
    assert.ok(enabledKeys.includes('self-leveling-device'))
    assert.ok(enabledKeys.includes('self-leveling-primer'))
    assert.equal(enabledKeys.includes('semidry-screed-up-to-80'), false)
    assert.equal(enabledKeys.includes('wet-screed-up-to-50'), false)
  })

  it('applies wet-zones preset with exclusive acrylic layer choice', () => {
    let lines = buildFloorEstimateLines(sampleInput)
    lines = lines.map((line) =>
      line.priceKey === 'waterproofing-acrylic-1' ? { ...line, enabled: true } : line,
    )

    const result = applyFloorPreset(lines, sampleInput, {
      presetId: 'wet-zones',
      layers: 'acrylic-2',
    })

    assert.equal(
      result.lines.find((line) => line.priceKey === 'waterproofing-acrylic-2')?.enabled,
      true,
    )
    assert.equal(
      result.lines.find((line) => line.priceKey === 'waterproofing-acrylic-1')?.enabled,
      false,
    )
    assert.equal(
      result.lines.find((line) => line.priceKey === 'waterproofing-acrylic-2')?.quantity,
      6,
    )
  })

  it('keeps manual rows and unrelated enabled rows when applying a preset', () => {
    let lines = buildFloorEstimateLines(sampleInput)
    const manual = createManualEstimateLine({
      title: 'Ручная',
      unit: 'м²',
      unitPrice: 100,
      quantity: 2,
    })
    lines = [
      ...lines.map((line) =>
        line.priceKey === 'waste-pass-permit' ? { ...line, enabled: true } : line,
      ),
      manual,
    ]

    const result = applyFloorPreset(lines, sampleInput, {
      presetId: 'demolition-covering',
      covering: 'linoleum',
    })

    assert.equal(result.lines.find((line) => line.id === manual.id)?.enabled, true)
    assert.equal(result.lines.find((line) => line.priceKey === 'waste-pass-permit')?.enabled, true)
    assert.equal(result.lines.find((line) => line.priceKey === 'demolition-linoleum')?.enabled, true)
  })
})
