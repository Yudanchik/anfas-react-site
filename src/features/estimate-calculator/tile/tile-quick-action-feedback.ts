import type { EstimateLine, EstimateWorkKind, TileWorkKind } from '@/entities/estimate'

const PREP_KINDS: readonly TileWorkKind[] = ['prep']
const CLADDING_KINDS: readonly TileWorkKind[] = ['cladding']
const GROUT_KINDS: readonly TileWorkKind[] = ['grout']

export function countTileCladAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) =>
      ((PREP_KINDS as readonly EstimateWorkKind[]).includes(line.kind) ||
        (CLADDING_KINDS as readonly EstimateWorkKind[]).includes(line.kind) ||
        (GROUT_KINDS as readonly EstimateWorkKind[]).includes(line.kind)) &&
      line.unit === 'м²' &&
      line.kind !== 'demolition',
  ).length
}

export function countTileFloorAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter((line) => line.priceKey === 'demolition-floor-tile' && line.unit === 'м²')
    .length
}

export function countTileWallAreaTargets(lines: readonly EstimateLine[]): number {
  return lines.filter((line) => line.priceKey === 'demolition-wall-tile' && line.unit === 'м²')
    .length
}

export function countTileCuttingLengthTargets(lines: readonly EstimateLine[]): number {
  return lines.filter((line) => line.unit === 'м. пог.' && line.source !== 'manual').length
}

export function countTileHolesCountTargets(lines: readonly EstimateLine[]): number {
  return lines.filter(
    (line) =>
      (line.priceKey === 'hole-up-to-100' ||
        line.priceKey === 'hole-100-230' ||
        line.priceKey === 'hole-rect') &&
      line.unit === 'шт.',
  ).length
}

export type TileQuickActionKind =
  | 'clad-area'
  | 'floor-area'
  | 'wall-area'
  | 'cutting-length'
  | 'holes-count'
  | 'reset'

export function formatTileQuickActionFeedback(
  kind: TileQuickActionKind,
  affectedCount?: number,
): string {
  switch (kind) {
    case 'clad-area':
      return `Площадь облицовки применена к ${affectedCount ?? 0} строкам`
    case 'floor-area':
      return `Площадь плитки пола применена к ${affectedCount ?? 0} строкам`
    case 'wall-area':
      return `Площадь плитки стен применена к ${affectedCount ?? 0} строкам`
    case 'cutting-length':
      return `Длина подрезки применена к ${affectedCount ?? 0} строкам`
    case 'holes-count':
      return `Количество отверстий применено к ${affectedCount ?? 0} строкам`
    case 'reset':
      return 'Плитка сброшена'
  }
}
