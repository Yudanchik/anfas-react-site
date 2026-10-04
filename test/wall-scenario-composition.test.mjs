import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import { build } from 'esbuild'

const bundle = await build({
  entryPoints: ['src/entities/estimate/model/walls/apply-wall-scenario.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
})
const { resolveWallScenarioKeys, resolveWallScenarioPlan, applyWallScenarioToZone, wallScenarioForZone } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
)

test('демонтаж и полный цикл собираются за один проход в правильном порядке', () => {
  const keys = resolveWallScenarioKeys({
    state: 'from-scratch',
    demolitionBeforeWork: true,
    demolitionCovering: 'paint',
    finishTarget: 'wallpaper',
    wallpaperType: 'flizelin',
  })
  assert.deepEqual(keys.slice(0, 3), [
    'demolition-paint', 'prep-dust-removal', 'primer-deep-penetration',
  ])
  assert.ok(keys.includes('plaster-gypsum-main'))
  assert.ok(keys.includes('wallpaper-flizelin'))
  assert.equal(keys.filter((key) => key === 'demolition-paint').length, 1)
})

test('один сценарий создаёт отдельные строки для двух помещений', () => {
  const makeZone = (id, name, wallArea) => ({ id, name, wallArea, demolitionWallArea: 0,
    plasterArea: 0, puttyArea: 0, finishArea: 0, slopesLength: 0, cornersLength: 0 })
  const firstZone = makeZone('zone-1', 'Кухня', 28)
  const secondZone = makeZone('zone-2', 'Коридор', 12)
  const application = { state: 'from-scratch', finishTarget: 'none' }
  const first = applyWallScenarioToZone([], firstZone, application).lines
  const both = applyWallScenarioToZone(first, secondZone, application).lines
  assert.equal(both.filter((line) => line.zoneId === firstZone.id && line.enabled).length, 5)
  assert.equal(both.filter((line) => line.zoneId === secondZone.id && line.enabled).length, 5)
  assert.equal(both.find((line) => line.zoneId === secondZone.id && line.priceKey === 'primer-deep-penetration').quantity, 12)
  assert.equal(both.find((line) => line.zoneId === firstZone.id && line.priceKey === 'primer-deep-penetration').quantity, 28)
})

test('общий сценарий не требует откосов там, где их нет', () => {
  const room = { id: 'zone-1', name: 'Комната', wallArea: 28, demolitionWallArea: 0,
    plasterArea: 0, puttyArea: 0, finishArea: 0, slopesLength: 3.8, cornersLength: 0 }
  const corridor = { ...room, id: 'zone-2', name: 'Коридор', wallArea: 12, slopesLength: 0 }
  const selected = { state: 'from-scratch', finishTarget: 'none', slopesWork: 'putty-paint' }
  const roomScenario = wallScenarioForZone(selected, room)
  const corridorScenario = wallScenarioForZone(selected, corridor)
  assert.equal(roomScenario.slopesWork, 'putty-paint')
  assert.equal(corridorScenario.slopesWork, 'none')
  const first = applyWallScenarioToZone([], room, roomScenario).lines
  const both = applyWallScenarioToZone(first, corridor, corridorScenario).lines
  const slopeKeys = new Set(['putty-slopes-2', 'putty-sanding-slopes', 'paint-slopes-roller-2'])
  assert.equal(both.filter((line) => line.zoneId === room.id && slopeKeys.has(line.priceKey) && line.enabled).length, 3)
  assert.equal(both.filter((line) => line.zoneId === corridor.id && slopeKeys.has(line.priceKey) && line.enabled).length, 0)
  assert.equal(both.filter((line) => line.zoneId === corridor.id && line.enabled).length, 5)
})

test('прежний сценарий с нуля без снятия покрытия сохраняет состав', () => {
  const keys = resolveWallScenarioKeys({ state: 'from-scratch', finishTarget: 'none' })
  assert.equal(keys[0], 'primer-deep-penetration')
  assert.equal(keys.some((key) => key.startsWith('demolition-')), false)
})

test('уже выполненный демонтаж и режим только демонтажа не смешиваются', () => {
  const after = resolveWallScenarioKeys({ state: 'after-demolition', finishTarget: 'none' })
  const only = resolveWallScenarioKeys({
    state: 'demolition-only',
    finishTarget: 'none',
    demolitionCovering: 'wall-tile',
  })
  assert.equal(after[0], 'prep-dust-removal')
  assert.equal(after.some((key) => key.startsWith('demolition-')), false)
  assert.deepEqual(only, ['demolition-wall-tile'])
})

test('вопросы о состоянии основания меняют черновой набор работ', () => {
  const normal = resolveWallScenarioKeys({ state: 'from-scratch', finishTarget: 'paint',
    substrate: 'absorbent', baseCondition: 'sound', leveling: 'full', moisture: 'normal', quality: 'q3' })
  assert.ok(normal.includes('plaster-gypsum-main'))
  assert.ok(normal.includes('putty-finish-1'))
  assert.ok(normal.includes('primer-one-layer'))
  assert.equal(normal.includes('reinforce-glassfiber'), false)
  const wet = resolveWallScenarioKeys({ state: 'from-scratch', finishTarget: 'none',
    substrate: 'dense', baseCondition: 'sound', leveling: 'full', moisture: 'wet', quality: 'q2' })
  assert.ok(wet.includes('plaster-cement-main'))
  assert.equal(wet.includes('plaster-gypsum-main'), false)
  assert.equal(wet.some((key) => key.startsWith('putty-')), false)
})

test('замена сценария убирает его прежние строки, сохраняет ручные работы и другую комнату', () => {
  const zone = { id: 'zone-a', name: 'Комната', wallArea: 20, demolitionWallArea: 0,
    plasterArea: 0, puttyArea: 0, finishArea: 0, slopesLength: 0, cornersLength: 0 }
  const other = { ...zone, id: 'zone-b', name: 'Коридор' }
  const old = { state: 'from-scratch', finishTarget: 'wallpaper' }
  const first = applyWallScenarioToZone([], zone, old).lines
  const second = applyWallScenarioToZone(first, other, old).lines
  const manuallyAdded = { ...first[0], id: 'walls:zone-99999', priceKey: 'custom-work',
    source: 'manual', title: 'Ручная работа', scenarioManaged: undefined }
  const manuallyPriced = { ...first[0], id: 'walls:zone-99998', priceKey: 'paint-2',
    scenarioManaged: undefined, title: 'Работа из прайса' }
  const withOld = { ...zone, wallScenario: { application: old, measureSignature: '20|0|0|0|0|0' } }
  const next = { state: 'finish-only', finishTarget: 'paint' }
  const replaced = applyWallScenarioToZone([...second, manuallyAdded, manuallyPriced], withOld, next, 'replace').lines
  assert.equal(replaced.some((line) => line.zoneId === zone.id && line.scenarioManaged && line.priceKey === 'wallpaper-flizelin'), false)
  assert.equal(replaced.some((line) => line.zoneId === zone.id && line.scenarioManaged && line.priceKey === 'paint-2'), true)
  assert.equal(replaced.some((line) => line.id === manuallyAdded.id), true)
  assert.equal(replaced.some((line) => line.id === manuallyPriced.id && line.enabled), true)
  assert.equal(replaced.filter((line) => line.zoneId === other.id).length,
    second.filter((line) => line.zoneId === other.id).length)
})

test('повторное добавление того же сценария не дублирует управляемые строки', () => {
  const zone = { id: 'zone-repeat', name: 'Комната', wallArea: 20, demolitionWallArea: 0,
    plasterArea: 0, puttyArea: 0, finishArea: 0, slopesLength: 0, cornersLength: 0 }
  const application = { state: 'from-scratch', finishTarget: 'none' }
  const first = applyWallScenarioToZone([], zone, application).lines
  const repeated = applyWallScenarioToZone(first, zone, application, 'add').lines
  assert.equal(repeated.length, first.length)
})

test('неподтверждённые ответы сохраняют частичный предпросмотр и объясняют, что проверить', () => {
  const base = { state: 'from-scratch', finishTarget: 'paint', substrate: 'dense',
    leveling: 'full', moisture: 'normal', quality: 'q3' }
  for (const application of [
    { ...base, substrate: 'unknown', baseCondition: 'unknown' },
    { ...base, baseCondition: 'loose' },
    { ...base, baseCondition: 'sound', moisture: 'wet' },
    { ...base, baseCondition: 'sound', quality: 'q2' },
  ]) {
    const plan = resolveWallScenarioPlan(application)
    assert.ok(plan.keys.length > 0)
    assert.ok(plan.issues.length > 0)
  }
  const wet = resolveWallScenarioPlan({ ...base, baseCondition: 'sound', moisture: 'wet' })
  assert.ok(wet.keys.includes('plaster-cement-main'))
  assert.equal(wet.keys.some((key) => key.startsWith('paint-')), false)
  const drywall = resolveWallScenarioPlan({ ...base, substrate: 'drywall', baseCondition: 'sound' })
  assert.equal(drywall.keys.some((key) => key.startsWith('plaster-')), false)
  assert.ok(drywall.keys.includes('gkl-joint-tape'))
  assert.equal(drywall.issues.length, 0)
})

test('все стартовые маршруты дают осмысленный предпросмотр, а тип отделки меняет финиш', () => {
  for (const state of ['from-scratch', 'after-demolition', 'prefinish', 'demolition-only', 'local-leveling', 'finish-only']) {
    const plan = resolveWallScenarioPlan({ state, finishTarget: state === 'demolition-only' || state === 'local-leveling'
      ? 'none' : 'wallpaper', substrate: state === 'prefinish' || state === 'finish-only' ? 'plastered' : 'absorbent',
    baseCondition: 'sound', leveling: 'full', moisture: 'normal', quality: 'q3' })
    assert.ok(plan.keys.length > 0, state)
    assert.deepEqual(plan.issues, [], state)
  }
  const base = { state: 'from-scratch', substrate: 'absorbent', baseCondition: 'sound',
    leveling: 'full', moisture: 'normal', quality: 'q3' }
  const wallpaper = resolveWallScenarioKeys({ ...base, finishTarget: 'wallpaper', wallpaperType: 'photo' })
  const paint = resolveWallScenarioKeys({ ...base, finishTarget: 'paint', paintLayers: 'paint-3' })
  assert.ok(wallpaper.includes('wallpaper-photo'))
  assert.ok(paint.includes('paint-3'))
  assert.equal(paint.includes('wallpaper-photo'), false)
})

test('любой выбор основания и состояния оставляет видимый список или конкретный вопрос к технологии', () => {
  for (const state of ['from-scratch', 'after-demolition', 'prefinish', 'demolition-only', 'local-leveling', 'finish-only']) {
    for (const substrate of ['unknown', 'absorbent', 'dense', 'plastered', 'drywall']) {
      for (const baseCondition of ['unknown', 'sound', 'loose']) {
        for (const moisture of ['normal', 'wet']) {
          const plan = resolveWallScenarioPlan({ state, finishTarget: 'none', substrate,
            baseCondition, moisture, leveling: 'full', quality: 'q3' })
          assert.ok(plan.keys.length > 0 || plan.issues.length > 0,
            `${state}/${substrate}/${baseCondition}/${moisture}`)
        }
      }
    }
  }
})

test('скрытый старый ответ про стеклохолст не добавляет лишнюю шпаклёвку без окраски', () => {
  const base = { state: 'from-scratch', finishTarget: 'none', substrate: 'absorbent',
    baseCondition: 'sound', moisture: 'normal', leveling: 'full', quality: 'q2' }
  assert.deepEqual(resolveWallScenarioKeys({ ...base, reinforce: true }), resolveWallScenarioKeys(base))
})

test('замена старого сценария без признака происхождения сохраняет дополнительную строку прайса', () => {
  const zone = { id: 'zone-legacy', name: 'Комната', wallArea: 20, demolitionWallArea: 0,
    plasterArea: 0, puttyArea: 0, finishArea: 0, slopesLength: 0, cornersLength: 0 }
  const old = { state: 'from-scratch', finishTarget: 'none' }
  const legacy = applyWallScenarioToZone([], zone, old).lines.map((line) => ({ ...line, scenarioManaged: undefined }))
  const extra = { ...legacy[0], id: 'walls:zone-99997', quantity: 2, comment: 'Добавлено вручную' }
  const withOld = { ...zone, wallScenario: { application: old, measureSignature: '20|0|0|0|0|0' } }
  const result = applyWallScenarioToZone([...legacy, extra], withOld,
    { state: 'finish-only', finishTarget: 'paint' }, 'replace').lines
  assert.equal(result.filter((line) => line.zoneId === zone.id && line.scenarioManaged).length, 1)
  assert.equal(result.some((line) => line.id === extra.id && line.enabled), true)
})


test('грунтование стен учитывает этапы, не назначая промежуточный проход всем слоям шпаклёвки', () => {
  const full = resolveWallScenarioPlan({
    state: 'from-scratch', finishTarget: 'paint', substrate: 'absorbent',
    baseCondition: 'sound', leveling: 'full', moisture: 'normal', quality: 'q3',
  }).keys
  assert.ok(full.indexOf('primer-gypsum-plaster') < full.indexOf('plaster-gypsum-main'))
  assert.ok(full.indexOf('plaster-gypsum-main') < full.indexOf('primer-before-putty'))
  assert.ok(full.indexOf('primer-before-putty') < full.indexOf('putty-base-2'))
  assert.ok(full.indexOf('putty-sanding') < full.indexOf('primer-one-layer'))
  assert.ok(full.indexOf('primer-one-layer') < full.indexOf('paint-2'))
  assert.equal(full.filter((key) => key === 'primer-before-putty').length, 1)

  const ready = resolveWallScenarioPlan({
    state: 'prefinish', finishTarget: 'paint', substrate: 'plastered',
    baseCondition: 'sound', leveling: 'none', moisture: 'normal', quality: 'q3',
  }).keys
  assert.ok(ready.includes('primer-deep-penetration'))
  assert.equal(ready.includes('primer-before-putty'), false)
  assert.ok(ready.includes('primer-one-layer'))
})


test('после штукатурки грунт под шпаклёвку берёт площадь шпаклёвки, а грунт под штукатурку — площадь штукатурки', () => {
  const zone = { id: 'primer-zone', name: 'Комната', wallArea: 24,
    demolitionWallArea: 0, plasterArea: 22, puttyArea: 19, finishArea: 19,
    slopesLength: 0, cornersLength: 0 }
  const application = { state: 'from-scratch', finishTarget: 'paint',
    substrate: 'absorbent', baseCondition: 'sound', leveling: 'full',
    moisture: 'normal', quality: 'q3' }
  const lines = applyWallScenarioToZone([], zone, application).lines
  assert.equal(lines.find((line) => line.priceKey === 'primer-gypsum-plaster')?.quantity, 22)
  assert.equal(lines.find((line) => line.priceKey === 'primer-before-putty')?.quantity, 19)
  assert.equal(lines.find((line) => line.priceKey === 'primer-one-layer')?.quantity, 19)
})


test('межслойный грунт добавляется только по ответу и берёт площадь шпаклёвки', () => {
  const base = { state: 'from-scratch', finishTarget: 'paint', substrate: 'absorbent',
    baseCondition: 'sound', leveling: 'full', moisture: 'normal', quality: 'q3' }
  const normal = resolveWallScenarioPlan(base).keys
  assert.equal(normal.includes('primer-between-putty-layers'), false)
  const selected = resolveWallScenarioPlan({ ...base, primerBetweenPuttyLayers: true }).keys
  assert.ok(selected.indexOf('putty-base-2') < selected.indexOf('primer-between-putty-layers'))
  assert.ok(selected.indexOf('primer-between-putty-layers') < selected.indexOf('putty-finish-1'))
  const zone = { id: 'intercoat-zone', name: 'Комната', wallArea: 24, demolitionWallArea: 0,
    plasterArea: 22, puttyArea: 19, finishArea: 19, slopesLength: 0, cornersLength: 0 }
  const lines = applyWallScenarioToZone([], zone, { ...base, primerBetweenPuttyLayers: true }).lines
  assert.equal(lines.find((line) => line.priceKey === 'primer-between-putty-layers')?.quantity, 19)
  const q2 = resolveWallScenarioPlan({ ...base, quality: 'q2', finishTarget: 'none',
    primerBetweenPuttyLayers: true }).keys
  assert.equal(q2.includes('primer-between-putty-layers'), false)
})
