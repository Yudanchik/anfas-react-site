import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { formatTileScenarioTargetLabel } from './format-tile-scenario-target-label'

const here = dirname(fileURLToPath(import.meta.url))

describe('TileEstimateScenarios target labels and other-scenarios UX', () => {
  it('target select labels are zone name only (no type suffix)', () => {
    assert.equal(formatTileScenarioTargetLabel({ name: 'Санузел' }), 'Санузел')
    assert.equal(formatTileScenarioTargetLabel({ name: 'Кухня' }), 'Кухня')
    assert.ok(!formatTileScenarioTargetLabel({ name: 'Санузел' }).includes('·'))
    assert.ok(!formatTileScenarioTargetLabel({ name: 'Кухня' }).includes('Другое'))
  })

  it('normal Tile UI source has no «Показать другие сценарии» toggle', () => {
    const source = readFileSync(join(here, 'TileEstimateScenarios.tsx'), 'utf8')
    assert.ok(!source.includes('Показать другие сценарии'))
    assert.ok(!source.includes('showAllScenarios'))
    assert.ok(!source.includes('otherList'))
  })
})
