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
const { resolvePlumbingScenarioPlan, resolveMeasuredPlumbingScenarioKeys } = await import(
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
