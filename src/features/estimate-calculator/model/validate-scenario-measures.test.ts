import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  canApplyCeilingScenario,
  canApplyFloorPreset,
  canApplyTileScenario,
  canApplyWallScenario,
  getScenarioMeasuresDisabledHint,
  SCENARIO_MEASURES_HINT_GENERAL,
  SCENARIO_MEASURES_HINT_ZONE,
  validateCeilingScenarioMeasures,
  validateFloorPresetMeasures,
  validateTileScenarioMeasures,
  validateWallScenarioMeasures,
} from './validate-scenario-measures'

const emptyFloorInput = {
  totalFloorArea: 0,
  demolitionArea: 0,
  screedArea: 0,
  wetZonesArea: 0,
  avgDeltaMm: 0,
  surveyorComment: '',
}

const emptyWallInput = {
  totalWallArea: 0,
  demolitionArea: 0,
  plasterArea: 0,
  puttyArea: 0,
  finishArea: 0,
  wallHeightM: 0,
  slopesLengthM: 0,
  cornersLengthM: 0,
  surveyorComment: '',
}

const emptyCeilingInput = {
  totalCeilingArea: 0,
  demolitionArea: 0,
  plasterArea: 0,
  puttyArea: 0,
  finishArea: 0,
  surveyorComment: '',
}

const emptyTileInput = {
  floorTileArea: 0,
  wallTileArea: 0,
  backsplashArea: 0,
  cuttingLength: 0,
  cornerLength: 0,
  holesCount: 0,
  repairCount: 0,
  surveyorComment: '',
}

describe('validateFloorPresetMeasures', () => {
  it('allows waste without areas', () => {
    const result = validateFloorPresetMeasures({
      application: { presetId: 'waste', trip: 'gazelle-6' },
      input: emptyFloorInput,
    })
    assert.equal(result.ok, true)
  })

  it('rejects demolition covering with zero demolition area', () => {
    const result = validateFloorPresetMeasures({
      application: { presetId: 'demolition-covering', covering: 'laminate' },
      input: emptyFloorInput,
    })
    assert.equal(result.ok, false)
    if (!result.ok) {
      assert.match(result.message, /Заполните замеры раздела/)
    }
  })

  it('accepts screed when total floor area is set', () => {
    const result = validateFloorPresetMeasures({
      application: { presetId: 'screed-on-slab', screedType: 'semidry-up-to-80' },
      input: { ...emptyFloorInput, totalFloorArea: 40 },
    })
    assert.equal(result.ok, true)
  })

  it('rejects wet zones with zero wet area on a zone', () => {
    const result = validateFloorPresetMeasures({
      application: { presetId: 'wet-zones', layers: 'acrylic-2' },
      input: { ...emptyFloorInput, wetZonesArea: 5 },
      zone: {
        id: 'zone-1',
        name: 'Санузел',
        zoneType: 'other' as const,
        floorArea: 4,
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
      },
    })
    assert.equal(result.ok, false)
    if (!result.ok) {
      assert.match(result.message, /зоне нет нужных замеров/)
    }
  })
})

describe('validateWallScenarioMeasures', () => {
  it('rejects from-scratch with zero wall measures', () => {
    const result = validateWallScenarioMeasures({
      application: { state: 'from-scratch', finishTarget: 'paint' },
      input: emptyWallInput,
    })
    assert.equal(result.ok, false)
  })

  it('accepts finish-only when finish area is set', () => {
    const result = validateWallScenarioMeasures({
      application: { state: 'finish-only', finishTarget: 'paint', paintLayers: 'paint-2' },
      input: { ...emptyWallInput, finishArea: 20 },
    })
    assert.equal(result.ok, true)
  })

  it('requires demolition and base area for after-demolition', () => {
    const onlyDemo = validateWallScenarioMeasures({
      application: { state: 'after-demolition', finishTarget: 'none', demolitionCovering: 'paint' },
      input: { ...emptyWallInput, demolitionArea: 10 },
    })
    assert.equal(onlyDemo.ok, false)

    const ok = validateWallScenarioMeasures({
      application: { state: 'after-demolition', finishTarget: 'none', demolitionCovering: 'paint' },
      input: { ...emptyWallInput, demolitionArea: 10, totalWallArea: 40 },
    })
    assert.equal(ok.ok, true)
  })
})

describe('validateCeilingScenarioMeasures', () => {
  it('rejects zero-input from-scratch and does not imply success', () => {
    const result = validateCeilingScenarioMeasures({
      application: { state: 'from-scratch', finishTarget: 'paint', paintLayers: 'paint-ceiling-2' },
      input: emptyCeilingInput,
    })
    assert.equal(result.ok, false)
    if (!result.ok) {
      assert.match(result.message, /Заполните замеры раздела/)
    }
  })

  it('zero-input guard blocks success path before domain apply would enable zero-qty lines', () => {
    const application = {
      state: 'from-scratch' as const,
      finishTarget: 'paint' as const,
      paintLayers: 'paint-ceiling-2' as const,
    }
    const check = validateCeilingScenarioMeasures({
      application,
      input: emptyCeilingInput,
    })
    assert.equal(check.ok, false)
    // UI must not call apply when check fails — otherwise domain would enable lines with qty 0.
  })

  it('accepts demolition-only when demolition area is set', () => {
    const result = validateCeilingScenarioMeasures({
      application: {
        state: 'demolition-only',
        finishTarget: 'none',
        demolitionCovering: 'paint',
      },
      input: { ...emptyCeilingInput, demolitionArea: 12 },
    })
    assert.equal(result.ok, true)
  })

  it('rejects zone scenario when zone ceiling fields are zero', () => {
    const result = validateCeilingScenarioMeasures({
      application: { state: 'prefinish', finishTarget: 'paint' },
      input: { ...emptyCeilingInput, totalCeilingArea: 50 },
      zone: {
        id: 'zone-2',
        name: 'Кухня',
        zoneType: 'other' as const,
        floorArea: 10,
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
      },
    })
    assert.equal(result.ok, false)
    if (!result.ok) {
      assert.match(result.message, /зоне нет нужных замеров/)
    }
  })
})

describe('canApply helpers and disabled hints', () => {
  it('exposes short disabled hints for general and zone targets', () => {
    assert.equal(getScenarioMeasuresDisabledHint(false), SCENARIO_MEASURES_HINT_GENERAL)
    assert.equal(getScenarioMeasuresDisabledHint(true), SCENARIO_MEASURES_HINT_ZONE)
  })

  it('disables wall and ceiling scenarios after reset / zero inputs', () => {
    assert.equal(
      canApplyWallScenario({
        application: { state: 'from-scratch', finishTarget: 'paint' },
        input: emptyWallInput,
      }),
      false,
    )
    assert.equal(
      canApplyCeilingScenario({
        application: {
          state: 'from-scratch',
          finishTarget: 'paint',
          paintLayers: 'paint-ceiling-2',
        },
        input: emptyCeilingInput,
      }),
      false,
    )
  })

  it('keeps floor waste enabled without area and disables demolition without area', () => {
    assert.equal(
      canApplyFloorPreset({
        application: { presetId: 'waste', trip: 'gazelle-6' },
        input: emptyFloorInput,
      }),
      true,
    )
    assert.equal(
      canApplyFloorPreset({
        application: { presetId: 'demolition-covering', covering: 'laminate' },
        input: emptyFloorInput,
      }),
      false,
    )
  })

  it('disables scenario for zero zone fields and enables when zone fields are filled', () => {
    const emptyZone = {
      id: 'zone-3',
      name: 'Комната',
        zoneType: 'other' as const,
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
    }
    assert.equal(
      canApplyCeilingScenario({
        application: { state: 'prefinish', finishTarget: 'paint' },
        input: { ...emptyCeilingInput, totalCeilingArea: 40 },
        zone: emptyZone,
      }),
      false,
    )
    assert.equal(
      canApplyCeilingScenario({
        application: { state: 'prefinish', finishTarget: 'paint' },
        input: emptyCeilingInput,
        zone: { ...emptyZone, ceilingArea: 12, puttyCeilingArea: 12 },
      }),
      true,
    )
    assert.equal(
      canApplyWallScenario({
        application: { state: 'finish-only', finishTarget: 'paint', paintLayers: 'paint-2' },
        input: emptyWallInput,
        zone: { ...emptyZone, finishArea: 18 },
      }),
      true,
    )
  })
})

describe('validateTileScenarioMeasures', () => {
  it('rejects bathroom-from-scratch with zero tile areas', () => {
    const result = validateTileScenarioMeasures({
      application: { state: 'bathroom-from-scratch', cladFormat: '301-1300', grout: 'cement' },
      input: emptyTileInput,
    })
    assert.equal(result.ok, false)
  })

  it('accepts floor-only when floor tile area is set', () => {
    const result = validateTileScenarioMeasures({
      application: { state: 'floor-only', cladFormat: '301-1300', grout: 'none' },
      input: { ...emptyTileInput, floorTileArea: 12 },
    })
    assert.equal(result.ok, true)
  })

  it('requires backsplash for kitchen-backsplash', () => {
    const result = validateTileScenarioMeasures({
      application: { state: 'kitchen-backsplash', cladFormat: 'mosaic' },
      input: { ...emptyTileInput, floorTileArea: 10 },
    })
    assert.equal(result.ok, false)
    assert.equal(
      canApplyTileScenario({
        application: { state: 'kitchen-backsplash', cladFormat: 'mosaic' },
        input: { ...emptyTileInput, backsplashArea: 3 },
      }),
      true,
    )
  })
})
