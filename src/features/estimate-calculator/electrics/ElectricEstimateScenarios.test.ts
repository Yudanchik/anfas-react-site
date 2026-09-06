import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { formatElectricScenarioTargetLabel } from './format-electric-scenario-target-label'

describe('ElectricEstimateScenarios target labels and other-scenarios UX', () => {
  it('target select labels are zone name only (no type suffix)', () => {
    assert.equal(formatElectricScenarioTargetLabel({ name: 'Кухня' }), 'Кухня')
    assert.equal(formatElectricScenarioTargetLabel({ name: 'Санузел' }), 'Санузел')
  })

  it('normal Electric UI source has no «Показать другие сценарии» toggle', () => {
    const dir = dirname(fileURLToPath(import.meta.url))
    const source = readFileSync(join(dir, 'ElectricEstimateScenarios.tsx'), 'utf8')
    assert.equal(source.includes('Показать другие сценарии'), false)
    assert.match(source, /resolveElectricScenarioOptionsForZone\(filterZoneType, false\)/)
  })
})
