import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Buffer } from 'node:buffer'
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
const { createEstimateZone, updateEstimateZone } = await load(
  'src/entities/estimate/model/shared/estimate-zone.ts',
)
const { sectionRooms, mergeSectionRooms, setRoomParticipation, parseExcludedSections } = await load(
  'src/features/estimate-calculator/model/room-section-participation.ts',
)
const { parseEstimateCalculatorSnapshot, serializeEstimateZone } = await load(
  'src/features/estimate-calculator/model/estimate-calculator-persistence.ts',
)
const { applyElectricScenarioToZone } = await load(
  'src/entities/estimate/model/electrics/apply-electric-scenario.ts',
)

test('исключение комнаты из плитки сохраняет стены, замеры и статусы других разделов', () => {
  const room = createEstimateZone({
    name: 'Коридор',
    fields: {
      wallArea: 50,
      scenarioStatuses: {
        walls: { label: 'Стены', measureSignature: 'w' },
        tile: { label: 'Плитка', measureSignature: 't' },
      },
    },
  })
  const hidden = setRoomParticipation(room, 'tile', false)
  assert.equal(sectionRooms([hidden], 'tile').length, 0)
  assert.equal(sectionRooms([hidden], 'walls').length, 1)
  assert.equal(hidden.wallArea, 50)
  assert.equal(hidden.scenarioStatuses.tile, undefined)
  assert.equal(hidden.scenarioStatuses.walls.label, 'Стены')
  const restored = setRoomParticipation(hidden, 'tile', true)
  assert.equal(sectionRooms([restored], 'tile').length, 1)
  assert.equal(restored.scenarioStatuses.tile, undefined)
})

test('изменение видимого подмножества и добавление комнаты не теряет скрытые комнаты', () => {
  const hidden = setRoomParticipation(createEstimateZone({ name: 'Комната' }), 'plumbing', false)
  const visible = createEstimateZone({ name: 'Санузел' })
  const added = createEstimateZone({ name: 'Кухня' })
  const merged = mergeSectionRooms(
    [hidden, visible],
    [{ ...visible, plumbingSinksCount: 2 }, added],
  )
  assert.equal(merged.length, 3)
  assert.deepEqual(merged[0], hidden)
  assert.equal(merged[1].plumbingSinksCount, 2)
  assert.equal(sectionRooms(merged, 'plumbing').length, 2)
  assert.equal(sectionRooms(merged, 'walls').length, 3)
})

test('участие в разделах и смешанный метраж переживают сохранение; старые сметы доступны во всех разделах', () => {
  const zone = createEstimateZone({
    name: 'Комната',
    fields: {
      excludedSections: ['tile', 'plumbing'],
      electricCableOpenLength: 80,
      electricCableChaseLength: 20,
    },
  })
  const snapshot = parseEstimateCalculatorSnapshot({
    version: 2,
    activeTab: 'electrics',
    zones: [serializeEstimateZone(zone)],
    floors: { input: {}, lines: [] },
    walls: { input: {}, lines: [] },
    electricScenarios: { state: 'room-rewire', cableRoute: 'mixed' },
  })
  assert.deepEqual(snapshot.zones[0].excludedSections, ['tile', 'plumbing'])
  assert.equal(snapshot.zones[0].electricCableOpenLength, 80)
  assert.equal(snapshot.electricScenarios.cableRoute, 'mixed')
  assert.deepEqual(parseExcludedSections(['tile', 'bad', 'tile']), ['tile'])
  assert.equal(sectionRooms([createEstimateZone({ name: 'Старая' })], 'tile').length, 1)
})

test('80 м открыто + 20 м в штробе дают отдельные строки; длина штробы независима', () => {
  const zone = createEstimateZone({
    name: 'Комната',
    fields: {
      electricCableLength: 100,
      electricCableOpenLength: 80,
      electricCableChaseLength: 20,
      electricStrobeLength: 10,
    },
  })
  const result = applyElectricScenarioToZone([], zone, {
    state: 'room-rewire',
    wallMaterial: 'brick',
    cableRoute: 'mixed',
  })
  const qty = Object.fromEntries(result.lines.map((line) => [line.priceKey, line.quantity]))
  assert.equal(qty['cable-open-1-5-2-5'], 80)
  assert.equal(qty['cable-chase-1-5-2-5'], 20)
  assert.equal(qty['chase-brick-to-35'], 10)
  const ready = applyElectricScenarioToZone(
    [],
    { ...zone, electricStrobeLength: 0 },
    { state: 'room-rewire', wallMaterial: 'brick', cableRoute: 'mixed' },
  )
  assert.ok(!ready.enabledPriceKeys.includes('chase-brick-to-35'))
  const reset = updateEstimateZone([zone], zone.id, {
    electricCableOpenLength: undefined,
    electricCableChaseLength: undefined,
  })[0]
  assert.equal(reset.electricCableOpenLength, undefined)
  const legacy = applyElectricScenarioToZone([], reset, {
    state: 'room-rewire',
    wallMaterial: 'brick',
    cableRoute: 'open',
  })
  assert.equal(legacy.lines.find((line) => line.priceKey === 'cable-open-1-5-2-5').quantity, 100)
})

const { applyPlumbingScenarioToZone } = await load(
  'src/entities/estimate/model/plumbing/apply-plumbing-scenario.ts',
)
test('замена сантехники снимает старые приборы, а новые считает независимо', () => {
  const zone = createEstimateZone({
    name: 'Санузел',
    fields: {
      plumbingOldSinksCount: 1,
      plumbingOldToiletsCount: 0,
      plumbingOldBathtubsCount: 0,
      plumbingOldMixersCount: 1,
      plumbingSinksCount: 2,
      plumbingToiletsCount: 1,
    },
  })
  const result = applyPlumbingScenarioToZone([], zone, {
    state: 'bathroom-replacement',
    toiletKind: 'floor',
    sinkKind: 'ordinary',
    bathKind: 'unknown',
    showerKind: 'unknown',
  })
  const qty = Object.fromEntries(result.lines.map((line) => [line.priceKey, line.quantity]))
  assert.equal(qty['demolition-sink'], 1)
  assert.equal(qty['finish-sink-ordinary'], 2)
  assert.equal(qty['finish-toilet-floor'], 1)
  assert.equal(qty['demolition-toilet'], undefined)
  const restored = parseEstimateCalculatorSnapshot({
    version: 2,
    activeTab: 'plumbing',
    zones: [serializeEstimateZone(zone)],
    floors: { input: {}, lines: [] },
    walls: { input: {}, lines: [] },
  })
  assert.equal(restored.zones[0].plumbingOldSinksCount, 1)
})

test('замена не угадывает старые приборы из нового счётчика старой сметы', () => {
  const zone = createEstimateZone({ name: 'Санузел', fields: { plumbingSinksCount: 2 } })
  const app = {
    state: 'bathroom-replacement',
    sinkKind: 'ordinary',
    toiletKind: 'unknown',
    bathKind: 'unknown',
    showerKind: 'unknown',
  }
  assert.ok(
    !applyPlumbingScenarioToZone([], zone, app).enabledPriceKeys.includes('demolition-sink'),
  )
  const standalone = applyPlumbingScenarioToZone([], zone, { state: 'demolition-only' })
  assert.equal(standalone.lines.find((line) => line.priceKey === 'demolition-sink').quantity, 2)
})

const { resolveTileScenarioKeys } = await load(
  'src/entities/estimate/model/tile/apply-tile-scenario.ts',
)
test('фартук и крупный формат учитывают выбранную затирку, а ответ нет исключает её', () => {
  for (const state of ['kitchen-backsplash', 'large-format']) {
    assert.ok(resolveTileScenarioKeys({ state, grout: 'cement' }).includes('grout-cement'))
    assert.ok(resolveTileScenarioKeys({ state, grout: 'epoxy' }).includes('grout-epoxy'))
    assert.ok(
      !resolveTileScenarioKeys({ state, grout: 'none' }).some((key) => key.startsWith('grout-')),
    )
  }
})
