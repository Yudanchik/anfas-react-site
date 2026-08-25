import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  assertFloorMappingMatchesFrontend,
  buildFloorEstimate,
  buildFloorEstimateLines,
  calculateEstimateTotal,
  calculateLineTotal,
  FLOOR_PRICE_MAPPING,
  getFloorRecommendation,
} from './index'

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
})
