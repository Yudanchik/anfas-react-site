import type { EstimateLine, FloorWorkKind } from '@/entities/estimate'

const SCREED_KINDS: readonly FloorWorkKind[] = [
  'base-prep',
  'primer',
  'screed-semidry',
  'screed-wet',
  'self-leveling',
]

export function countTotalAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) => line.unit === 'м²' && line.kind !== 'waste' && line.source !== 'manual',
  ).length
}

export function countDemolitionAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter((line) => line.kind === 'demolition' && line.unit === 'м²').length
}

export function countScreedAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter((line) => SCREED_KINDS.includes(line.kind) && line.unit === 'м²').length
}

export function countWetAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter((line) => line.kind === 'waterproofing' && line.unit === 'м²').length
}

export type QuickActionKind =
  | 'total-area'
  | 'demolition-area'
  | 'screed-area'
  | 'wet-area'
  | 'reset'

export function formatQuickActionFeedback(kind: QuickActionKind, affectedCount?: number): string {
  switch (kind) {
    case 'total-area':
      return `Общая площадь применена к ${affectedCount ?? 0} строкам`
    case 'demolition-area':
      return `Площадь демонтажа применена к ${affectedCount ?? 0} строкам`
    case 'screed-area':
      return `Площадь стяжки применена к ${affectedCount ?? 0} строкам`
    case 'wet-area':
      return 'Мокрые зоны применены к гидроизоляции'
    case 'reset':
      return 'Смета сброшена'
  }
}
