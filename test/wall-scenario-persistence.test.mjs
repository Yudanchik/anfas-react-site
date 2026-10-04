import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import { build } from 'esbuild'

const bundle = await build({
  entryPoints: ['src/features/estimate-calculator/model/estimate-calculator-persistence.ts'],
  bundle: true, platform: 'node', format: 'esm', write: false,
})
const { parseEstimateCalculatorSnapshot, serializeEstimateZone, serializeEstimateLine,
  restoreWallEstimateState, restoreWallScenarioDraft } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
)

test('отметка сценария помещения сохраняется и восстанавливается вместе со сметой', () => {
  const record = { application: { state: 'from-scratch', finishTarget: 'none',
    demolitionBeforeWork: true, demolitionCovering: 'paint' }, measureSignature: '25|0|0|0|0|0' }
  const raw = { version: 2, activeTab: 'walls',
    zones: [{ id: 'zone-1', name: 'Кухня', wallArea: 25, wallScenario: record }],
    floors: { input: {}, lines: [] }, walls: { input: {}, lines: [] } }
  const restored = parseEstimateCalculatorSnapshot(raw)
  assert.ok(restored)
  assert.deepEqual(restored.zones[0].wallScenario?.application.state, 'from-scratch')
  assert.equal(restored.zones[0].wallScenario?.application.demolitionBeforeWork, true)
  assert.equal(serializeEstimateZone(restored.zones[0]).wallScenario?.measureSignature, record.measureSignature)
})

test('новые ответы, история добавления и принадлежность строки сценарию переживают сохранение', () => {
  const application = { state: 'from-scratch', finishTarget: 'paint', substrate: 'dense',
    baseCondition: 'sound', leveling: 'full', moisture: 'normal', quality: 'q3', reinforce: false }
  const line = { id: 'walls:zone-999', priceKey: 'paint-2', sectionId: 'walls', kind: 'paint',
    title: 'Покраска стен валиком, 2 слоя', unit: 'м²', unitPrice: 480, quantity: 20,
    coefficient: 1, enabled: true, source: 'pdf', zoneId: 'zone-1', zoneName: 'Кухня', scenarioManaged: true }
  const raw = { version: 2, activeTab: 'walls',
    zones: [{ id: 'zone-1', name: 'Кухня', wallArea: 20,
      wallScenario: { application, applications: [application], measureSignature: '20|0|0|0|0|0' } }],
    floors: { input: {}, lines: [] }, walls: { input: {}, lines: [serializeEstimateLine(line)] },
    wallScenarios: { ...application, demolitionCovering: 'wallpaper', wallpaperType: 'flizelin',
      paintLayers: 'paint-2', slopesWork: 'none' } }
  const restored = parseEstimateCalculatorSnapshot(raw)
  assert.equal(restored?.zones[0].wallScenario?.applications?.[0].substrate, 'dense')
  assert.equal(restoreWallScenarioDraft(restored).quality, 'q3')
  assert.equal(restoreWallEstimateState(restored).lines.find((item) => item.id === line.id)?.scenarioManaged, true)
})
