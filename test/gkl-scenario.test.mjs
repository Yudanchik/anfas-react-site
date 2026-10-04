import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import { build } from 'esbuild'

async function load(entryPoint) {
  const bundle = await build({ entryPoints: [entryPoint], bundle: true, platform: 'node', format: 'esm', write: false })
  return import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`)
}

const walls = await load('src/entities/estimate/model/walls/apply-wall-scenario.ts')
const ceilings = await load('src/entities/estimate/model/ceilings/apply-ceiling-scenario.ts')
const measures = await load('src/features/estimate-calculator/model/validate-scenario-measures.ts')

const wallZone = {
  id: 'zone-1', name: 'Комната', wallArea: 25, gklWallSeamsLength: 12,
  demolitionWallArea: 0, plasterArea: 0, puttyArea: 0, finishArea: 0,
  slopesLength: 0, cornersLength: 0,
}
const wallApplication = {
  state: 'from-scratch', finishTarget: 'paint', substrate: 'drywall',
  baseCondition: 'sound', moisture: 'normal', quality: 'q3',
  gklConstruction: 'new-one', gklSeamsReady: false,
}

test('ГКЛ стены: каркас, листы и швы имеют разные единицы и не включают штукатурку', () => {
  const plan = walls.resolveWallScenarioPlan(wallApplication)
  assert.deepEqual(plan.issues, [])
  assert.ok(plan.keys.includes('gkl-wall-frame'))
  assert.ok(plan.keys.includes('gkl-wall-sheet-1'))
  assert.ok(plan.keys.includes('gkl-joint-tape'))
  assert.equal(plan.keys.includes('putty-gkl-joint-expand'), false)
  assert.equal(plan.keys.some((key) => key.startsWith('plaster-')), false)
  const result = walls.applyWallScenarioToZone([], wallZone, wallApplication)
  assert.equal(result.lines.find((line) => line.priceKey === 'gkl-wall-frame')?.quantity, 25)
  assert.equal(result.lines.find((line) => line.priceKey === 'gkl-joint-tape')?.quantity, 12)
  assert.equal(result.lines.find((line) => line.priceKey === 'gkl-joint-fill')?.quantity, 12)
  assert.equal(result.lines.find((line) => line.priceKey === 'gkl-screws')?.quantity, 25)
})

test('ГКЛ стены: два слоя добавляют подготовку первого, готовые швы не считаются повторно', () => {
  const two = walls.resolveWallScenarioPlan({ ...wallApplication, gklConstruction: 'new-two' })
  assert.ok(two.keys.includes('gkl-first-layer-joints'))
  assert.ok(two.keys.includes('gkl-wall-sheet-2'))
  const ready = walls.resolveWallScenarioPlan({
    ...wallApplication, gklConstruction: 'existing', gklSeamsReady: true,
  })
  assert.equal(ready.keys.includes('gkl-joint-tape'), false)
  assert.equal(ready.keys.includes('gkl-joint-fill'), false)
  assert.equal(ready.keys.includes('gkl-screws'), false)
})

test('ГКЛ стены: необработанные швы требуют измеренной длины', () => {
  const input = { totalWallArea: 25, demolitionArea: 0, plasterArea: 0, puttyArea: 0,
    finishArea: 0, wallHeightM: 2.7, slopesLengthM: 0, cornersLengthM: 0 }
  const missing = measures.validateWallScenarioMeasures({
    application: wallApplication, input, zone: { ...wallZone, gklWallSeamsLength: 0 },
  })
  assert.equal(missing.ok, false)
  assert.match(missing.message, /стыков/)
  const ready = measures.validateWallScenarioMeasures({ application: wallApplication, input, zone: wallZone })
  assert.equal(ready.ok, true)
})

const ceilingZone = {
  id: 'zone-2', name: 'Спальня', ceilingArea: 18, gklCeilingSeamsLength: 9,
  demolitionCeilingArea: 0, plasterCeilingArea: 0, puttyCeilingArea: 0, finishCeilingArea: 0,
}
const ceilingApplication = {
  state: 'from-scratch', finishTarget: 'paint', substrate: 'drywall',
  quality: 'q3', gklConstruction: 'new-two', gklSeamsReady: false,
}

test('ГКЛ потолок: тариф двухслойного потолка включает каркас и листы; швы отдельно', () => {
  const plan = ceilings.resolveCeilingScenarioPlan(ceilingApplication)
  assert.deepEqual(plan.issues, [])
  assert.ok(plan.keys.includes('gkl-ceiling-two'))
  assert.ok(plan.keys.includes('gkl-ceiling-first-layer-joints'))
  assert.equal(plan.keys.includes('gkl-ceiling-one'), false)
  assert.equal(plan.keys.includes('plaster-ceiling-main'), false)
  const result = ceilings.applyCeilingScenarioToZone([], ceilingZone, ceilingApplication)
  assert.equal(result.lines.find((line) => line.priceKey === 'gkl-ceiling-two')?.quantity, 18)
  assert.equal(result.lines.find((line) => line.priceKey === 'gkl-ceiling-joint-tape')?.quantity, 9)
  assert.equal(result.lines.find((line) => line.priceKey === 'gkl-ceiling-joint-fill')?.quantity, 9)
})

test('ГКЛ потолок: повторный выбор одного слоя выключает старый двухслойный пакет', () => {
  const first = ceilings.applyCeilingScenarioToZone([], ceilingZone, ceilingApplication)
  const second = ceilings.applyCeilingScenarioToZone(first.lines, ceilingZone, {
    ...ceilingApplication, gklConstruction: 'new-one',
  })
  assert.equal(second.lines.find((line) => line.priceKey === 'gkl-ceiling-one')?.enabled, true)
  assert.equal(second.lines.find((line) => line.priceKey === 'gkl-ceiling-two')?.enabled, false)
  assert.equal(second.lines.find((line) => line.priceKey === 'gkl-ceiling-first-layer-joints')?.enabled, false)
})


test('ГКЛ не выдаёт гладкую окраску Q2 или мокрую зону за готовый типовой маршрут', () => {
  const q2 = walls.resolveWallScenarioPlan({ ...wallApplication, quality: 'q2' })
  const wet = walls.resolveWallScenarioPlan({ ...wallApplication, moisture: 'wet' })
  assert.ok(q2.issues.some((issue) => issue.includes('Q3')))
  assert.ok(wet.issues.some((issue) => issue.includes('прямого попадания воды')))
})


test('ГКЛ Q3 грунтуется перед сплошной шпаклёвкой и отдельно перед окраской', () => {
  const keys = walls.resolveWallScenarioPlan(wallApplication).keys
  assert.ok(keys.indexOf('gkl-joint-fill') < keys.indexOf('primer-before-putty'))
  assert.ok(keys.indexOf('primer-before-putty') < keys.indexOf('putty-base-1'))
  assert.ok(keys.indexOf('putty-sanding') < keys.indexOf('primer-one-layer'))
  const textured = walls.resolveWallScenarioPlan({ ...wallApplication, quality: 'q2', finishTarget: 'none' }).keys
  assert.equal(textured.includes('primer-before-putty'), false)
})


test('ГКЛ: промежуточный грунт добавляется между базовой и финишной шпаклёвкой по ответу', () => {
  const keys = walls.resolveWallScenarioPlan({ ...wallApplication, primerBetweenPuttyLayers: true }).keys
  assert.ok(keys.indexOf('putty-base-1') < keys.indexOf('primer-between-putty-layers'))
  assert.ok(keys.indexOf('primer-between-putty-layers') < keys.indexOf('putty-finish-1'))
  const q2 = walls.resolveWallScenarioPlan({ ...wallApplication, quality: 'q2', finishTarget: 'none',
    primerBetweenPuttyLayers: true }).keys
  assert.equal(q2.includes('primer-between-putty-layers'), false)
})
