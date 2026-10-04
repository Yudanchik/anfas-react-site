import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import { build } from 'esbuild'

async function moduleFrom(path) {
  const bundle = await build({
    entryPoints: [path],
    bundle: true,
    platform: 'node',
    format: 'esm',
    write: false,
  })
  return import(
    `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
  )
}
const { createEstimateZone } = await moduleFrom(
  'src/entities/estimate/model/shared/estimate-zone.ts',
)
const { estimatePlumbingPoints, patchPlumbingFixturePoints } = await moduleFrom(
  'src/entities/estimate/model/plumbing/plumbing-measurements.ts',
)
const { getRoomQuickFill } = await moduleFrom(
  'src/features/estimate-calculator/model/room-quick-fill.ts',
)
const { parseEstimateCalculatorSnapshot, serializeEstimateZone } = await moduleFrom(
  'src/features/estimate-calculator/model/estimate-calculator-persistence.ts',
)

test('типовой расчёт выводов идёт от приборов; ручная схема сохраняется', () => {
  const zone = createEstimateZone({
    name: 'Санузел',
    fields: {
      plumbingPointsMode: 'fixtures',
      plumbingSinksCount: 1,
      plumbingShowersCount: 1,
      plumbingToiletsCount: 1,
      plumbingWasherConnectionsCount: 1,
    },
  })
  assert.deepEqual(estimatePlumbingPoints(zone), {
    plumbingWaterPointsCount: 6,
    plumbingSewerPointsCount: 4,
  })
  assert.equal(
    patchPlumbingFixturePoints(zone, { plumbingSinksCount: 2 }).plumbingWaterPointsCount,
    8,
  )
  const manual = patchPlumbingFixturePoints(zone, { plumbingWaterPointsCount: 0 })
  assert.equal(manual.plumbingPointsMode, 'manual')
  assert.equal(manual.plumbingWaterPointsCount, 0)
  const change = patchPlumbingFixturePoints({ ...zone, ...manual }, { plumbingShowersCount: 2 })
  assert.equal(change.plumbingWaterPointsCount, undefined)
})

test('режим выводов переживает сохранение; старые сметы не переходят на авто', () => {
  const zone = createEstimateZone({ name: 'Санузел', fields: { plumbingPointsMode: 'fixtures' } })
  const snapshot = {
    version: 2,
    activeTab: 'plumbing',
    zones: [serializeEstimateZone(zone)],
    floors: { input: {}, lines: [] },
    walls: { input: {}, lines: [] },
  }
  assert.equal(parseEstimateCalculatorSnapshot(snapshot).zones[0].plumbingPointsMode, 'fixtures')
  delete snapshot.zones[0].plumbingPointsMode
  assert.equal(parseEstimateCalculatorSnapshot(snapshot).zones[0].plumbingPointsMode, 'manual')
})

test('быстрое заполнение меняет только выбранные измеренные строки нужной комнаты', () => {
  const zone = createEstimateZone({ name: 'Кухня', fields: { wallArea: 50 } })
  const line = {
    id: 'walls:zone-test',
    sectionId: 'walls',
    zoneId: zone.id,
    source: 'pdf',
    priceKey: 'paint-2',
    unit: 'м²',
    enabled: true,
    quantity: 20,
  }
  const lines = [
    line,
    { ...line, id: 'other', zoneId: 'zone-other' },
    { ...line, id: 'manual', source: 'manual' },
    { ...line, id: 'off', enabled: false },
    { ...line, id: 'unit', unit: 'шт.' },
    { ...line, id: 'custom', priceKey: 'custom' },
  ]
  assert.deepEqual(getRoomQuickFill('walls', zone, lines), [{ id: line.id, quantity: 50 }])
  assert.deepEqual(getRoomQuickFill('walls', { ...zone, wallArea: 0 }, lines), [])
})

test('быстрое заполнение не увеличивает затирку пола до площади всех стен и пола', () => {
  const zone = createEstimateZone({
    name: 'Ванная',
    fields: { tileFloorArea: 6, tileWallArea: 20 },
  })
  assert.deepEqual(
    getRoomQuickFill('tile', zone, [
      {
        id: 'grout',
        zoneId: zone.id,
        sectionId: 'tile',
        priceKey: 'grout-cement',
        unit: 'м²',
        enabled: true,
        source: 'pdf',
        quantity: 6,
      },
    ]),
    [],
  )
})
