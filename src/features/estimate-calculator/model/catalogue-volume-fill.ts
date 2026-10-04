import {
  FLOOR_PRICE_MAPPING,
  WALL_PRICE_MAPPING,
  CEILING_PRICE_MAPPING,
  TILE_PRICE_MAPPING,
  ELECTRIC_PRICE_MAPPING,
  PLUMBING_PRICE_MAPPING,
  type EstimateLine,
  type EstimateZone,
} from '@/entities/estimate'
import type { RoomSection } from './room-quick-fill'
import { suggestRoomWorkQuantity, type RoomFillChange } from './room-work-quantity'

export function unifiedCatalogueTargets(
  section: RoomSection,
  zone: EstimateZone,
  lines: readonly EstimateLine[],
) {
  return lines.flatMap((line) => {
    if (
      line.sectionId !== section ||
      line.enabled ||
      line.zoneId ||
      line.zoneName ||
      line.source === 'manual' ||
      line.quantityEdited ||
      (line.quantity !== 0 && line.quantity !== line.catalogueAutoQuantity)
    )
      return []
    const suggestion = suggestRoomWorkQuantity(section, zone, {
      id: line.priceKey,
      unit: line.unit,
    })
    return suggestion.quantity > 0 && suggestion.quantity !== line.quantity
      ? [{ line, quantity: suggestion.quantity }]
      : []
  })
}

export function applyUnifiedCatalogueFill(
  lines: readonly EstimateLine[],
  changes: readonly RoomFillChange[],
) {
  const values = new Map(changes.map((change) => [change.id, change.quantity]))
  return lines.map((line) => {
    const quantity = values.get(line.id)
    if (
      quantity === undefined ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      line.enabled ||
      line.zoneId ||
      line.zoneName ||
      line.source === 'manual' ||
      line.quantityEdited ||
      (line.quantity !== 0 && line.quantity !== line.catalogueAutoQuantity)
    )
      return line
    return { ...line, quantity, catalogueAutoQuantity: quantity }
  })
}

type Measure = {
  id: keyof EstimateZone
  label: string
  from: string
  unit: 'area' | 'length' | 'count'
}
const MAPPINGS = {
  floors: FLOOR_PRICE_MAPPING,
  walls: WALL_PRICE_MAPPING,
  ceilings: CEILING_PRICE_MAPPING,
  tile: TILE_PRICE_MAPPING,
  electrics: ELECTRIC_PRICE_MAPPING,
  plumbing: PLUMBING_PRICE_MAPPING,
}
export const CATALOGUE_MEASURES: Record<RoomSection, readonly Measure[]> = {
  floors: [
    { id: 'floorArea', label: 'Площадь пола', from: 'totalFloorArea', unit: 'area' },
    { id: 'demolitionFloorArea', label: 'Демонтаж пола', from: 'demolitionArea', unit: 'area' },
    { id: 'screedArea', label: 'Площадь стяжки', from: 'screedArea', unit: 'area' },
    { id: 'wetArea', label: 'Площадь гидроизоляции', from: 'wetZonesArea', unit: 'area' },
  ],
  walls: [
    { id: 'wallArea', label: 'Площадь стен', from: 'totalWallArea', unit: 'area' },
    { id: 'demolitionWallArea', label: 'Демонтаж стен', from: 'demolitionArea', unit: 'area' },
    { id: 'plasterArea', label: 'Площадь штукатурки', from: 'plasterArea', unit: 'area' },
    { id: 'puttyArea', label: 'Площадь шпаклёвки', from: 'puttyArea', unit: 'area' },
    { id: 'finishArea', label: 'Площадь финиша', from: 'finishArea', unit: 'area' },
    { id: 'slopesLength', label: 'Откосы', from: 'slopesLengthM', unit: 'length' },
    { id: 'cornersLength', label: 'Углы', from: 'cornersLengthM', unit: 'length' },
  ],
  ceilings: [
    { id: 'ceilingArea', label: 'Площадь потолка', from: 'totalCeilingArea', unit: 'area' },
    {
      id: 'demolitionCeilingArea',
      label: 'Демонтаж потолка',
      from: 'demolitionArea',
      unit: 'area',
    },
    { id: 'plasterCeilingArea', label: 'Площадь штукатурки', from: 'plasterArea', unit: 'area' },
    { id: 'puttyCeilingArea', label: 'Площадь шпаклёвки', from: 'puttyArea', unit: 'area' },
    { id: 'finishCeilingArea', label: 'Площадь финиша', from: 'finishArea', unit: 'area' },
  ],
  tile: [
    { id: 'tileFloorArea', label: 'Площадь плитки пола', from: 'floorTileArea', unit: 'area' },
    { id: 'tileWallArea', label: 'Площадь плитки стен', from: 'wallTileArea', unit: 'area' },
    { id: 'tileCuttingLength', label: 'Подрезка', from: 'cuttingLength', unit: 'length' },
    { id: 'tileCornerLength', label: 'Углы', from: 'cornerLength', unit: 'length' },
    { id: 'tileHolesCount', label: 'Отверстия', from: 'holesCount', unit: 'count' },
  ],
  electrics: [
    {
      id: 'electricCableLength',
      label: 'Кабель — весь метраж',
      from: 'electricCableLength',
      unit: 'length',
    },
    {
      id: 'electricCableOpenLength',
      label: 'Кабель открыто',
      from: 'electricCableLength',
      unit: 'length',
    },
    {
      id: 'electricCableChaseLength',
      label: 'Кабель в штробе',
      from: 'electricCableLength',
      unit: 'length',
    },
    {
      id: 'electricStrobeLength',
      label: 'Новые штробы',
      from: 'electricStrobeLength',
      unit: 'length',
    },
    {
      id: 'electricSocketBoxesCount',
      label: 'Подрозетники',
      from: 'electricSocketBoxesCount',
      unit: 'count',
    },
    { id: 'electricSocketsCount', label: 'Розетки', from: 'electricSocketsCount', unit: 'count' },
    {
      id: 'electricLightPointsCount',
      label: 'Световые точки',
      from: 'electricLightPointsCount',
      unit: 'count',
    },
  ],
  plumbing: [
    {
      id: 'plumbingWaterPipeLength',
      label: 'Трубы воды',
      from: 'plumbingWaterPipeLength',
      unit: 'length',
    },
    {
      id: 'plumbingSewerPipeLength',
      label: 'Трубы канализации',
      from: 'plumbingSewerPipeLength',
      unit: 'length',
    },
    {
      id: 'plumbingWaterPointsCount',
      label: 'Выводы воды',
      from: 'plumbingWaterPointsCount',
      unit: 'count',
    },
    {
      id: 'plumbingSewerPointsCount',
      label: 'Выводы канализации',
      from: 'plumbingSewerPointsCount',
      unit: 'count',
    },
    { id: 'plumbingSinksCount', label: 'Раковины', from: 'plumbingSinksCount', unit: 'count' },
    { id: 'plumbingToiletsCount', label: 'Унитазы', from: 'plumbingToiletsCount', unit: 'count' },
  ],
}

export function catalogueVolumeTargets(
  section: RoomSection,
  zone: EstimateZone,
  measureId: string,
  lines: readonly EstimateLine[],
) {
  const measure = CATALOGUE_MEASURES[section].find((entry) => entry.id === measureId)
  const quantity = measure ? zone[measure.id] : undefined
  if (!measure || typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity <= 0)
    return []
  const keys = new Set(
    MAPPINGS[section]
      .filter(
        (item) =>
          item.defaultQuantityFrom === measure.from ||
          (section === 'electrics' &&
            measure.unit === 'length' &&
            item.defaultQuantityFrom === 'electricCableLength'),
      )
      .map((item) => item.id),
  )
  const unitMatches = (unit: string) =>
    measure.unit === 'area'
      ? unit === 'м²'
      : measure.unit === 'length'
        ? ['м. пог.', 'м', 'пог. м'].includes(unit)
        : ['шт.', 'точка'].includes(unit)
  return lines
    .filter(
      (line) =>
        line.sectionId === section &&
        !line.zoneId &&
        !line.zoneName &&
        line.source !== 'manual' &&
        keys.has(line.priceKey) &&
        unitMatches(line.unit),
    )
    .map((line) => ({ line, quantity }))
}
