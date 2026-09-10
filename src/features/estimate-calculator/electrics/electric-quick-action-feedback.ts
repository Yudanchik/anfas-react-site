import {
  isZonedEstimateLine,
  type ElectricWorkKind,
  type EstimateLine,
  type EstimateWorkKind,
} from '@/entities/estimate'

export function countElectricSocketTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) => !isZonedEstimateLine(line) && line.kind === 'finish-outlet' && line.unit === 'шт.',
  ).length
}

export function countElectricSwitchTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) =>
      !isZonedEstimateLine(line) &&
      (line.priceKey === 'finish-outlet-switch' ||
        line.priceKey === 'finish-switch-key' ||
        line.priceKey === 'finish-pass-through' ||
        line.priceKey === 'finish-dimmer') &&
      line.unit === 'шт.',
  ).length
}

export function countElectricLightTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) => (line.kind as ElectricWorkKind) === 'finish-light' && line.unit === 'шт.',
  ).length
}

export function countElectricCableTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) => (line.kind as EstimateWorkKind) === 'cable' && line.unit === 'м. пог.',
  ).length
}

export function countElectricStrobeTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) => (line.kind as EstimateWorkKind) === 'chase' && line.unit === 'м. пог.',
  ).length
}

export function countElectricWarmFloorTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) => (line.kind as EstimateWorkKind) === 'underfloor' && line.unit === 'м²',
  ).length
}

export type ElectricQuickActionKind =
  'sockets' | 'switches' | 'lights' | 'strobe' | 'cable' | 'warm-floor' | 'reset'

export function formatElectricQuickActionFeedback(
  kind: ElectricQuickActionKind,
  affectedCount?: number,
): string {
  switch (kind) {
    case 'sockets':
      return `Количество розеток применено к ${affectedCount ?? 0} строкам`
    case 'switches':
      return `Количество выключателей применено к ${affectedCount ?? 0} строкам`
    case 'lights':
      return `Световые точки применены к ${affectedCount ?? 0} строкам`
    case 'strobe':
      return `Длина штроб применена к ${affectedCount ?? 0} строкам`
    case 'cable':
      return `Длина кабеля применена к ${affectedCount ?? 0} строкам`
    case 'warm-floor':
      return `Площадь тёплого пола применена к ${affectedCount ?? 0} строкам`
    case 'reset':
      return 'Электрика сброшена'
  }
}
