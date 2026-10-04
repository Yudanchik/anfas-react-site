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
const { patchPlumbingFixturePoints } = await moduleFrom(
  'src/entities/estimate/model/plumbing/plumbing-measurements.ts',
)
const { applyElectricScenarioToZone, resolveMeasuredElectricScenarioKeys, electricInputFromZone } =
  await moduleFrom('src/entities/estimate/model/electrics/apply-electric-scenario.ts')
const { parseEstimateCalculatorSnapshot, serializeEstimateZone } = await moduleFrom(
  'src/features/estimate-calculator/model/estimate-calculator-persistence.ts',
)
const validators = await moduleFrom(
  'src/features/estimate-calculator/model/validate-scenario-measures.ts',
)

test('смесители следуют за приборами; рамы считаются только по явно выбранной новой инсталляции', () => {
  const zone = createEstimateZone({
    name: 'Санузел',
    fields: {
      plumbingPointsMode: 'fixtures',
      plumbingFixtureCountsMode: 'auto',
      plumbingSinksCount: 1,
      plumbingBathtubsCount: 1,
      plumbingToiletsCount: 1,
    },
  })
  const counted = { ...zone, ...patchPlumbingFixturePoints(zone, {}) }
  assert.equal(counted.plumbingMixersCount, 2)
  assert.equal(counted.plumbingInstallationsCount, 0)
  assert.equal(
    patchPlumbingFixturePoints(counted, { plumbingToiletMount: 'installation' })
      .plumbingInstallationsCount,
    1,
  )
  assert.equal(
    patchPlumbingFixturePoints(counted, { plumbingToiletMount: 'floor' })
      .plumbingInstallationsCount,
    0,
  )
  assert.equal(
    patchPlumbingFixturePoints(counted, { plumbingToiletMount: 'existing' })
      .plumbingInstallationsCount,
    0,
  )
  const manual = { ...counted, ...patchPlumbingFixturePoints(counted, { plumbingMixersCount: 1 }) }
  assert.equal(manual.plumbingFixtureCountsMode, 'manual')
  const changed = patchPlumbingFixturePoints(manual, { plumbingSinksCount: 2 })
  assert.equal(changed.plumbingMixersCount, undefined)
  assert.equal(changed.plumbingWaterPointsCount, 7)
  assert.equal(
    patchPlumbingFixturePoints(manual, { plumbingFixtureCountsMode: 'auto' }).plumbingMixersCount,
    2,
  )
})

test('демонтаж и новые электрические точки имеют независимые объёмы за один проход', () => {
  const zone = createEstimateZone({
    name: 'Кухня',
    fields: {
      electricSocketsCount: 8,
      electricSwitchesCount: 2,
      electricOldSocketsCount: 3,
      electricOldSwitchesCount: 1,
      electricOldLightPointsCount: 2,
      electricOldCableLength: 15,
    },
  })
  const application = {
    state: 'outlets-switches',
    wallMaterial: 'ready',
    cableRoute: 'existing',
    demolitionBeforeWork: true,
  }
  const result = applyElectricScenarioToZone([], zone, application)
  assert.equal(result.lines.find((line) => line.priceKey === 'demolition-outlets').quantity, 4)
  assert.equal(result.lines.find((line) => line.priceKey === 'demolition-luminaires').quantity, 2)
  assert.equal(result.lines.find((line) => line.priceKey === 'demolition-cable').quantity, 15)
  assert.equal(result.lines.find((line) => line.priceKey === 'finish-outlet-switch').quantity, 10)
  const legacy = createEstimateZone({
    name: 'Кухня',
    fields: { electricSocketsCount: 8, electricSwitchesCount: 2 },
  })
  assert.ok(
    resolveMeasuredElectricScenarioKeys(application, electricInputFromZone(legacy)).every(
      (key) => !key.startsWith('demolition-'),
    ),
  )
  // Старый маршрут «Только демонтаж» без отдельных полей сохраняет прежнюю интерпретацию.
  assert.ok(
    resolveMeasuredElectricScenarioKeys(
      { state: 'demolition-only' },
      electricInputFromZone(legacy),
    ).includes('demolition-outlets'),
  )
})

test('новые замеры, режимы и ответ о демонтаже переживают сохранение', () => {
  const zone = createEstimateZone({
    name: 'Санузел',
    fields: {
      electricOldSocketsCount: 3,
      electricOldCableLength: 15,
      plumbingToiletMount: 'installation',
      plumbingFixtureCountsMode: 'auto',
    },
  })
  const snapshot = {
    version: 2,
    activeTab: 'electrics',
    zones: [serializeEstimateZone(zone)],
    floors: { input: {}, lines: [] },
    walls: { input: {}, lines: [] },
    electricScenarios: { state: 'outlets-switches', demolitionBeforeWork: true },
  }
  const restored = parseEstimateCalculatorSnapshot(snapshot)
  assert.equal(restored.zones[0].electricOldSocketsCount, 3)
  assert.equal(restored.zones[0].electricOldCableLength, 15)
  assert.equal(restored.zones[0].plumbingToiletMount, 'installation')
  assert.equal(restored.zones[0].plumbingFixtureCountsMode, 'auto')
  assert.equal(restored.electricScenarios.demolitionBeforeWork, true)
})

test('недостающие замеры названы для выбранной работы', () => {
  const zone = createEstimateZone({ name: 'Комната' })
  assert.match(
    validators.validateTileScenarioMeasures({
      application: { state: 'floor-only' },
      input: {},
      zone,
    }).message,
    /Плитка пола/,
  )
  assert.match(
    validators.validateElectricScenarioMeasures({
      application: { state: 'outlets-switches', wallMaterial: 'ready' },
      input: {},
      zone,
    }).message,
    /Розетки/,
  )
  assert.match(
    validators.validatePlumbingScenarioMeasures({
      application: { state: 'water-supply-only' },
      input: {},
      zone,
    }).message,
    /Водорозетки/,
  )
  assert.match(
    validators.validateCeilingScenarioMeasures({
      application: { state: 'demolition-only', finishTarget: 'none' },
      input: {},
      zone,
    }).message,
    /Демонтаж потолков/,
  )
})
