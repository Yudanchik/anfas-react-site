import type { EstimateZone } from '@/entities/estimate'

export type RoomSection = NonNullable<EstimateZone['excludedSections']>[number]
export const ROOM_SECTIONS: readonly RoomSection[] = [
  'floors',
  'walls',
  'ceilings',
  'tile',
  'electrics',
  'plumbing',
]

export function parseExcludedSections(raw: unknown): RoomSection[] {
  return Array.isArray(raw) ? ROOM_SECTIONS.filter((section) => raw.includes(section)) : []
}

export function sectionRooms(zones: readonly EstimateZone[], section: RoomSection): EstimateZone[] {
  return zones.filter((zone) => !zone.excludedSections?.includes(section))
}

/** Редактор раздела передаёт только участвующие комнаты. Остальные сохраняются. */
export function mergeSectionRooms(
  all: readonly EstimateZone[],
  edited: readonly EstimateZone[],
): EstimateZone[] {
  const updates = new Map(edited.map((zone) => [zone.id, zone]))
  const known = new Set(all.map((zone) => zone.id))
  return [
    ...all.map((zone) => updates.get(zone.id) ?? zone),
    ...edited.filter((zone) => !known.has(zone.id)),
  ]
}

export function setRoomParticipation(
  zone: EstimateZone,
  section: RoomSection,
  included: boolean,
): EstimateZone {
  const excludedSections = new Set(zone.excludedSections)
  if (included) excludedSections.delete(section)
  else excludedSections.add(section)
  if (included) return { ...zone, excludedSections: [...excludedSections] }
  const scenarioStatuses = { ...zone.scenarioStatuses }
  delete scenarioStatuses[section]
  return {
    ...zone,
    excludedSections: [...excludedSections],
    scenarioStatuses,
    ...(section === 'walls' ? { wallScenario: undefined } : {}),
  }
}
