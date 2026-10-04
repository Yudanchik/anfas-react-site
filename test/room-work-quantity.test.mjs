import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import { build } from 'esbuild'

async function load(path) {
  const result = await build({
    entryPoints: [path],
    bundle: true,
    platform: 'node',
    format: 'esm',
    write: false,
  })
  return import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
  )
}
const { createEstimateZone } = await load('src/entities/estimate/model/shared/estimate-zone.ts')
const { suggestRoomWorkQuantity, buildRoomWorkFillPlan, applyRoomWorkFill } = await load(
  'src/features/estimate-calculator/model/room-work-quantity.ts',
)
const { parseEstimateCalculatorSnapshot, serializeEstimateZone } = await load(
  'src/features/estimate-calculator/model/estimate-calculator-persistence.ts',
)
const zone = createEstimateZone({
  name: 'Кухня',
  fields: { electricCableLength: 100, wallArea: 50, floorArea: 20, ceilingArea: 20 },
})
const cable = {
  id: 'electrics:cable-open-4-6',
  priceKey: 'cable-open-4-6',
  sectionId: 'electrics',
  kind: 'cable',
  title: 'Кабель 4–6',
  unit: 'м. пог.',
  unitPrice: 555,
  quantity: 0,
  coefficient: 1.2,
  enabled: true,
  source: 'pdf',
  comment: 'Сохранить',
}

test('другая позиция кабеля получает общий метраж без повторного ввода', () => {
  assert.equal(
    suggestRoomWorkQuantity('electrics', zone, { id: 'cable-open-4-6', unit: 'м. пог.' }).quantity,
    100,
  )
  assert.equal(
    suggestRoomWorkQuantity('electrics', zone, { id: 'cable-chase-10', unit: 'м. пог.' }).quantity,
    100,
  )
})

test('раздельные метры работают для разных сечений; неизвестный маршрут не получает общий метраж', () => {
  const split = { ...zone, electricCableOpenLength: 80, electricCableChaseLength: 20 }
  assert.equal(
    suggestRoomWorkQuantity('electrics', split, { id: 'cable-open-16', unit: 'м. пог.' }).quantity,
    80,
  )
  assert.equal(
    suggestRoomWorkQuantity('electrics', split, { id: 'cable-chase-4-6', unit: 'м. пог.' })
      .quantity,
    20,
  )
  assert.equal(
    suggestRoomWorkQuantity('electrics', split, { id: 'cable-utp', unit: 'м. пог.' }).quantity,
    0,
  )
})

test('общая выбранная строка становится строкой помещения, сохраняя цену, коэффициент и комментарий', () => {
  const other = { ...cable, id: 'electrics:zone-222', zoneId: 'other', quantity: 15 }
  const manual = { ...cable, id: 'manual', source: 'manual', quantity: 3 }
  const plan = buildRoomWorkFillPlan(
    'electrics',
    zone,
    [cable, other, manual],
    new Set([cable.id, other.id, manual.id]),
  )
  assert.deepEqual(plan.changes, [{ id: cable.id, quantity: 100 }])
  const result = applyRoomWorkFill([cable, other, manual], zone, plan.changes)
  assert.equal(result.find((line) => line.id === cable.id).enabled, false)
  const added = result.find((line) => line.zoneId === zone.id)
  assert.equal(added.quantity, 100)
  assert.equal(added.unitPrice, 555)
  assert.equal(added.coefficient, 1.2)
  assert.equal(added.comment, 'Сохранить')
  assert.equal(added.zoneName, 'Кухня')
  assert.match(added.id, /:zone-\d+$/)
  assert.deepEqual(
    result.find((line) => line.id === other.id),
    other,
  )
  assert.deepEqual(
    result.find((line) => line.id === manual.id),
    manual,
  )
  assert.deepEqual(applyRoomWorkFill(result, zone, plan.changes), result)
})

test('подстановка в другом помещении не изменяет ранее заполненное', () => {
  const first = applyRoomWorkFill([cable], zone, [{ id: cable.id, quantity: 100 }])
  const secondZone = createEstimateZone({ name: 'Коридор', fields: { electricCableLength: 10 } })
  const selected = first.map((line) => (line.id === cable.id ? { ...line, enabled: true } : line))
  const second = applyRoomWorkFill(selected, secondZone, [{ id: cable.id, quantity: 10 }])
  assert.equal(second.find((line) => line.zoneId === zone.id).quantity, 100)
  assert.equal(second.find((line) => line.zoneId === secondZone.id).quantity, 10)
})

test('не умножаем один замер на разные кабельные позиции при массовой подстановке', () => {
  const other = { ...cable, id: 'another', priceKey: 'cable-open-10', title: 'Кабель 10' }
  assert.equal(
    buildRoomWorkFillPlan('electrics', zone, [cable, other], new Set([cable.id, other.id]))
      .conflicts.length,
    1,
  )
  assert.equal(
    buildRoomWorkFillPlan('electrics', zone, [cable, other], new Set([other.id])).conflicts.length,
    0,
  )
  const split = { ...zone, electricCableOpenLength: 80, electricCableChaseLength: 20 }
  const chase = { ...other, priceKey: 'cable-chase-10' }
  assert.equal(
    buildRoomWorkFillPlan('electrics', split, [cable, chase], new Set([cable.id, chase.id]))
      .conflicts.length,
    0,
  )
})

test('плитке явно выбираем поверхность, не выдаём всю площадь за затирку пола', () => {
  const tile = { ...zone, tileFloorArea: 6, tileWallArea: 20, tileBacksplashArea: 3 }
  const work = { id: 'grout-cement', unit: 'м²' }
  assert.equal(suggestRoomWorkQuantity('tile', tile, work).quantity, 0)
  assert.equal(suggestRoomWorkQuantity('tile', tile, work, 'floor').quantity, 6)
  assert.equal(suggestRoomWorkQuantity('tile', tile, work, 'walls').quantity, 20)
  assert.equal(suggestRoomWorkQuantity('tile', tile, work, 'backsplash').quantity, 3)
  assert.equal(suggestRoomWorkQuantity('tile', tile, work, 'both').quantity, 26)
})

test('не заполняем неподходящие единицы, нулевые и ручные позиции; старые приборы не выводим из новых', () => {
  assert.equal(
    suggestRoomWorkQuantity('electrics', zone, { id: cable.priceKey, unit: 'шт.' }).quantity,
    0,
  )
  assert.equal(
    suggestRoomWorkQuantity(
      'electrics',
      { ...zone, electricCableLength: 0 },
      { id: cable.priceKey, unit: cable.unit },
    ).quantity,
    0,
  )
  assert.equal(
    suggestRoomWorkQuantity('electrics', zone, { id: 'panel-cable-org', unit: 'комплекс' })
      .quantity,
    0,
  )
  assert.equal(
    suggestRoomWorkQuantity(
      'plumbing',
      { ...zone, plumbingSinksCount: 2 },
      { id: 'demolition-sink', unit: 'шт.' },
    ).quantity,
    0,
  )
})

test('повторное включение отключённой работы помещения не создаёт дубль', () => {
  const disabled = {
    ...cable,
    id: 'electrics:zone-900',
    zoneId: zone.id,
    enabled: false,
    quantity: 20,
  }
  const result = applyRoomWorkFill([cable, disabled], zone, [{ id: cable.id, quantity: 100 }])
  assert.equal(result.length, 2)
  assert.equal(result.find((line) => line.id === disabled.id).quantity, 100)
  assert.equal(result.find((line) => line.id === disabled.id).enabled, true)
  assert.equal(
    buildRoomWorkFillPlan('electrics', zone, result, new Set([disabled.id])).changes.length,
    0,
  )
})

test('объёмы комнат и привязка перенесённой строки переживают сохранение', () => {
  const lines = applyRoomWorkFill([cable], zone, [{ id: cable.id, quantity: 100 }])
  const restored = parseEstimateCalculatorSnapshot({
    version: 2,
    activeTab: 'electrics',
    zones: [serializeEstimateZone(zone)],
    floors: { input: {}, lines: [] },
    walls: { input: {}, lines: [] },
    electrics: { input: {}, lines },
  })
  const added = restored.electrics.lines.find((line) => line.zoneId === zone.id)
  assert.equal(added.quantity, 100)
  assert.equal(added.unitPrice, 555)
})

test('подстановка доступна для стен, полов, потолков и сантехники вне сценария', () => {
  assert.equal(suggestRoomWorkQuantity('walls', zone, { id: 'paint-2', unit: 'м²' }).quantity, 50)
  assert.ok(
    suggestRoomWorkQuantity('floors', zone, { id: 'wet-screed-up-to-50', unit: 'м²' }).quantity > 0,
  )
  assert.equal(
    suggestRoomWorkQuantity('ceilings', zone, { id: 'paint-ceiling-2', unit: 'м²' }).quantity,
    20,
  )
  assert.equal(
    suggestRoomWorkQuantity(
      'plumbing',
      { ...zone, plumbingOldSinksCount: 1 },
      { id: 'demolition-sink', unit: 'шт.' },
    ).quantity,
    1,
  )
})
