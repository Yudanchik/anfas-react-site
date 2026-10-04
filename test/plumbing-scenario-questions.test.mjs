import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import { build } from 'esbuild'

const bundle = await build({
  entryPoints: ['src/entities/estimate/model/plumbing/apply-plumbing-scenario.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
})
const { resolvePlumbingScenarioPlan, resolveMeasuredPlumbingScenarioKeys, applyPlumbingScenarioToZone } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
)

const input = {
  plumbingWaterPointsCount: 0,
  plumbingSewerPointsCount: 0,
  plumbingWaterPipeLength: 0,
  plumbingSewerPipeLength: 0,
  plumbingCollectorsCount: 0,
  plumbingToiletsCount: 1,
  plumbingSinksCount: 1,
  plumbingBathtubsCount: 0,
  plumbingShowersCount: 1,
  plumbingMixersCount: 0,
  plumbingInstallationsCount: 0,
  plumbingDrainsCount: 0,
  plumbingWasherConnectionsCount: 0,
  plumbingDishwasherConnectionsCount: 0,
  plumbingWaterHeatersCount: 0,
  plumbingTowelWarmersCount: 0,
  plumbingWarmFloorArea: 0,
}

test('тип прибора выбирает правильную работу, а неизвестный не подменяется акриловой ванной', () => {
  const pending = resolvePlumbingScenarioPlan(
    {
      state: 'bathroom-from-scratch',
      toiletKind: 'unknown',
      bathKind: 'unknown',
      showerKind: 'unknown',
      sinkKind: 'unknown',
    },
    input,
  )
  assert.equal(pending.issues.length, 3)
  assert.equal(pending.keys.includes('finish-shower-tray'), false)
  const selected = {
    state: 'bathroom-from-scratch',
    toiletKind: 'floor',
    bathKind: 'acrylic',
    showerKind: 'cabin',
    sinkKind: 'wall',
  }
  const keys = resolveMeasuredPlumbingScenarioKeys(selected, input)
  assert.ok(keys.includes('finish-toilet-floor'))
  assert.ok(keys.includes('finish-shower-cabin'))
  assert.ok(keys.includes('finish-sink-wall'))
  assert.equal(keys.includes('finish-toilet-soft'), false)
  assert.equal(keys.includes('finish-shower-tray'), false)
})

test('кухня, канализация и водоснабжение объединяются в одном проходе без дублей', () => {
  const zone = { ...input, id: 'kitchen', name: 'Кухня', zoneType: 'kitchen',
    plumbingWaterPointsCount: 2, plumbingSewerPointsCount: 1,
    plumbingWaterPipeLength: 8, plumbingSewerPipeLength: 5,
  }
  const application = { state: 'kitchen', states: ['kitchen', 'drainage-only', 'water-supply-only'],
    toiletKind: 'unknown', bathKind: 'unknown', showerKind: 'unknown', sinkKind: 'unknown' }
  const plan = resolvePlumbingScenarioPlan(application, zone)
  assert.deepEqual(plan.issues, [])
  assert.equal(plan.keys.length, new Set(plan.keys).size)
  const result = applyPlumbingScenarioToZone([], zone, application)
  assert.equal(result.lines.length, new Set(result.lines.map((line) => line.priceKey)).size)
  const repeated = applyPlumbingScenarioToZone(result.lines, zone, application)
  assert.equal(repeated.lines.length, result.lines.length)
  assert.ok(repeated.enabledPriceKeys.includes('drainage-layout'))
  assert.ok(repeated.enabledPriceKeys.includes('water-layout'))
})

test('кухня и дополнительные приборы не считают кухонную мойку дважды', () => {
  const app = { state: 'kitchen', states: ['kitchen', 'fixtures-only'],
    toiletKind: 'unknown', bathKind: 'unknown', showerKind: 'unknown', sinkKind: 'unknown' }
  const plan = resolvePlumbingScenarioPlan(app, { ...input, plumbingSinksCount: 1,
    plumbingToiletsCount: 0, plumbingShowersCount: 0 })
  assert.deepEqual(plan.issues, [])
  assert.ok(plan.keys.includes('finish-kitchen-sink'))
  assert.equal(plan.keys.includes('finish-sink-ordinary'), false)
  assert.equal(plan.keys.includes('finish-sink-mixer'), false)
})
