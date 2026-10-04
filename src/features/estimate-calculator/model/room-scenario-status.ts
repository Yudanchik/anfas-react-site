import type { EstimateLine, EstimateZone } from '@/entities/estimate'
import type { RoomSection } from './room-quick-fill'

export const ALL_SCENARIO_ROOMS = '__all__'

export function scenarioMeasureSignature(section: RoomSection, zone: EstimateZone) {
  const fields = Object.entries(zone).filter(([key, value]) => {
    if (typeof value !== 'number') return false
    if ((key === 'gklWallSeamsLength' || key === 'gklCeilingSeamsLength') && value === 0) return false
    if (section === 'floors')
      return ['floorArea', 'demolitionFloorArea', 'screedArea', 'wetArea'].includes(key)
    if (section === 'ceilings') return key.toLowerCase().includes('ceiling')
    if (section === 'walls')
      return (
        key.toLowerCase().includes('wall') ||
        ['plasterArea', 'puttyArea', 'finishArea', 'slopesLength', 'cornersLength'].includes(key)
      )
    return key.startsWith(section === 'electrics' ? 'electric' : section)
  })
  return JSON.stringify([
    zone.zoneType,
    fields.sort(([a], [b]) => a.localeCompare(b)),
    ...(section === 'plumbing' ? [zone.plumbingToiletMount ?? 'unknown'] : []),
  ])
}

export function getRoomScenarioStatus(
  section: RoomSection,
  zone: EstimateZone,
  lines: readonly EstimateLine[],
) {
  const record = zone.scenarioStatuses?.[section]
  const hasWorks = lines.some(
    (line) =>
      line.sectionId === section && line.zoneId === zone.id && line.enabled && line.quantity > 0,
  )
  if (!record)
    return {
      applied: false,
      text: hasWorks ? 'Работы есть · сценарий ещё не применён' : 'Сценарий ещё не применён',
    }
  if (!hasWorks) return { applied: false, text: `${record.label} · строки удалены или выключены` }
  if (record.measureSignature !== scenarioMeasureSignature(section, zone))
    return { applied: false, text: `${record.label} · замеры изменились, примените заново` }
  return { applied: true, text: `Применён: ${record.label}` }
}
