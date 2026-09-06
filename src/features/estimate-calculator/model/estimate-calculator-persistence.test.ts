import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildEstimateCalculatorSnapshot,
  parseEstimateCalculatorSnapshot,
  restoreCeilingEstimateState,
  restoreElectricEstimateState,
  restoreEstimateZones,
  restoreFloorEstimateState,
  restoreTileEstimateState,
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
          zoneType: 'kitchen',
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
          tileFloorArea: 0,
          tileWallArea: 0,
          tileBacksplashArea: 0,
          tileCuttingLength: 0,
          tileCornerLength: 0,
          tileHolesCount: 0,
          tileRepairCount: 0,
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

  it('defaults missing zoneType to other when restoring zones with unrecognized names', () => {
    const parsed = parseEstimateCalculatorSnapshot({
      version: 2,
      activeTab: 'floors',
      zones: [{ id: 'zone-2', name: 'Старая зона', floorArea: 10 }],
      floors: {
        input: restoreFloorEstimateState(null).input,
        lines: [],
      },
      walls: {
        input: restoreWallEstimateState(null).input,
        lines: [],
      },
    })
    assert.ok(parsed)
    assert.equal(parsed.zones[0]?.zoneType, 'other')
  })

  it('infers bathroom from name when restoring other/missing zoneType', () => {
    const parsed = parseEstimateCalculatorSnapshot({
      version: 2,
      activeTab: 'tile',
      zones: [
        { id: 'zone-3', name: 'Санузел', floorArea: 4 },
        { id: 'zone-4', name: 'Санузел', zoneType: 'other', floorArea: 4 },
        { id: 'zone-5', name: 'Санузел', zoneType: 'kitchen', floorArea: 4 },
      ],
      floors: {
        input: restoreFloorEstimateState(null).input,
        lines: [],
      },
      walls: {
        input: restoreWallEstimateState(null).input,
        lines: [],
      },
    })
    assert.ok(parsed)
    assert.equal(parsed.zones[0]?.zoneType, 'bathroom')
    assert.equal(parsed.zones[1]?.zoneType, 'bathroom')
    assert.equal(parsed.zones[2]?.zoneType, 'kitchen')
  })

  it('parses a v2 snapshot without tile and restores empty tile', () => {
    const v2NoTile = {
      version: 2,
      activeTab: 'ceilings',
      zones: [],
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
          totalWallArea: 20,
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
      ceilings: {
        input: {
          totalCeilingArea: 15,
          demolitionArea: 0,
          plasterArea: 0,
          puttyArea: 0,
          finishArea: 0,
          surveyorComment: '',
        },
        lines: [],
      },
    }

    const parsed = parseEstimateCalculatorSnapshot(v2NoTile)
    assert.ok(parsed)
    const tile = restoreTileEstimateState(parsed)
    assert.equal(tile.input.floorTileArea, 0)
    assert.equal(tile.input.wallTileArea, 0)
    assert.ok(tile.lines.length > 0)
    assert.ok(tile.lines.every((line) => line.enabled === false))
    assert.ok(tile.lines.every((line) => line.sectionId === 'tile'))
  })

  it('round-trips tile fields and zone tile measures', () => {
    const snapshot = buildEstimateCalculatorSnapshot({
      activeTab: 'tile',
      zones: [
        {
          id: 'zone-9',
          name: 'Санузел',
          zoneType: 'bathroom',
          floorArea: 0,
          demolitionFloorArea: 0,
          screedArea: 0,
          wetArea: 0,
          wallArea: 0,
          demolitionWallArea: 0,
          plasterArea: 0,
          puttyArea: 0,
          finishArea: 0,
          slopesLength: 0,
          cornersLength: 0,
          ceilingArea: 0,
          demolitionCeilingArea: 0,
          plasterCeilingArea: 0,
          puttyCeilingArea: 0,
          finishCeilingArea: 0,
          tileFloorArea: 7,
          tileWallArea: 21,
          tileBacksplashArea: 0,
          tileCuttingLength: 2,
          tileCornerLength: 8,
          tileHolesCount: 3,
          tileRepairCount: 0,
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
        },
      ],
      floorsInput: restoreFloorEstimateState(null).input,
      floorsLines: restoreFloorEstimateState(null).lines,
      wallsInput: restoreWallEstimateState(null).input,
      wallsLines: restoreWallEstimateState(null).lines,
      tileInput: {
        floorTileArea: 7,
        wallTileArea: 21,
        backsplashArea: 0,
        cuttingLength: 2,
        cornerLength: 8,
        holesCount: 3,
        repairCount: 0,
        surveyorComment: 'tile note',
      },
      tileLines: restoreTileEstimateState(null).lines.map((line) =>
        line.priceKey === 'clad-301-1300'
          ? { ...line, enabled: true, quantity: 28, comment: 'ok' }
          : line,
      ),
      tileScenarios: {
        state: 'bathroom-from-scratch',
        cladFormat: '301-1300',
        grout: 'cement',
        demolitionSurfaces: 'both',
      },
    })

    const parsed = parseEstimateCalculatorSnapshot(JSON.parse(JSON.stringify(snapshot)))
    assert.ok(parsed)
    assert.equal(parsed.activeTab, 'tile')
    assert.equal(parsed.zones[0]?.tileFloorArea, 7)
    assert.equal(parsed.zones[0]?.tileWallArea, 21)
    assert.equal(parsed.zones[0]?.tileHolesCount, 3)
    assert.equal(parsed.zones[0]?.zoneType, 'bathroom')
    assert.equal(parsed.tileScenarios?.cladFormat, '301-1300')

    const tile = restoreTileEstimateState(parsed)
    assert.equal(tile.input.floorTileArea, 7)
    assert.equal(tile.input.surveyorComment, 'tile note')
    const clad = tile.lines.find((line) => line.priceKey === 'clad-301-1300')
    assert.ok(clad)
    assert.equal(clad.enabled, true)
    assert.equal(clad.quantity, 28)
    assert.equal(clad.comment, 'ok')
  })

  it('parses a v2 snapshot without electrics and restores empty electrics', () => {
    const v2NoElectrics = {
      version: 2,
      activeTab: 'tile',
      zones: [],
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
          totalWallArea: 20,
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

    const parsed = parseEstimateCalculatorSnapshot(v2NoElectrics)
    assert.ok(parsed)
    const electrics = restoreElectricEstimateState(parsed)
    assert.equal(electrics.input.electricSocketsCount, 0)
    assert.equal(electrics.input.electricCableLength, 0)
    assert.ok(electrics.lines.length > 0)
    assert.ok(electrics.lines.every((line) => line.enabled === false))
    assert.ok(electrics.lines.every((line) => line.sectionId === 'electrics'))
  })

  it('round-trips electric fields and zone electric measures', () => {
    const snapshot = buildEstimateCalculatorSnapshot({
      activeTab: 'electrics',
      zones: [
        {
          id: 'zone-e1',
          name: 'Кухня',
          zoneType: 'kitchen',
          floorArea: 0,
          demolitionFloorArea: 0,
          screedArea: 0,
          wetArea: 0,
          wallArea: 0,
          demolitionWallArea: 0,
          plasterArea: 0,
          puttyArea: 0,
          finishArea: 0,
          slopesLength: 0,
          cornersLength: 0,
          ceilingArea: 0,
          demolitionCeilingArea: 0,
          plasterCeilingArea: 0,
          puttyCeilingArea: 0,
          finishCeilingArea: 0,
          tileFloorArea: 0,
          tileWallArea: 0,
          tileBacksplashArea: 0,
          tileCuttingLength: 0,
          tileCornerLength: 0,
          tileHolesCount: 0,
          tileRepairCount: 0,
          electricSocketsCount: 10,
          electricSwitchesCount: 4,
          electricLightPointsCount: 6,
          electricDataPointsCount: 2,
          electricStrobeLength: 18,
          electricCableLength: 35,
          electricSocketBoxesCount: 10,
          electricJunctionBoxesCount: 2,
          electricPanelModulesCount: 0,
          electricWarmFloorArea: 0,
          electricApplianceConnectionsCount: 3,
        },
      ],
      floorsInput: restoreFloorEstimateState(null).input,
      floorsLines: restoreFloorEstimateState(null).lines,
      wallsInput: restoreWallEstimateState(null).input,
      wallsLines: restoreWallEstimateState(null).lines,
      electricInput: {
        electricSocketsCount: 10,
        electricSwitchesCount: 4,
        electricLightPointsCount: 6,
        electricDataPointsCount: 2,
        electricStrobeLength: 18,
        electricCableLength: 35,
        electricSocketBoxesCount: 10,
        electricJunctionBoxesCount: 2,
        electricPanelModulesCount: 12,
        electricWarmFloorArea: 0,
        electricApplianceConnectionsCount: 3,
        surveyorComment: 'electric note',
      },
      electricLines: restoreElectricEstimateState(null).lines.map((line) =>
        line.priceKey === 'finish-outlet-switch'
          ? { ...line, enabled: true, quantity: 10, comment: 'ok' }
          : line,
      ),
      electricScenarios: {
        state: 'kitchen',
      },
    })

    const parsed = parseEstimateCalculatorSnapshot(JSON.parse(JSON.stringify(snapshot)))
    assert.ok(parsed)
    assert.equal(parsed.activeTab, 'electrics')
    assert.equal(parsed.zones[0]?.electricSocketsCount, 10)
    assert.equal(parsed.zones[0]?.electricCableLength, 35)
    assert.equal(parsed.zones[0]?.electricApplianceConnectionsCount, 3)
    assert.equal(parsed.zones[0]?.zoneType, 'kitchen')
    assert.equal(parsed.electricScenarios?.state, 'kitchen')

    const electrics = restoreElectricEstimateState(parsed)
    assert.equal(electrics.input.electricSocketsCount, 10)
    assert.equal(electrics.input.surveyorComment, 'electric note')
    const outlet = electrics.lines.find((line) => line.priceKey === 'finish-outlet-switch')
    assert.ok(outlet)
    assert.equal(outlet.enabled, true)
    assert.equal(outlet.quantity, 10)
    assert.equal(outlet.comment, 'ok')
  })
})
