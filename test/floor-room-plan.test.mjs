import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import { build } from 'esbuild'

const bundle = await build({
  entryPoints: ['src/entities/estimate/model/floors/apply-floor-preset.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
})
const { resolveFloorRoomPlan } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
)

test('маршрут пола использует раздельные объёмы для демонтажа, стяжки и гидроизоляции', () => {
  const plan = resolveFloorRoomPlan(
    {
      presetId: 'room-plan',
      oldCovering: 'tile',
      leveling: 'wet-up-to-50',
      waterproofing: 'acrylic-2',
    },
    {
      demolitionArea: 8,
      totalFloorArea: 12,
      screedArea: 10,
      wetZonesArea: 3,
      avgDeltaMm: 0,
    },
  )
  assert.deepEqual(plan.issues, [])
  assert.equal(plan.works.find((work) => work.key === 'demolition-floor-tile').quantity, 8)
  assert.equal(plan.works.find((work) => work.key === 'wet-screed-up-to-50').quantity, 10)
  assert.equal(plan.works.find((work) => work.key === 'waterproofing-acrylic-2').quantity, 3)
})

test('маршрут не включает работу без нужного замера', () => {
  const plan = resolveFloorRoomPlan(
    {
      presetId: 'room-plan',
      oldCovering: 'none',
      leveling: 'self-leveling',
      waterproofing: 'acrylic-2',
    },
    {
      demolitionArea: 0,
      totalFloorArea: 0,
      screedArea: 0,
      wetZonesArea: 0,
      avgDeltaMm: 0,
    },
  )
  assert.equal(plan.works.length, 0)
  assert.deepEqual(plan.issues, ['Укажите площадь пола или выравнивания.'])
})

test('шлифование наливного пола зависит от осмотра, обеспыливание и грунт остаются в обоих вариантах', () => {
  const input = { demolitionArea: 0, totalFloorArea: 12, screedArea: 0, wetZonesArea: 0, avgDeltaMm: 0 }
  const common = { presetId: 'room-plan', oldCovering: 'none', leveling: 'self-leveling', waterproofing: 'none' }
  const pending = resolveFloorRoomPlan({ ...common, selfLevelingBase: 'inspect' }, input)
  assert.match(pending.issues[0], /Осмотрите бетонное основание/)
  assert.equal(pending.works.length, 0)
  const other = resolveFloorRoomPlan({ ...common, selfLevelingBase: 'other' }, input)
  assert.match(other.issues[0], /прочного бетонного основания/)
  assert.equal(other.works.length, 0)
  const ready = resolveFloorRoomPlan({ ...common, selfLevelingBase: 'ready' }, input)
  const grind = resolveFloorRoomPlan({ ...common, selfLevelingBase: 'grind' }, input)
  assert.deepEqual(ready.works.map((work) => work.key), [
    'self-leveling-dust-removal', 'self-leveling-primer', 'self-leveling-device',
  ])
  assert.deepEqual(grind.works.map((work) => work.key), [
    'self-leveling-grind', 'self-leveling-dust-removal', 'self-leveling-primer', 'self-leveling-device',
  ])
  assert.equal(grind.works[0].quantity, 12)
})

test('стяжка на плёнке заменяет грунт укладкой плёнки; неизвестная и плавающая схемы требуют уточнения', () => {
  const input = { demolitionArea: 0, totalFloorArea: 14, screedArea: 12, wetZonesArea: 0, avgDeltaMm: 0 }
  const common = { presetId: 'room-plan', oldCovering: 'none', leveling: 'wet-up-to-50', waterproofing: 'none' }
  const bonded = resolveFloorRoomPlan({ ...common, screedBase: 'bonded' }, input)
  const film = resolveFloorRoomPlan({ ...common, screedBase: 'film' }, input)
  assert.ok(bonded.works.some((work) => work.key === 'wet-primer'))
  assert.ok(!bonded.works.some((work) => work.key === 'wet-pe-film'))
  assert.ok(film.works.some((work) => work.key === 'wet-pe-film' && work.quantity === 12))
  assert.ok(!film.works.some((work) => work.key === 'wet-primer'))
  assert.match(resolveFloorRoomPlan({ ...common, screedBase: 'inspect' }, input).issues[0], /конструкцию стяжки/)
  assert.match(resolveFloorRoomPlan({ ...common, screedBase: 'floating' }, input).issues[0], /плавающей стяжки/)
})
