import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import { build } from 'esbuild'

const bundle = await build({
  entryPoints: ['src/entities/estimate/model/walls/wall-scenario-progress.ts'],
  bundle: true, platform: 'node', format: 'esm', write: false,
})
const { getWallScenarioProgress, wallScenarioMeasureSignature } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
)

test('отметка сценария меняется после нового замера и исчезновения строк', () => {
  const zone = { id: 'zone-1', wallArea: 25, demolitionWallArea: 0,
    plasterArea: 0, puttyArea: 0, finishArea: 0, slopesLength: 0 }
  assert.equal(getWallScenarioProgress(zone, []), 'pending')
  assert.equal(getWallScenarioProgress(zone, [{ zoneId: zone.id, enabled: true }]), 'unknown')
  const application = { state: 'from-scratch', finishTarget: 'none' }
  const applied = { ...zone, wallScenario: { application, measureSignature: wallScenarioMeasureSignature(zone) } }
  const lines = [{ zoneId: zone.id, priceKey: 'primer-deep-penetration', enabled: true }]
  assert.equal(getWallScenarioProgress(applied, lines), 'applied')
  assert.equal(getWallScenarioProgress({ ...applied, wallArea: 30 }, lines), 'review')
  assert.equal(getWallScenarioProgress(applied, []), 'review')
})
