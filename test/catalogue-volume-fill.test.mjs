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
const { ELECTRIC_PRICE_MAPPING } = await load(
  'src/entities/estimate/model/electrics/electric-price.mapping.ts',
)
const { catalogueVolumeTargets } = await load(
  'src/features/estimate-calculator/model/catalogue-volume-fill.ts',
)
const zone = createEstimateZone({
  name: 'Кухня',
  fields: {
    electricCableLength: 100,
    electricStrobeLength: 20,
    electricCableOpenLength: 80,
    electricCableChaseLength: 20,
  },
})
const generalCableZone = { ...zone, electricCableOpenLength: undefined, electricCableChaseLength: undefined }
const lines = ELECTRIC_PRICE_MAPPING.map((item) => ({
  ...item,
  id: `electrics:${item.id}`,
  priceKey: item.id,
  sectionId: 'electrics',
  enabled: false,
  quantity: 0,
  coefficient: 1,
}))
test('100 м заранее доступны во всех трёх названных выключенных работах', () => {
  const targets = catalogueVolumeTargets('electrics', zone, 'electricCableLength', lines)
  for (const key of ['cable-ceiling-corrugated', 'cable-tv', 'conduit-gopher-pull']) {
    const target = targets.find((entry) => entry.line.priceKey === key)
    assert.equal(target.quantity, 100)
    assert.equal(target.line.enabled, false)
    assert.equal(target.line.zoneId, undefined)
  }
  assert.ok(!targets.some((entry) => entry.line.priceKey === 'chase-concrete-to-35'))
  assert.ok(lines.every((line) => line.quantity === 0))
})
test('пользователь может явно перенести длину штробы или выбранную часть кабеля в другую кабельную работу', () => {
  assert.equal(
    catalogueVolumeTargets('electrics', zone, 'electricStrobeLength', lines).find(
      (entry) => entry.line.priceKey === 'conduit-gopher-pull',
    ).quantity,
    20,
  )
  assert.equal(
    catalogueVolumeTargets('electrics', zone, 'electricCableOpenLength', lines).find(
      (entry) => entry.line.priceKey === 'cable-tv',
    ).quantity,
    80,
  )
})
test('другие комнаты, ручные строки, несовпадающие единицы и нулевые замеры не меняются', () => {
  const line = lines.find((entry) => entry.priceKey === 'cable-tv')
  const variants = [
    line,
    { ...line, id: 'room', zoneId: zone.id },
    { ...line, id: 'free', zoneName: 'Свободная зона' },
    { ...line, id: 'manual', source: 'manual' },
    { ...line, id: 'unit', unit: 'м²' },
  ]
  assert.deepEqual(
    catalogueVolumeTargets('electrics', zone, 'electricCableLength', variants).map(
      (entry) => entry.line.id,
    ),
    [line.id],
  )
  assert.deepEqual(
    catalogueVolumeTargets(
      'electrics',
      { ...zone, electricCableLength: 0 },
      'electricCableLength',
      lines,
    ),
    [],
  )
})

const { unifiedCatalogueTargets, applyUnifiedCatalogueFill } = await load(
  'src/features/estimate-calculator/model/catalogue-volume-fill.ts',
)
const { updateEstimateLine } = await load(
  'src/entities/estimate/model/shared/estimate-line-helpers.ts',
)
const { serializeEstimateLine, parseEstimateCalculatorSnapshot, restoreElectricEstimateState } =
  await load('src/features/estimate-calculator/model/estimate-calculator-persistence.ts')

test('одна кнопка заполняет выключенные строки, сохраняя включённые и ручные значения', () => {
  const tv = lines.find((line) => line.priceKey === 'cable-tv')
  const selected = { ...tv, id: 'selected', enabled: true, quantity: 55 }
  const manual = { ...tv, id: 'manual-quantity', quantity: 33 }
  const inputs = [tv, selected, manual]
  const targets = unifiedCatalogueTargets('electrics', generalCableZone, inputs)
  assert.deepEqual(
    targets.map((target) => target.line.id),
    [tv.id],
  )
  const filled = applyUnifiedCatalogueFill(
    inputs,
    targets.map((target) => ({ id: target.line.id, quantity: target.quantity })),
  )
  assert.equal(filled[0].quantity, 100)
  assert.equal(filled[0].enabled, false)
  assert.equal(filled[0].catalogueAutoQuantity, 100)
  assert.deepEqual(filled[1], selected)
  assert.deepEqual(filled[2], manual)
  assert.equal(unifiedCatalogueTargets('electrics', generalCableZone, filled).length, 0)
  assert.equal(
    unifiedCatalogueTargets('electrics', { ...generalCableZone, electricCableLength: 120 }, filled).length,
    1,
  )
})

test('ручное изменение автоматического объёма, включая ноль, защищено при повторном заполнении', () => {
  const tv = lines.find((line) => line.priceKey === 'cable-tv')
  const filled = applyUnifiedCatalogueFill([tv], [{ id: tv.id, quantity: 100 }])
  const edited = updateEstimateLine(filled, tv.id, { quantity: 0 })
  assert.equal(edited[0].quantityEdited, true)
  assert.deepEqual(
    unifiedCatalogueTargets('electrics', { ...generalCableZone, electricCableLength: 120 }, edited),
    [],
  )
  assert.deepEqual(applyUnifiedCatalogueFill(edited, [{ id: tv.id, quantity: 120 }]), edited)
})

test('происхождение количества сохраняется и автоматический объём обновляется после открытия сметы', () => {
  const tv = lines.find((line) => line.priceKey === 'cable-tv')
  const filled = applyUnifiedCatalogueFill([tv], [{ id: tv.id, quantity: 100 }])
  const snapshot = parseEstimateCalculatorSnapshot({
    version: 2,
    activeTab: 'electrics',
    floors: { input: {}, lines: [] },
    walls: { input: {}, lines: [] },
    electrics: { input: {}, lines: filled.map(serializeEstimateLine) },
  })
  const restored = restoreElectricEstimateState(snapshot).lines.find(
    (line) => line.priceKey === 'cable-tv',
  )
  assert.equal(restored.catalogueAutoQuantity, 100)
  assert.equal(
    unifiedCatalogueTargets('electrics', { ...generalCableZone, electricCableLength: 120 }, [restored])[0]
      .quantity,
    120,
  )
})
