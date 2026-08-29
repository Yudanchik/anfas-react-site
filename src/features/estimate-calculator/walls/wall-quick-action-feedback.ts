import type { EstimateLine, EstimateWorkKind, WallWorkKind } from '@/entities/estimate'

const PLASTER_KINDS: readonly WallWorkKind[] = ['plaster-gypsum', 'plaster-cement']
const PUTTY_KINDS: readonly WallWorkKind[] = ['prep', 'primer', 'putty', 'reinforce']
const FINISH_KINDS: readonly WallWorkKind[] = ['finish-paint', 'finish-wallpaper']

export function countWallTotalAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) => line.unit === 'м²' && line.source !== 'manual' && line.kind !== 'demolition',
  ).length
}

export function countWallDemolitionAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter((line) => line.kind === 'demolition' && line.unit === 'м²').length
}

export function countWallPlasterAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) =>
      (PLASTER_KINDS as readonly EstimateWorkKind[]).includes(line.kind) && line.unit === 'м²',
  ).length
}

export function countWallPuttyAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) => (PUTTY_KINDS as readonly EstimateWorkKind[]).includes(line.kind) && line.unit === 'м²',
  ).length
}

export function countWallFinishAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) =>
      (FINISH_KINDS as readonly EstimateWorkKind[]).includes(line.kind) && line.unit === 'м²',
  ).length
}

export function countWallSlopesTargets(lines: readonly EstimateLine[]): number {
  return lines.filter((line) => line.kind === 'slopes' && line.unit === 'м. пог.').length
}

export function countWallCornersTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) =>
      (line.priceKey.includes('corners') || line.title.toLowerCase().includes('углов')) &&
      line.unit === 'м. пог.',
  ).length
}

export type WallQuickActionKind =
  | 'total-area'
  | 'demolition-area'
  | 'plaster-area'
  | 'putty-area'
  | 'finish-area'
  | 'linear'
  | 'reset'

export function formatWallQuickActionFeedback(
  kind: WallQuickActionKind,
  affectedCount?: number,
): string {
  switch (kind) {
    case 'total-area':
      return `Площадь стен применена к ${affectedCount ?? 0} строкам`
    case 'demolition-area':
      return `Площадь демонтажа применена к ${affectedCount ?? 0} строкам`
    case 'plaster-area':
      return `Площадь штукатурки применена к ${affectedCount ?? 0} строкам`
    case 'putty-area':
      return `Площадь шпаклёвки применена к ${affectedCount ?? 0} строкам`
    case 'finish-area':
      return `Площадь финиша применена к ${affectedCount ?? 0} строкам`
    case 'linear':
      return `Пог. м применены к ${affectedCount ?? 0} строкам`
    case 'reset':
      return 'Смета по стенам сброшена'
  }
}
