import { useState } from 'react'
import type { EstimateZone } from '@/entities/estimate'
import type { RoomSection } from './room-quick-fill'
import { suggestRoomWorkQuantity, type TileMeasureSurface } from './room-work-quantity'

export function useRoomWorkQuantity(
  section: RoomSection,
  zone: EstimateZone | undefined,
  work: { id: string; unit: string } | undefined,
  surface?: TileMeasureSurface,
) {
  const context = `${zone?.id ?? ''}:${work?.id ?? ''}:${work?.unit ?? ''}:${surface ?? ''}`
  const [draft, setDraft] = useState<{ context: string; value: number } | null>(null)
  const suggestion = suggestRoomWorkQuantity(section, zone, work, surface)
  return {
    quantity: draft?.context === context ? draft.value : suggestion.quantity,
    setQuantity: (value: number) =>
      setDraft(value === suggestion.quantity ? null : { context, value }),
    resetQuantity: () => setDraft(null),
    useMeasure: () => setDraft(null),
    suggestion,
  }
}
