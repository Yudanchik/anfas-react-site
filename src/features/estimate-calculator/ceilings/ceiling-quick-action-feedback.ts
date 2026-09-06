import type { CeilingWorkKind, EstimateLine, EstimateWorkKind } from '@/entities/estimate'

const PLASTER_KINDS: readonly CeilingWorkKind[] = ['plaster']
const PUTTY_KINDS: readonly CeilingWorkKind[] = ['prep', 'primer', 'putty', 'reinforce']
const FINISH_KINDS: readonly CeilingWorkKind[] = ['finish-paint']

export function countCeilingTotalAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) => line.unit === 'м²' && line.source !== 'manual' && line.kind !== 'demolition',
  ).length
}

export function countCeilingDemolitionAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter((line) => line.kind === 'demolition' && line.unit === 'м²').length
}

export function countCeilingPlasterAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) =>
      (PLASTER_KINDS as readonly EstimateWorkKind[]).includes(line.kind) && line.unit === 'м²',
  ).length
}

export function countCeilingPuttyAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) => (PUTTY_KINDS as readonly EstimateWorkKind[]).includes(line.kind) && line.unit === 'м²',
  ).length
}

export function countCeilingFinishAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) =>
      (FINISH_KINDS as readonly EstimateWorkKind[]).includes(line.kind) && line.unit === 'м²',
  ).length
}

export type CeilingQuickActionKind =
  | 'total-area'
  | 'demolition-area'
  | 'plaster-area'
  | 'putty-area'
  | 'finish-area'
  | 'reset'

export function formatCeilingQuickActionFeedback(
  kind: CeilingQuickActionKind,
  affectedCount?: number,
): string {
  switch (kind) {
    case 'total-area':
      return `Площадь потолков применена к ${affectedCount ?? 0} строкам`
    case 'demolition-area':
      return `Площадь демонтажа применена к ${affectedCount ?? 0} строкам`
    case 'plaster-area':
      return `Площадь штукатурки применена к ${affectedCount ?? 0} строкам`
    case 'putty-area':
      return `Площадь шпаклёвки применена к ${affectedCount ?? 0} строкам`
    case 'finish-area':
      return `Площадь финиша применена к ${affectedCount ?? 0} строкам`
    case 'reset':
      return 'Потолки сброшены'
  }
}
