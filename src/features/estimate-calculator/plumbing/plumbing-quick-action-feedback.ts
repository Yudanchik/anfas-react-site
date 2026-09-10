import type { EstimateLine, PlumbingWorkKind } from '@/entities/estimate'

export function countPlumbingWaterPipeTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) => (line.kind as PlumbingWorkKind) === 'water-supply' && line.unit === 'м. пог.',
  ).length
}

export function countPlumbingSewerPipeTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) => (line.kind as PlumbingWorkKind) === 'drainage' && line.unit === 'м. пог.',
  ).length
}

export function countPlumbingWaterPointsTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) =>
      (line.priceKey === 'water-outlet' ||
        line.priceKey === 'water-outlet-fix' ||
        line.priceKey === 'water-outlet-double') &&
      (line.unit === 'шт.' || line.unit === 'комплекс'),
  ).length
}

export function countPlumbingSewerPointsTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) =>
      (line.priceKey === 'drainage-outlet-fix' ||
        line.priceKey === 'drainage-elbow-d32-50' ||
        line.priceKey === 'drainage-elbow-d110' ||
        line.priceKey === 'drainage-tee-d32-50' ||
        line.priceKey === 'drainage-tee-d110') &&
      line.unit === 'шт.',
  ).length
}

export function countPlumbingWarmFloorTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) => (line.kind as PlumbingWorkKind) === 'underfloor' && line.unit === 'м²',
  ).length
}

export type PlumbingQuickActionKind =
  | 'water-pipe'
  | 'sewer-pipe'
  | 'water-points'
  | 'sewer-points'
  | 'warm-floor'
  | 'reset'

export function formatPlumbingQuickActionFeedback(
  kind: PlumbingQuickActionKind,
  affectedCount?: number,
): string {
  switch (kind) {
    case 'water-pipe':
      return `Длина труб водоснабжения применена к ${affectedCount ?? 0} строкам`
    case 'sewer-pipe':
      return `Длина труб канализации применена к ${affectedCount ?? 0} строкам`
    case 'water-points':
      return `Водорозетки применены к ${affectedCount ?? 0} строкам`
    case 'sewer-points':
      return `Выводы канализации применены к ${affectedCount ?? 0} строкам`
    case 'warm-floor':
      return `Площадь водяного тёплого пола применена к ${affectedCount ?? 0} строкам`
    case 'reset':
      return 'Сантехника сброшена'
  }
}
