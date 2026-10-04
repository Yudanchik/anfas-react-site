import type { EstimateLine, EstimateZone } from '@/entities/estimate'
import type { RoomSection } from './room-quick-fill'
import {
  ALL_SCENARIO_ROOMS,
  getRoomScenarioStatus,
  scenarioMeasureSignature,
} from './room-scenario-status'

type Result = { label: string; addedCount: number; error?: string }

/** Каждый проход использует замеры своей комнаты; результаты записываются одним обновлением зон. */
export function useRoomScenarioBatch({
  section,
  zones,
  lines,
  targetId,
  check,
  apply,
  onZonesChange,
  setSuccess,
  setError,
}: {
  section: RoomSection
  zones: readonly EstimateZone[]
  lines: readonly EstimateLine[]
  targetId: string
  check: (zone: EstimateZone) => { ok: boolean; message?: string }
  apply: (zone: EstimateZone) => Result
  onZonesChange?: (zones: EstimateZone[]) => void
  setSuccess: (message: string) => void
  setError: (message: string) => void
}) {
  const all = targetId === ALL_SCENARIO_ROOMS
  const targets = all ? zones : zones.filter((zone) => zone.id === targetId)
  const evaluations = targets.map((zone) => ({ zone, check: check(zone) }))
  const ready = evaluations.filter((entry) => entry.check.ok)
  const excluded = evaluations.filter((entry) => !entry.check.ok)
  const rooms = zones.map((zone) => ({ zone, ...getRoomScenarioStatus(section, zone, lines) }))
  return {
    all,
    rooms,
    ready,
    excluded,
    canApply: ready.length > 0,
    applyLabel: all
      ? `Добавить работы для ${ready.length} из ${zones.length} помещений`
      : 'Добавить работы в смету',
    apply() {
      if (!ready.length) {
        setError('Нет помещений с нужными замерами для этого сценария.')
        return false
      }
      const records = new Map<string, NonNullable<EstimateZone['scenarioStatuses']>[RoomSection]>()
      const errors: string[] = []
      for (const { zone } of ready) {
        const result = apply(zone)
        if (result.error || result.addedCount === 0) {
          errors.push(`${zone.name}: ${result.error ?? 'нет добавленных работ'}`)
          continue
        }
        records.set(zone.id, {
          label: result.label,
          measureSignature: scenarioMeasureSignature(section, zone),
        })
      }
      if (records.size && onZonesChange)
        onZonesChange(
          zones.map((zone) =>
            records.has(zone.id)
              ? {
                  ...zone,
                  scenarioStatuses: { ...zone.scenarioStatuses, [section]: records.get(zone.id) },
                }
              : zone,
          ),
        )
      const message = `Работы добавлены для ${records.size} из ${targets.length} помещений.${excluded.length ? ` Пропущены: ${excluded.map(({ zone, check }) => `${zone.name} — ${check.message}`).join('; ')}.` : ''}${errors.length ? ` Ошибки: ${errors.join('; ')}.` : ''}`
      if (records.size) setSuccess(message)
      else setError(message)
      return records.size > 0 && errors.length === 0
    },
  }
}
