import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildEstimateCalculatorSnapshot,
  parseEstimateCalculatorSnapshot,
  restoreFloorEstimateState,
  restoreWallEstimateState,
  type EstimateCalculatorSnapshot,
} from './estimate-calculator-persistence'

describe('estimate calculator persistence', () => {
  it('parses a valid v1 snapshot and restores enabled line patches', () => {
    const empty = buildEstimateCalculatorSnapshot({
      activeTab: 'walls',
      floorsInput: {
        totalFloorArea: 50,
        demolitionArea: 40,
        screedArea: 45,
        wetZonesArea: 6,
        avgDeltaMm: 12,
        surveyorComment: 'note',
      },
      floorsLines: restoreFloorEstimateState(null).lines.map((line) =>
        line.priceKey === 'demolition-laminate'
          ? { ...line, enabled: true, quantity: 40, comment: 'ok' }
          : line,
      ),
      wallsInput: {
        totalWallArea: 100,
        demolitionArea: 20,
        plasterArea: 90,
        puttyArea: 90,
        finishArea: 90,
        wallHeightM: 2.7,
        slopesLengthM: 4,
        cornersLengthM: 8,
        surveyorComment: '',
      },
      wallsLines: restoreWallEstimateState(null).lines,
    })

    const parsed = parseEstimateCalculatorSnapshot(JSON.parse(JSON.stringify(empty)))
    assert.ok(parsed)
    assert.equal(parsed.activeTab, 'walls')
    assert.equal(parsed.floors.input.totalFloorArea, 50)
    assert.equal(parsed.floors.input.surveyorComment, 'note')

    const floors = restoreFloorEstimateState(parsed)
    const laminate = floors.lines.find((line) => line.priceKey === 'demolition-laminate')
    assert.ok(laminate)
    assert.equal(laminate.enabled, true)
    assert.equal(laminate.quantity, 40)
    assert.equal(laminate.comment, 'ok')
  })

  it('ignores corrupt or wrong-version payloads', () => {
    assert.equal(parseEstimateCalculatorSnapshot(null), null)
    assert.equal(parseEstimateCalculatorSnapshot({ version: 99 }), null)
    assert.equal(
      parseEstimateCalculatorSnapshot({
        version: 1,
        activeTab: 'floors',
      }),
      null,
    )
  })

  it('restores manual lines by id', () => {
    const base = restoreFloorEstimateState(null)
    const snapshot: EstimateCalculatorSnapshot = {
      version: 1,
      activeTab: 'floors',
      floors: {
        input: base.input,
        lines: [
          {
            id: 'floors:manual-9',
            priceKey: 'manual-9',
            enabled: true,
            quantity: 3,
            unitPrice: 500,
            coefficient: 1,
            source: 'manual',
            title: 'Доп. работа',
            unit: 'м²',
            sectionId: 'floors',
            kind: 'other-rough',
          },
        ],
      },
      walls: {
        input: restoreWallEstimateState(null).input,
        lines: [],
      },
    }

    const restored = restoreFloorEstimateState(snapshot)
    const manual = restored.lines.find((line) => line.id === 'floors:manual-9')
    assert.ok(manual)
    assert.equal(manual.title, 'Доп. работа')
    assert.equal(manual.quantity, 3)
    assert.equal(manual.unitPrice, 500)
  })
})
