import type { EstimateLine } from '../shared/estimate.types'
import type { EstimateZone } from '../shared/estimate-zone'
import { resolveWallScenarioKeys } from './apply-wall-scenario'

export type WallScenarioProgress = 'pending' | 'applied' | 'review' | 'unknown'

/** Только объёмы, от которых зависит количество строк сценария стен. */
export function wallScenarioMeasureSignature(zone: EstimateZone): string {
  return [zone.wallArea, zone.demolitionWallArea, zone.plasterArea, zone.puttyArea,
    zone.finishArea, zone.slopesLength, ...(zone.gklWallSeamsLength ? [zone.gklWallSeamsLength] : [])].join('|')
}

export function getWallScenarioProgress(
  zone: EstimateZone,
  lines: readonly EstimateLine[],
): WallScenarioProgress {
  const saved = zone.wallScenario
  if (!saved) {
    return lines.some((line) => line.zoneId === zone.id && line.enabled) ? 'unknown' : 'pending'
  }
  if (saved.measureSignature !== wallScenarioMeasureSignature(zone)) return 'review'
  const keys = new Set((saved.applications ?? [saved.application]).flatMap((application) =>
    resolveWallScenarioKeys(application)))
  const hasActiveScenarioLine = lines.some((line) =>
    line.zoneId === zone.id && line.enabled && keys.has(line.priceKey),
  )
  return hasActiveScenarioLine ? 'applied' : 'review'
}
