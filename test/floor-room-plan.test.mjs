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
  assert.equal(plan.issues.length, 2)
})
