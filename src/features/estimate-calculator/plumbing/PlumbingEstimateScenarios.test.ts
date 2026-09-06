import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { formatPlumbingScenarioTargetLabel } from './format-plumbing-scenario-target-label'

describe('PlumbingEstimateScenarios target labels and other-scenarios UX', () => {
  it('target select labels are zone name only (no type suffix)', () => {
    assert.equal(formatPlumbingScenarioTargetLabel({ name: 'Санузел' }), 'Санузел')
    assert.equal(formatPlumbingScenarioTargetLabel({ name: 'Кухня' }), 'Кухня')
  })

  it('normal Plumbing UI source has no «Показать другие сценарии» toggle', () => {
    const dir = dirname(fileURLToPath(import.meta.url))
    const source = readFileSync(join(dir, 'PlumbingEstimateScenarios.tsx'), 'utf8')
    assert.equal(source.includes('Показать другие сценарии'), false)
    assert.match(source, /resolvePlumbingScenarioOptionsForZone\(filterZoneType, false\)/)
  })
})
