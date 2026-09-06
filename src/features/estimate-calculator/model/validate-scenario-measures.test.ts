import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  validateCeilingScenarioMeasures,
  validateFloorPresetMeasures,
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
      },
    })
    assert.equal(result.ok, false)
    if (!result.ok) {
      assert.match(result.message, /зоне нет нужных замеров/)
    }
  })
})
