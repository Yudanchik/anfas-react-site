import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import { build } from 'esbuild'

const bundle = await build({
  entryPoints: ['src/entities/estimate/model/tile/apply-tile-scenario.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
})
const { resolveTileScenarioKeys, tilePreparationIssue, applyTileScenarioToZone } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
)

test('подготовка под плитку определяется ответом, включая отдельные маршруты пола и фартука', () => {
  for (const state of ['bathroom-from-scratch', 'floor-only', 'kitchen-backsplash']) {
    const common = { state, grout: 'cement' }
    const prepare = resolveTileScenarioKeys({ ...common, preparation: 'prepare' })
    const ready = resolveTileScenarioKeys({ ...common, preparation: 'ready' })
    assert.deepEqual(prepare.slice(0, 2), ['prep-dust', 'prep-primer'])
    assert.ok(!ready.includes('prep-dust'))
    assert.ok(!ready.includes('prep-primer'))
    assert.match(tilePreparationIssue({ ...common, preparation: 'inspect' }), /Уточните основание/)
  }
  assert.equal(tilePreparationIssue({ state: 'demolition-only', preparation: 'inspect' }), null)
})

test('повторное применение готового основания выключает подготовку только в этой зоне', () => {
  const zone = { id: 'bathroom', name: 'Санузел', tileFloorArea: 5, tileWallArea: 12,
    tileBacksplashArea: 0, tileCuttingLength: 0, tileCornerLength: 0, tileHolesCount: 0, tileRepairCount: 0 }
  const first = applyTileScenarioToZone([], zone, {
    state: 'bathroom-from-scratch', grout: 'cement', preparation: 'prepare',
  })
  const second = applyTileScenarioToZone(first.lines, zone, {
    state: 'bathroom-from-scratch', grout: 'cement', preparation: 'ready',
  })
  assert.equal(second.lines.find((line) => line.priceKey === 'prep-dust')?.enabled, false)
  assert.equal(second.lines.find((line) => line.priceKey === 'prep-primer')?.enabled, false)
})
