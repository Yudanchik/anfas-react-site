import {
  applyQuantityToMatchingLines,
  createManualEstimateLine,
} from '../shared/estimate-line-helpers'
import type { ElectricWorkKind, EstimateLine } from '../shared/estimate.types'
import { ELECTRIC_SECTION_ID } from './electric-price.mapping'

/**
 * Быстрые действия электрики: подставить объём/количество, не включая работы.
 * Zoned clones не трогает (правятся отдельно через zone-сценарии).
 */
export function applyElectricSocketsCount(
  lines: readonly EstimateLine[],
  quantity: number,
  switchesCount = 0,
): EstimateLine[] {
  const next = applyQuantityToMatchingLines(
    lines,
    (line) => line.kind === 'finish-outlet' && line.unit === 'шт.',
    quantity,
  )
  return applyQuantityToMatchingLines(
    next,
    (line) => line.priceKey === 'finish-outlet-switch',
    Math.max(0, quantity) + Math.max(0, switchesCount),
  )
}

export function applyElectricSwitchesCount(
  lines: readonly EstimateLine[],
  quantity: number,
  socketsCount = 0,
): EstimateLine[] {
  const next = applyQuantityToMatchingLines(
    lines,
    (line) =>
      (line.priceKey === 'finish-switch-key' ||
        line.priceKey === 'finish-pass-through' ||
        line.priceKey === 'finish-dimmer') &&
      line.unit === 'шт.',
    quantity,
  )
  return applyQuantityToMatchingLines(
    next,
    (line) => line.priceKey === 'finish-outlet-switch',
    Math.max(0, quantity) + Math.max(0, socketsCount),
  )
}

export function applyElectricLightPointsCount(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => (line.kind as ElectricWorkKind) === 'finish-light' && line.unit === 'шт.',
    quantity,
  )
}

export function applyElectricCableLength(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => (line.kind as ElectricWorkKind) === 'cable' && line.unit === 'м. пог.',
    quantity,
  )
}

export function applyElectricStrobeLength(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => (line.kind as ElectricWorkKind) === 'chase' && line.unit === 'м. пог.',
    quantity,
  )
}

export function applyElectricWarmFloorArea(
  lines: readonly EstimateLine[],
  quantity: number,
): EstimateLine[] {
  return applyQuantityToMatchingLines(
    lines,
    (line) => (line.kind as ElectricWorkKind) === 'underfloor' && line.unit === 'м²',
    quantity,
  )
}

export function createManualElectricEstimateLine(params: {
  title: string
  unit: string
  unitPrice: number
  quantity?: number
  coefficient?: number
  comment?: string
}): EstimateLine {
  return createManualEstimateLine({
    ...params,
    sectionId: ELECTRIC_SECTION_ID,
    kind: 'other',
  })
}
