import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { createManualEstimateLine, createZonedFloorEstimateLine } from '@/entities/estimate'

import { filterEstimateGroupsByQuery } from './filter-estimate-groups'

describe('filterEstimateGroupsByQuery', () => {
  const laminate = {
    id: 'floors:demolition-laminate',
    priceKey: 'demolition-laminate',
    sectionId: 'floors',
    kind: 'demolition' as const,
    title: 'Демонтаж ламината',
    unit: 'м²',
    unitPrice: 300,
    quantity: 10,
    coefficient: 1,
    enabled: true,
    source: 'both' as const,
  }

  const manual = createManualEstimateLine({
    title: 'Доп. выравнивание',
    unit: 'м²',
    unitPrice: 100,
    quantity: 2,
  })

  const zoned = createZonedFloorEstimateLine({
    priceKey: 'demolition-floor-tile',
    quantity: 5,
    zoneName: 'Кухня',
    zoneId: 'zone-1',
  })

  assert.ok(zoned)

  const groups = [
    {
      id: 'demolition',
      title: 'Демонтаж',
      lines: [laminate, zoned],
      selectedCount: 2,
      totalCount: 2,
      totalRub: 300 * 10 + 5 * (zoned.unitPrice || 0),
    },
    {
      id: 'manual',
      title: 'Ручные строки',
      lines: [{ ...manual, comment: 'коридор у входа' }],
      selectedCount: 1,
      totalCount: 1,
      totalRub: 200,
    },
  ]

  it('filters by work title', () => {
    const next = filterEstimateGroupsByQuery(groups, 'ламинат')
    assert.equal(next.length, 1)
    assert.equal(next[0]?.lines.length, 1)
    assert.equal(next[0]?.lines[0]?.title, 'Демонтаж ламината')
  })

  it('filters by zone name', () => {
    const next = filterEstimateGroupsByQuery(groups, 'кухня')
    assert.equal(next.length, 1)
    assert.equal(next[0]?.lines[0]?.id, zoned.id)
    assert.equal(zoned.zoneName, 'Кухня')
  })

  it('filters by group title and comment', () => {
    assert.equal(filterEstimateGroupsByQuery(groups, 'ручные').length, 1)
    assert.equal(filterEstimateGroupsByQuery(groups, 'коридор').length, 1)
  })

  it('returns empty list when nothing matches', () => {
    assert.deepEqual(filterEstimateGroupsByQuery(groups, 'потолок'), [])
  })

  it('does not change source totals or enabled flags', () => {
    const sourceTotal = groups.reduce((sum, group) => sum + group.totalRub, 0)
    const next = filterEstimateGroupsByQuery(groups, 'кухня')
    assert.ok(next.length > 0)
    assert.equal(
      groups.reduce((sum, group) => sum + group.totalRub, 0),
      sourceTotal,
    )
    assert.equal(groups[0]!.lines[0]!.enabled, true)
    assert.equal(groups[0]!.lines[1]!.enabled, true)
  })

  it('returns all groups for empty query', () => {
    const next = filterEstimateGroupsByQuery(groups, '  ')
    assert.equal(next.length, groups.length)
  })
})
