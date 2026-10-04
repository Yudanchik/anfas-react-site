import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import { build } from 'esbuild'

const bundle = await build({
  entryPoints: ['src/entities/estimate/model/electrics/apply-electric-scenario.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
})
const { resolveElectricScenarioPlan, resolveElectricScenarioKeys } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
)

test('ответы о стене и маршруте выбирают одну технологию без бетонных работ в ГКЛ', () => {
  const base = { state: 'room-rewire' }
  const brick = resolveElectricScenarioPlan({ ...base, wallMaterial: 'brick', cableRoute: 'chase' })
  assert.deepEqual(brick.issues, [])
  assert.ok(brick.keys.includes('chase-brick-to-35'))
  assert.ok(brick.keys.includes('hole-podrozetnik-brick'))
  assert.equal(brick.keys.includes('chase-concrete-to-35'), false)
  const drywall = resolveElectricScenarioPlan({
    ...base,
    wallMaterial: 'drywall',
    cableRoute: 'open',
  })
  assert.deepEqual(drywall.issues, [])
  assert.ok(drywall.keys.includes('hole-podrozetnik-gkl'))
  assert.ok(drywall.keys.includes('cable-open-1-5-2-5'))
  assert.equal(
    drywall.keys.some((key) => key.startsWith('chase-')),
    false,
  )
  const ready = resolveElectricScenarioPlan({
    ...base,
    wallMaterial: 'ready',
    cableRoute: 'existing',
  })
  assert.equal(
    ready.keys.some(
      (key) => key.startsWith('hole-') || key.startsWith('chase-') || key.startsWith('cable-'),
    ),
    false,
  )
})

test('неизвестный маршрут требует ответа; старые сценарии сохраняют прежние ключи', () => {
  const pending = resolveElectricScenarioPlan({
    state: 'kitchen',
    wallMaterial: 'unknown',
    cableRoute: 'unknown',
  })
  assert.ok(pending.issues.length >= 2)
  assert.equal(
    pending.keys.some((key) => key.startsWith('chase-')),
    false,
  )
  assert.ok(resolveElectricScenarioKeys({ state: 'kitchen' }).includes('chase-concrete-to-35'))
})

test('несколько электрических маршрутов дают объединение работ без повторов', () => {
  const plan = resolveElectricScenarioPlan({
    state: 'kitchen', states: ['kitchen', 'lighting-only', 'outlets-switches'],
    wallMaterial: 'brick', cableRoute: 'mixed', demolitionBeforeWork: true,
  })
  assert.deepEqual(plan.issues, [])
  assert.equal(plan.keys.length, new Set(plan.keys).size)
  assert.ok(plan.keys.includes('finish-spot'))
  assert.ok(plan.keys.includes('finish-outlet-switch'))
  assert.ok(plan.keys.includes('demolition-outlets'))
})
