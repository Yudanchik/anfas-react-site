import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildEstimateCalculatorSnapshot,
  parseEstimateCalculatorSnapshot,
  restoreCeilingEstimateState,
  restoreEstimateZones,
  restoreFloorEstimateState,
  restoreWallEstimateState,
  type EstimateCalculatorSnapshot,
} from './estimate-calculator-persistence'

describe('estimate calculator persistence', () => {
  it('parses a valid v2 snapshot and restores enabled line patches', () => {
    const empty = buildEstimateCalculatorSnapshot({
      activeTab: 'walls',
      zones: [],
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
    assert.equal(parsed.version, 2)
    assert.equal(parsed.activeTab, 'walls')
    assert.equal(parsed.floors.input.totalFloorArea, 50)
    assert.equal(parsed.floors.input.surveyorComment, 'note')
    assert.deepEqual(parsed.zones, [])

    const floors = restoreFloorEstimateState(parsed)
    const laminate = floors.lines.find((line) => line.priceKey === 'demolition-laminate')
    assert.ok(laminate)
    assert.equal(laminate.enabled, true)
    assert.equal(laminate.quantity, 40)
    assert.equal(laminate.comment, 'ok')
  })

  it('migrates v1 snapshots to v2 with empty zones', () => {
    const v1 = {
      version: 1,
      activeTab: 'floors',
      floors: {
        input: {
          totalFloorArea: 10,
          demolitionArea: 0,
          screedArea: 0,
          wetZonesArea: 0,
          avgDeltaMm: 0,
          surveyorComment: '',
        },
        lines: [],
      },
      walls: {
        input: {
          totalWallArea: 0,
          demolitionArea: 0,
          plasterArea: 0,
          puttyArea: 0,
          finishArea: 0,
          wallHeightM: 0,
          slopesLengthM: 0,
          cornersLengthM: 0,
          surveyorComment: '',
        },
        lines: [],
      },
    }

    const parsed = parseEstimateCalculatorSnapshot(v1)
    assert.ok(parsed)
    assert.equal(parsed.version, 2)
    assert.deepEqual(parsed.zones, [])
  })

  it('restores zones and zoneId on zoned lines', () => {
    const snapshot: EstimateCalculatorSnapshot = {
      version: 2,
      activeTab: 'floors',
      zones: [
        {
          id: 'zone-1',
          name: 'Кухня',
          floorArea: 12,
          demolitionFloorArea: 12,
          screedArea: 12,
          wetArea: 0,
          wallArea: 30,
          demolitionWallArea: 0,
          plasterArea: 30,
          puttyArea: 30,
          finishArea: 30,
          slopesLength: 0,
          cornersLength: 0,
          ceilingArea: 0,
          demolitionCeilingArea: 0,
          plasterCeilingArea: 0,
          puttyCeilingArea: 0,
          finishCeilingArea: 0,
        },
      ],
      floors: {
        input: restoreFloorEstimateState(null).input,
        lines: [
          {
            id: 'floors:zone-4',
            priceKey: 'demolition-laminate',
            enabled: true,
            quantity: 12,
            unitPrice: 300,
            coefficient: 1,
            source: 'both',
            title: 'Демонтаж ламината',
            unit: 'м²',
            sectionId: 'floors',
            kind: 'demolition',
            zoneId: 'zone-1',
            zoneName: 'Кухня',
          },
        ],
      },
      walls: {
        input: restoreWallEstimateState(null).input,
        lines: [],
      },
    }

    const zones = restoreEstimateZones(snapshot)
    assert.equal(zones.length, 1)
    assert.equal(zones[0]?.name, 'Кухня')

    const floors = restoreFloorEstimateState(snapshot)
    const zoned = floors.lines.find((line) => line.id === 'floors:zone-4')
    assert.ok(zoned)
    assert.equal(zoned.zoneId, 'zone-1')
    assert.equal(zoned.zoneName, 'Кухня')
  })

  it('ignores corrupt or wrong-version payloads', () => {
    assert.equal(parseEstimateCalculatorSnapshot(null), null)
    assert.equal(parseEstimateCalculatorSnapshot({ version: 99 }), null)
    assert.equal(
      parseEstimateCalculatorSnapshot({
        version: 2,
        activeTab: 'floors',
      }),
      null,
    )
  })

  it('restores manual lines by id', () => {
    const base = restoreFloorEstimateState(null)
    const snapshot: EstimateCalculatorSnapshot = {
      version: 2,
      activeTab: 'floors',
      zones: [],
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

  it('restores zoned clone lines with zoneName without overwriting canonical rows', () => {
    const base = restoreFloorEstimateState(null)
    const snapshot: EstimateCalculatorSnapshot = {
      version: 2,
      activeTab: 'floors',
      zones: [],
      floors: {
        input: base.input,
        lines: [
          {
            id: 'floors:demolition-laminate',
            priceKey: 'demolition-laminate',
            enabled: false,
            quantity: 0,
            unitPrice: 300,
            coefficient: 1,
            source: 'both',
          },
          {
            id: 'floors:zone-3',
            priceKey: 'demolition-laminate',
            enabled: true,
            quantity: 20,
            unitPrice: 300,
            coefficient: 1,
            source: 'both',
            title: 'Демонтаж ламината',
            unit: 'м²',
            sectionId: 'floors',
            kind: 'demolition',
            zoneName: 'Кухня',
          },
        ],
      },
      walls: {
        input: restoreWallEstimateState(null).input,
        lines: [],
      },
    }

    const restored = restoreFloorEstimateState(snapshot)
    const canonical = restored.lines.find((line) => line.id === 'floors:demolition-laminate')
    const zoned = restored.lines.find((line) => line.id === 'floors:zone-3')
    assert.ok(canonical)
    assert.equal(canonical.enabled, false)
    assert.ok(zoned)
    assert.equal(zoned.enabled, true)
    assert.equal(zoned.quantity, 20)
    assert.equal(zoned.zoneName, 'Кухня')
    assert.equal(zoned.priceKey, 'demolition-laminate')
  })

  it('parses a v2 snapshot without ceilings and restores empty ceilings', () => {
    const v2NoCeilings = {
      version: 2,
      activeTab: 'walls',
      zones: [],
      floors: {
        input: {
          totalFloorArea: 30,
          demolitionArea: 0,
          screedArea: 0,
          wetZonesArea: 0,
          avgDeltaMm: 0,
          surveyorComment: '',
        },
        lines: [],
      },
      walls: {
        input: {
          totalWallArea: 60,
          demolitionArea: 0,
          plasterArea: 0,
          puttyArea: 0,
          finishArea: 0,
          wallHeightM: 0,
          slopesLengthM: 0,
          cornersLengthM: 0,
          surveyorComment: '',
        },
        lines: [],
      },
    }

    const parsed = parseEstimateCalculatorSnapshot(v2NoCeilings)
    assert.ok(parsed)
    assert.equal(parsed.version, 2)
    // floors/walls inputs preserved
    assert.equal(parsed.floors.input.totalFloorArea, 30)
    assert.equal(parsed.walls.input.totalWallArea, 60)

    // ceilings tolerated -> empty input + no lines
    const ceilings = restoreCeilingEstimateState(parsed)
    assert.equal(ceilings.input.totalCeilingArea, 0)
    assert.equal(ceilings.input.demolitionArea, 0)
    assert.ok(ceilings.lines.length > 0)
    assert.ok(ceilings.lines.every((line) => line.enabled === false))
    assert.ok(ceilings.lines.every((line) => line.sectionId === 'ceilings'))
  })

  it('round-trips a v2 snapshot with ceilings while preserving floors/walls', () => {
    const snapshot = buildEstimateCalculatorSnapshot({
      activeTab: 'ceilings',
      zones: [],
      floorsInput: restoreFloorEstimateState(null).input,
      floorsLines: restoreFloorEstimateState(null).lines.map((line) =>
        line.priceKey === 'demolition-laminate'
          ? { ...line, enabled: true, quantity: 15 }
          : line,
      ),
      wallsInput: restoreWallEstimateState(null).input,
      wallsLines: restoreWallEstimateState(null).lines.map((line) =>
        line.priceKey === 'paint-2' ? { ...line, enabled: true, quantity: 22 } : line,
      ),
      ceilingsInput: {
        totalCeilingArea: 48,
        demolitionArea: 12,
        plasterArea: 40,
        puttyArea: 40,
        finishArea: 40,
        surveyorComment: 'ceil note',
      },
      ceilingsLines: restoreCeilingEstimateState(null).lines.map((line) =>
        line.priceKey === 'paint-ceiling-2'
          ? { ...line, enabled: true, quantity: 40, comment: 'ok' }
          : line,
      ),
    })

    const parsed = parseEstimateCalculatorSnapshot(JSON.parse(JSON.stringify(snapshot)))
    assert.ok(parsed)
    assert.equal(parsed.activeTab, 'ceilings')

    // floors + walls preserved
    const floors = restoreFloorEstimateState(parsed)
    const laminate = floors.lines.find((line) => line.priceKey === 'demolition-laminate')
    assert.ok(laminate)
    assert.equal(laminate.enabled, true)
    assert.equal(laminate.quantity, 15)

    const walls = restoreWallEstimateState(parsed)
    const paint = walls.lines.find((line) => line.priceKey === 'paint-2')
    assert.ok(paint)
    assert.equal(paint.enabled, true)
    assert.equal(paint.quantity, 22)

    // ceilings restored
    const ceilings = restoreCeilingEstimateState(parsed)
    assert.equal(ceilings.input.totalCeilingArea, 48)
    assert.equal(ceilings.input.surveyorComment, 'ceil note')
    const ceilingPaint = ceilings.lines.find((line) => line.priceKey === 'paint-ceiling-2')
    assert.ok(ceilingPaint)
    assert.equal(ceilingPaint.enabled, true)
    assert.equal(ceilingPaint.quantity, 40)
    assert.equal(ceilingPaint.comment, 'ok')
  })
})
