import type {
  CeilingPriceMappingItem,
  ElectricPriceMappingItem,
  EstimateLine,
  EstimatePriceSource,
  EstimateWorkKind,
  FloorPriceMappingItem,
  PlumbingPriceMappingItem,
  TilePriceMappingItem,
  WallPriceMappingItem,
} from './estimate.types'
import type { PriceCategorySlug } from '../../../price/model/price.types'
import type { CreateZonedEstimateLineParams } from './estimate-zoned-line'
import { createZonedEstimateLine } from './estimate-zoned-line'
import { CEILING_PRICE_MAPPING, CEILING_SECTION_ID } from '../ceilings/ceiling-price.mapping'
import { ELECTRIC_PRICE_MAPPING, ELECTRIC_SECTION_ID } from '../electrics/electric-price.mapping'
import { FLOOR_PRICE_MAPPING, FLOOR_SECTION_ID } from '../floors/floor-price.mapping'
import { PLUMBING_PRICE_MAPPING, PLUMBING_SECTION_ID } from '../plumbing/plumbing-price.mapping'
import { TILE_PRICE_MAPPING, TILE_SECTION_ID } from '../tile/tile-price.mapping'
import { WALL_PRICE_MAPPING, WALL_SECTION_ID } from '../walls/wall-price.mapping'

export type EstimatePriceProfileSectionId =
  | typeof FLOOR_SECTION_ID
  | typeof WALL_SECTION_ID
  | typeof CEILING_SECTION_ID
  | typeof TILE_SECTION_ID
  | typeof ELECTRIC_SECTION_ID
  | typeof PLUMBING_SECTION_ID

export type EstimatePriceProfileItem = {
  workId: string
  sectionId: EstimatePriceProfileSectionId
  title: string
  unit: string
  unitPrice: number
  active: boolean
  comment?: string
}

export type EstimatePriceProfile = {
  id: string
  name: string
  source: 'builtin-anfas' | 'user-xlsx'
  createdAt: string
  contentHash: string
  items: readonly EstimatePriceProfileItem[]
}

/** Ссылка на прайс, сохранённая вместе со сметой (суммы документа от неё не зависят). */
export type EstimatePriceProfileRef = {
  id: string
  name: string
  source: 'builtin-anfas' | 'user-xlsx'
  contentHash: string
}

export type EstimatePriceProfileImportResult = {
  profile?: EstimatePriceProfile
  errors: readonly string[]
  warnings: readonly string[]
  changedCount: number
  inactiveCount: number
}

export type EstimatePriceProfileMappingItem =
  | FloorPriceMappingItem
  | WallPriceMappingItem
  | CeilingPriceMappingItem
  | TilePriceMappingItem
  | ElectricPriceMappingItem
  | PlumbingPriceMappingItem

export type ActiveEstimateMappings = {
  floors: readonly FloorPriceMappingItem[]
  walls: readonly WallPriceMappingItem[]
  ceilings: readonly CeilingPriceMappingItem[]
  tile: readonly TilePriceMappingItem[]
  electrics: readonly ElectricPriceMappingItem[]
  plumbing: readonly PlumbingPriceMappingItem[]
}

export type UnavailableMappingKey = {
  id: string
  title: string
  reason: 'missing' | 'inactive'
}

export type RecalculatePriceLinesOptions = {
  /** Перезаписывать строки с `priceEdited: true`. */
  overwriteCustom: boolean
}

type ProfileOverride = {
  title: string
  unitPrice: number
  active: boolean
  comment?: string
}

type MappingBase = {
  id: string
  title: string
  unit: string
  unitPrice: number
  defaultEnabled: boolean
  source: EstimatePriceSource
  kind: EstimateWorkKind
  frontendCategorySlug?: PriceCategorySlug
  note?: string
  profileActive?: boolean
}

export function isMappingItemAvailable(item: { profileActive?: boolean }): boolean {
  return item.profileActive !== false
}

export function countAvailableMappingItems(
  mapping: readonly { profileActive?: boolean }[],
): number {
  return mapping.reduce((count, item) => count + (isMappingItemAvailable(item) ? 1 : 0), 0)
}

export function countPriceEditedLines(lines: readonly EstimateLine[]): number {
  return lines.reduce(
    (count, line) => count + (line.source !== 'manual' && line.priceEdited ? 1 : 0),
    0,
  )
}

export function getUnavailableMappingKeys(
  keys: readonly string[],
  mapping: readonly EstimatePriceProfileMappingItem[],
): readonly UnavailableMappingKey[] {
  const byId = new Map(mapping.map((item) => [item.id, item]))
  const unavailable: UnavailableMappingKey[] = []
  for (const key of keys) {
    const item = byId.get(key)
    if (!item) {
      unavailable.push({ id: key, title: key, reason: 'missing' })
      continue
    }
    if (!isMappingItemAvailable(item)) {
      unavailable.push({ id: key, title: item.title, reason: 'inactive' })
    }
  }
  return unavailable
}

export function formatUnavailableScenarioMessage(
  unavailable: readonly UnavailableMappingKey[],
): string {
  if (unavailable.length === 0) return ''
  const names = unavailable.slice(0, 3).map((item) => `«${item.title}»`)
  const more = unavailable.length > 3 ? ` и ещё ${unavailable.length - 3}` : ''
  return `Сценарий недоступен: в активном прайсе выключены или отсутствуют работы ${names.join(', ')}${more}. Включите их в XLSX или выберите другой сценарий.`
}

export function buildActiveEstimateMappings(
  profile?: EstimatePriceProfile | null,
): ActiveEstimateMappings {
  return {
    floors: applyProfileToMapping(FLOOR_PRICE_MAPPING, FLOOR_SECTION_ID, profile),
    walls: applyProfileToMapping(WALL_PRICE_MAPPING, WALL_SECTION_ID, profile),
    ceilings: applyProfileToMapping(CEILING_PRICE_MAPPING, CEILING_SECTION_ID, profile),
    tile: applyProfileToMapping(TILE_PRICE_MAPPING, TILE_SECTION_ID, profile),
    electrics: applyProfileToMapping(ELECTRIC_PRICE_MAPPING, ELECTRIC_SECTION_ID, profile),
    plumbing: applyProfileToMapping(PLUMBING_PRICE_MAPPING, PLUMBING_SECTION_ID, profile),
  }
}

export function findActiveMappingItem<T extends EstimatePriceProfileMappingItem>(
  mapping: readonly T[],
  priceKey: string,
): T | undefined {
  return mapping.find((item) => item.id === priceKey && isMappingItemAvailable(item))
}

export function createZonedLineFromMapping<T extends MappingBase>(
  sectionId: EstimatePriceProfileSectionId,
  mapping: readonly T[],
  params: Pick<CreateZonedEstimateLineParams, 'quantity' | 'zoneName' | 'zoneId' | 'comment'> & {
    priceKey: string
  },
): EstimateLine | null {
  const item = mapping.find(
    (candidate) => candidate.id === params.priceKey && isMappingItemAvailable(candidate),
  )
  if (!item) return null

  return createZonedEstimateLine({
    sectionId,
    priceKey: item.id,
    title: item.title,
    unit: item.unit,
    unitPrice: item.unitPrice,
    kind: item.kind,
    quantity: params.quantity,
    zoneName: params.zoneName,
    zoneId: params.zoneId,
    comment: params.comment,
    source: item.source,
    frontendCategorySlug: item.frontendCategorySlug,
    note: item.note,
  })
}

/**
 * Обновляет title/price только у новых строк (по id), из активного mapping.
 * Уже существующие строки сметы не пересчитывает.
 */
export function syncNewLinesFromMapping<T extends MappingBase>(
  previousLines: readonly EstimateLine[],
  nextLines: readonly EstimateLine[],
  sectionId: EstimatePriceProfileSectionId,
  mapping: readonly T[],
): EstimateLine[] {
  const previousIds = new Set(previousLines.map((line) => line.id))
  const byId = new Map(mapping.map((item) => [item.id, item]))

  return nextLines.map((line) => {
    if (line.source === 'manual' || line.sectionId !== sectionId) return line
    if (previousIds.has(line.id)) return line
    const item = byId.get(line.priceKey)
    if (!item || !isMappingItemAvailable(item)) return line
    return {
      ...line,
      title: item.title,
      unit: item.unit,
      unitPrice: item.unitPrice,
      source: item.source,
      frontendCategorySlug: item.frontendCategorySlug,
      note: item.note,
      priceEdited: undefined,
    }
  })
}

/**
 * Явный пересчёт прайс-строк из активного mapping.
 * Ручные строки не трогает. `priceEdited` — только при overwriteCustom.
 */
export function recalculateSectionLinesFromMapping<T extends MappingBase>(
  lines: readonly EstimateLine[],
  sectionId: EstimatePriceProfileSectionId,
  mapping: readonly T[],
  options: RecalculatePriceLinesOptions,
): EstimateLine[] {
  const byId = new Map(mapping.map((item) => [item.id, item]))

  return lines.map((line) => {
    if (line.source === 'manual' || line.sectionId !== sectionId) return line
    if (line.priceEdited && !options.overwriteCustom) return line
    const item = byId.get(line.priceKey)
    if (!item) return line
    if (!isMappingItemAvailable(item)) {
      return { ...line, enabled: false }
    }
    return {
      ...line,
      title: item.title,
      unit: item.unit,
      unitPrice: item.unitPrice,
      source: item.source,
      frontendCategorySlug: item.frontendCategorySlug,
      note: item.note,
      priceEdited: undefined,
    }
  })
}

/** Подставляет цену/название активного прайса в canonical-строку при включении из каталога. */
export function applyActivePriceToCanonicalLine<T extends MappingBase>(
  line: EstimateLine,
  mapping: readonly T[],
): EstimateLine {
  if (line.source === 'manual' || line.priceEdited) return line
  const item = mapping.find(
    (candidate) => candidate.id === line.priceKey && isMappingItemAvailable(candidate),
  )
  if (!item) return line
  return {
    ...line,
    title: item.title,
    unit: item.unit,
    unitPrice: item.unitPrice,
    source: item.source,
    frontendCategorySlug: item.frontendCategorySlug,
    note: item.note,
  }
}

export function getPriceProfileRef(
  profile: EstimatePriceProfile | null | undefined,
): EstimatePriceProfileRef {
  if (!profile) return BUILTIN_PRICE_PROFILE_REF
  return {
    id: profile.id,
    name: profile.name,
    source: profile.source,
    contentHash: profile.contentHash,
  }
}

export const BUILTIN_PRICE_PROFILE_REF: EstimatePriceProfileRef = {
  id: 'builtin-anfas',
  name: 'Anfas, встроенный прайс',
  source: 'builtin-anfas',
  contentHash: hashBuiltinCatalog(),
}

function applyProfileToMapping<T extends MappingBase>(
  mapping: readonly T[],
  sectionId: EstimatePriceProfileSectionId,
  profile?: EstimatePriceProfile | null,
): T[] {
  if (!profile) return [...mapping]
  const overrides = buildOverrideMap(profile)

  return mapping.map((item) => {
    const override = overrides.get(profileKey(sectionId, item.id))
    if (!override) return item

    return {
      ...item,
      title: override.title,
      unitPrice: override.unitPrice,
      profileActive: override.active,
      source: 'pdf' as const,
      note: override.comment || item.note,
    }
  })
}

function buildOverrideMap(profile: EstimatePriceProfile): Map<string, ProfileOverride> {
  return new Map(
    profile.items.map((item) => [
      profileKey(item.sectionId, item.workId),
      {
        title: item.title,
        unitPrice: item.unitPrice,
        active: item.active,
        comment: item.comment,
      },
    ]),
  )
}

function profileKey(sectionId: string, workId: string): string {
  return `${sectionId}:${workId}`
}

function hashBuiltinCatalog(): string {
  const source = [
    ...FLOOR_PRICE_MAPPING,
    ...WALL_PRICE_MAPPING,
    ...CEILING_PRICE_MAPPING,
    ...TILE_PRICE_MAPPING,
    ...ELECTRIC_PRICE_MAPPING,
    ...PLUMBING_PRICE_MAPPING,
  ]
    .map((item) => `${item.id}:${item.title}:${item.unitPrice}`)
    .join('|')
  let hash = 0
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}
