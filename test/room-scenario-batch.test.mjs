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
const { createEstimateZone, updateEstimateZone } = await moduleFrom(
  'src/entities/estimate/model/shared/estimate-zone.ts',
)
const { resolveFloorRoomPlan, applyFloorPresetToZone } = await moduleFrom(
  'src/entities/estimate/model/floors/apply-floor-preset.ts',
)
const { useRoomScenarioBatch } = await moduleFrom(
  'src/features/estimate-calculator/model/use-room-scenario-batch.ts',
)
const { getRoomScenarioStatus, scenarioMeasureSignature, ALL_SCENARIO_ROOMS } = await moduleFrom(
  'src/features/estimate-calculator/model/room-scenario-status.ts',
)
const { parseEstimateCalculatorSnapshot, serializeEstimateZone } = await moduleFrom(
  'src/features/estimate-calculator/model/estimate-calculator-persistence.ts',
)

const application = {
  presetId: 'room-plan',
  oldCovering: 'none',
  leveling: 'self-leveling',
  waterproofing: 'acrylic-2',
}
test('сухая комната не блокирует подготовку пола; гидроизоляция только по мокрой площади', () => {
  const dry = {
    totalFloorArea: 12,
    demolitionArea: 0,
    screedArea: 0,
    wetZonesArea: 0,
    avgDeltaMm: 0,
  }
  const plan = resolveFloorRoomPlan(application, dry)
  assert.deepEqual(plan.issues, [])
  assert.ok(plan.works.length > 0)
  assert.ok(plan.works.every((work) => !work.key.startsWith('waterproofing')))
  const wet = resolveFloorRoomPlan(application, { ...dry, wetZonesArea: 3 })
  assert.equal(wet.works.find((work) => work.key === 'waterproofing-acrylic-2').quantity, 3)
  assert.ok(resolveFloorRoomPlan({ ...application, leveling: 'none' }, dry).issues.length > 0)
})

test('повторный проход без шлифования выключает прежнюю автоматическую строку той же комнаты', () => {
  const zone = createEstimateZone({ name: 'Кухня', fields: { floorArea: 12 } })
  const withGrinding = applyFloorPresetToZone([], zone, {
    ...application, selfLevelingBase: 'grind', waterproofing: 'none',
  }).lines
  assert.equal(withGrinding.find((line) => line.priceKey === 'self-leveling-grind').enabled, true)
  const withoutGrinding = applyFloorPresetToZone(withGrinding, zone, {
    ...application, selfLevelingBase: 'ready', waterproofing: 'none',
  }).lines
  assert.equal(withoutGrinding.find((line) => line.priceKey === 'self-leveling-grind').enabled, false)
  assert.equal(withoutGrinding.find((line) => line.priceKey === 'self-leveling-primer').enabled, true)
})

test('смена стяжки с контактной на плёнку выключает прежний грунт в той же комнате', () => {
  const zone = createEstimateZone({ name: 'Кухня', fields: { floorArea: 12 } })
  const common = { ...application, leveling: 'wet-up-to-50', waterproofing: 'none' }
  const bonded = applyFloorPresetToZone([], zone, { ...common, screedBase: 'bonded' }).lines
  const film = applyFloorPresetToZone(bonded, zone, { ...common, screedBase: 'film' }).lines
  assert.equal(film.find((line) => line.priceKey === 'wet-primer')?.enabled, false)
  assert.equal(film.find((line) => line.priceKey === 'wet-pe-film')?.enabled, true)
})

test('массовый проход берёт отдельные замеры, пропускает пустую комнату и сохраняет записи одним обновлением', () => {
  const zones = [
    createEstimateZone({ name: 'Кухня', fields: { floorArea: 12 } }),
    createEstimateZone({ name: 'Санузел', fields: { floorArea: 5, wetArea: 3 } }),
    createEstimateZone({ name: 'Пустая' }),
  ]
  let lines = []
  let saved
  let success = ''
  let updates = 0
  const batch = useRoomScenarioBatch({
    section: 'floors',
    zones,
    lines,
    targetId: ALL_SCENARIO_ROOMS,
    check: (zone) => ({ ok: zone.floorArea > 0, message: 'нет площади' }),
    apply: (zone) => {
      const result = applyFloorPresetToZone(lines, zone, application)
      lines = result.lines
      return { label: 'Подготовка пола', addedCount: result.addedCount }
    },
    onZonesChange: (next) => {
      saved = next
      updates++
    },
    setSuccess: (text) => {
      success = text
    },
    setError: () => assert.fail('unexpected error'),
  })
  assert.equal(batch.ready.length, 2)
  assert.equal(batch.excluded.length, 1)
  assert.equal(batch.apply(), true)
  assert.equal(updates, 1)
  assert.ok(success.includes('Пустая'))
  assert.equal(saved[2].scenarioStatuses, undefined)
  assert.ok(
    lines.filter((line) => line.zoneId === zones[0].id).every((line) => line.quantity === 12),
  )
  assert.equal(
    lines.find((line) => line.zoneId === zones[1].id && line.priceKey === 'waterproofing-acrylic-2')
      .quantity,
    3,
  )
  assert.equal(getRoomScenarioStatus('floors', saved[0], lines).applied, true)
  const changed = updateEstimateZone(saved, zones[0].id, { floorArea: 14 })
  assert.equal(getRoomScenarioStatus('floors', changed[0], lines).applied, false)
  assert.equal(getRoomScenarioStatus('floors', saved[0], []).applied, false)
})

test('ошибка применения не отмечает комнату как обработанную', () => {
  const zone = createEstimateZone({ name: 'Кухня', fields: { floorArea: 12 } })
  let saved
  let error = ''
  const batch = useRoomScenarioBatch({
    section: 'floors',
    zones: [zone],
    lines: [],
    targetId: zone.id,
    check: () => ({ ok: true }),
    apply: () => ({ label: '', addedCount: 0, error: 'нет цены' }),
    onZonesChange: (next) => {
      saved = next
    },
    setSuccess: () => assert.fail(),
    setError: (text) => {
      error = text
    },
  })
  assert.equal(batch.apply(), false)
  assert.equal(saved, undefined)
  assert.ok(error.includes('нет цены'))
})

test('статусы переживают сохранение; старые и повреждённые снимки не дают ложного применения', () => {
  const zone = createEstimateZone({ name: 'Кухня', fields: { floorArea: 12 } })
  zone.scenarioStatuses = {
    floors: { label: 'Пол', measureSignature: scenarioMeasureSignature('floors', zone) },
  }
  const snapshot = {
    version: 2,
    activeTab: 'floors',
    zones: [serializeEstimateZone(zone)],
    floors: { input: {}, lines: [] },
    walls: { input: {}, lines: [] },
  }
  const restored = parseEstimateCalculatorSnapshot(snapshot).zones[0]
  assert.deepEqual(restored.scenarioStatuses, zone.scenarioStatuses)
  assert.equal(
    scenarioMeasureSignature('floors', restored),
    zone.scenarioStatuses.floors.measureSignature,
  )
  snapshot.zones[0].scenarioStatuses = {
    floors: { label: 4 },
    unknown: { label: 'bad', measureSignature: 'bad' },
  }
  assert.deepEqual(parseEstimateCalculatorSnapshot(snapshot).zones[0].scenarioStatuses, {})
  delete snapshot.zones[0].scenarioStatuses
  assert.equal(parseEstimateCalculatorSnapshot(snapshot).zones[0].scenarioStatuses, undefined)
})

test('ответы о подготовке пола и плитки восстанавливаются; старые снимки сохраняют прежний маршрут', () => {
  const snapshot = {
    version: 2, activeTab: 'floors', zones: [],
    floors: { input: {}, lines: [] }, walls: { input: {}, lines: [] },
    floorPresets: { roomLeveling: 'wet-up-to-50', selfLevelingBase: 'grind', roomScreedBase: 'film' },
    tileScenarios: { state: 'floor-only', preparation: 'prepare' },
  }
  const restored = parseEstimateCalculatorSnapshot(snapshot)
  assert.equal(restored.floorPresets.selfLevelingBase, 'grind')
  assert.equal(restored.floorPresets.roomScreedBase, 'film')
  assert.equal(restored.tileScenarios.preparation, 'prepare')
  delete snapshot.floorPresets.selfLevelingBase
  delete snapshot.floorPresets.roomScreedBase
  delete snapshot.tileScenarios.preparation
  const legacy = parseEstimateCalculatorSnapshot(snapshot)
  assert.equal(legacy.floorPresets.selfLevelingBase, 'ready')
  assert.equal(legacy.floorPresets.roomScreedBase, 'bonded')
  assert.equal(legacy.tileScenarios.preparation, 'ready')
})

const validators = await moduleFrom(
  'src/features/estimate-calculator/model/validate-scenario-measures.ts',
)
for (const [section, name, application, fields] of [
  [
    'ceilings',
    'Ceiling',
    { state: 'finish-only', finishTarget: 'paint', paintLayers: 'paint-ceiling-2' },
    { ceilingArea: 12 },
  ],
  [
    'tile',
    'Tile',
    { state: 'floor-only', cladFormat: '301-1300', grout: 'cement' },
    { tileFloorArea: 12 },
  ],
  [
    'electrics',
    'Electric',
    { state: 'outlets-switches', wallMaterial: 'ready', cableRoute: 'existing' },
    { electricSocketsCount: 5, electricSwitchesCount: 2 },
  ],
  [
    'plumbing',
    'Plumbing',
    { state: 'fixtures-only', sinkKind: 'ordinary' },
    { plumbingSinksCount: 1 },
  ],
]) {
  const domain = await moduleFrom(
    `src/entities/estimate/model/${section}/apply-${section === 'electrics' ? 'electric' : section === 'ceilings' ? 'ceiling' : section}-scenario.ts`,
  )
  test(`массовый сценарий ${section} сохраняет отдельные комнаты и не дублирует повторное применение`, () => {
    const zones = [
      createEstimateZone({ name: 'Кухня', fields }),
      createEstimateZone({ name: 'Санузел', fields }),
      createEstimateZone({ name: 'Пустая' }),
    ]
    let lines = []
    let saved = zones
    function run() {
      const batch = useRoomScenarioBatch({
        section,
        zones: saved,
        lines,
        targetId: ALL_SCENARIO_ROOMS,
        check: (zone) =>
          validators[`validate${name}ScenarioMeasures`]({ application, input: {}, zone }),
        apply: (zone) => {
          const result = domain[`apply${name}ScenarioToZone`](lines, zone, application)
          lines = result.lines
          return { label: result.scenarioLabel, addedCount: result.addedCount }
        },
        onZonesChange: (next) => {
          saved = next
        },
        setSuccess: () => {},
        setError: (text) => assert.fail(text),
      })
      assert.equal(batch.ready.length, 2)
      assert.equal(batch.excluded.length, 1)
      assert.equal(batch.apply(), true)
    }
    run()
    const count = lines.length
    assert.ok(lines.some((line) => line.zoneId === zones[0].id))
    assert.ok(lines.some((line) => line.zoneId === zones[1].id))
    assert.ok(lines.every((line) => line.zoneId !== zones[2].id))
    run()
    assert.equal(lines.length, count)
    assert.equal(getRoomScenarioStatus(section, saved[0], lines).applied, true)
  })
}
