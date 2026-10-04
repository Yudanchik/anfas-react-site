import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import { build } from 'esbuild'

const bundle = await build({
  entryPoints: ['src/entities/estimate/model/ceilings/apply-ceiling-scenario.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
})
const { resolveCeilingScenarioPlan } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
)

test('после демонтажа не считаем его второй раз; стеклохолст только по ответу', () => {
  const base = {
    state: 'after-demolition',
    finishTarget: 'paint',
    substrate: 'mineral',
    quality: 'q3',
    reinforce: false,
  }
  const normal = resolveCeilingScenarioPlan(base)
  assert.deepEqual(normal.issues, [])
  assert.equal(
    normal.keys.some((key) => key.startsWith('demolition-')),
    false,
  )
  assert.equal(normal.keys.includes('reinforce-glassfiber-ceiling'), false)
  const withReinforcement = resolveCeilingScenarioPlan({ ...base, reinforce: true })
  assert.ok(withReinforcement.keys.includes('reinforce-glassfiber-ceiling'))
  const demolition = resolveCeilingScenarioPlan({
    ...base,
    state: 'from-scratch',
    demolitionBeforeWork: true,
    demolitionCovering: 'paint',
  })
  assert.equal(demolition.keys[0], 'demolition-paint')
})

test('Q2/Q4 меняют подготовку; ГКЛ получает отдельный маршрут без штукатурки', () => {
  const base = { state: 'from-scratch', finishTarget: 'none', substrate: 'mineral' }
  const q2 = resolveCeilingScenarioPlan({ ...base, quality: 'q2' })
  const q4 = resolveCeilingScenarioPlan({ ...base, quality: 'q4' })
  assert.ok(q2.keys.includes('putty-ceiling-1'))
  assert.ok(q4.keys.includes('putty-finish-ceiling-2'))
  const drywall = resolveCeilingScenarioPlan({ ...base, substrate: 'drywall', quality: 'q3' })
  assert.deepEqual(drywall.issues, [])
  assert.ok(drywall.keys.includes('gkl-ceiling-joint-tape'))
  assert.equal(drywall.keys.includes('plaster-ceiling-main'), false)
  const existingPlaster = resolveCeilingScenarioPlan({
    ...base,
    substrate: 'plastered',
    quality: 'q3',
  })
  assert.equal(existingPlaster.keys.includes('plaster-ceiling-main'), false)
  assert.ok(existingPlaster.keys.includes('putty-ceiling-2'))
})
