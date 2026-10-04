import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import { build } from 'esbuild'

const bundle = await build({
  entryPoints: ['src/entities/estimate/model/electrics/electric-measurements.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
})
const { patchElectricPoints } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
)

test('подрозетники следуют за встроенными точками, пока количество не исправлено вручную', () => {
  const initial = {
    electricSocketsCount: 2,
    electricSwitchesCount: 1,
    electricDataPointsCount: 1,
    electricSocketBoxesCount: 4,
  }
  assert.deepEqual(patchElectricPoints(initial, { electricSocketsCount: 3 }), {
    electricSocketsCount: 3,
    electricSocketBoxesCount: 5,
  })
  const corrected = { ...initial, electricSocketBoxesCount: 2 }
  assert.deepEqual(patchElectricPoints(corrected, { electricSwitchesCount: 2 }), {
    electricSwitchesCount: 2,
  })
  assert.deepEqual(patchElectricPoints(initial, { electricSocketBoxesCount: 0 }), {
    electricSocketBoxesCount: 0,
  })
})
