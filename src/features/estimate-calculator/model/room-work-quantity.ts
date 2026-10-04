import { createZonedEstimateLine, type EstimateLine, type EstimateZone } from '@/entities/estimate'
import { getRoomQuickFill, type RoomSection } from './room-quick-fill'

export type TileMeasureSurface = 'floor' | 'walls' | 'backsplash' | 'both'
export type QuantitySuggestion = { quantity: number; reason: string; family?: string }

/** Возвращает только однозначный замер для известной позиции и совпадающей единицы. */
export function suggestRoomWorkQuantity(
  section: RoomSection,
  zone: EstimateZone | undefined,
  work: { id: string; unit: string } | undefined,
  tileSurface?: TileMeasureSurface,
): QuantitySuggestion {
  if (!zone || !work) return { quantity: 0, reason: 'Выберите помещение и работу.' }
  const key = work.id
  if (section === 'plumbing' && key.startsWith('demolition-')) {
    const oldFields: Record<string, number | undefined> = {
      'demolition-toilet': zone.plumbingOldToiletsCount,
      'demolition-sink': zone.plumbingOldSinksCount,
      'demolition-bath': zone.plumbingOldBathtubsCount,
      'demolition-mixer': zone.plumbingOldMixersCount,
    }
    if (key in oldFields && oldFields[key] === undefined)
      return { quantity: 0, reason: 'Заполните отдельное количество старых приборов.' }
  }
  const split =
    zone.electricCableOpenLength !== undefined || zone.electricCableChaseLength !== undefined
  const cable = section === 'electrics' && key.startsWith('cable-')
  if (cable && split && !/^cable-(open|chase)-/.test(key))
    return {
      quantity: 0,
      reason:
        'Для этого способа прокладки нужен отдельный метраж; открытый кабель и кабель в штробе сюда автоматически не переносятся.',
    }
  if (section === 'tile' && /^(clad|prep|grout|surcharge)-/.test(key) && !tileSurface)
    return { quantity: 0, reason: 'Выберите поверхность: пол, стены или фартук.' }
  const mock = {
    id: 'suggestion',
    priceKey: key,
    sectionId: section,
    zoneId: zone.id,
    unit: work.unit,
    source: 'pdf',
    enabled: true,
    quantity: -1,
  } as EstimateLine
  const quantity = getRoomQuickFill(section, zone, [mock], { tileSurface })[0]?.quantity ?? 0
  return {
    quantity,
    reason:
      quantity > 0
        ? `Замер помещения «${zone.name}»: ${quantity} ${work.unit}.`
        : 'Нет подходящего положительного замера. Укажите объём вручную или заполните замеры.',
    family: cable
      ? split
        ? key.startsWith('cable-open-')
          ? 'cable:open'
          : 'cable:chase'
        : 'cable:total'
      : undefined,
  }
}

export type RoomFillChange = { id: string; quantity: number }
export function buildRoomWorkFillPlan(
  section: RoomSection,
  zone: EstimateZone,
  lines: readonly EstimateLine[],
  selectedIds: ReadonlySet<string>,
  tileSurface?: TileMeasureSurface,
) {
  const changes: RoomFillChange[] = []
  const skipped: string[] = []
  const families = new Map<string, string[]>()
  const chosen = lines.filter(
    (line) =>
      selectedIds.has(line.id) &&
      line.enabled &&
      line.sectionId === section &&
      line.source !== 'manual' &&
      (!line.zoneId || line.zoneId === zone.id),
  )
  for (const line of chosen) {
    const duplicates = lines.filter(
      (other) =>
        other.id !== line.id &&
        other.zoneId === zone.id &&
        other.priceKey === line.priceKey &&
        other.enabled &&
        other.source !== 'manual',
    )
    if (duplicates.length) {
      skipped.push(
        `${line.title}: уже есть другая строка этой работы в помещении; проверьте дубли.`,
      )
      continue
    }
    const suggestion = suggestRoomWorkQuantity(
      section,
      zone,
      { id: line.priceKey, unit: line.unit },
      tileSurface,
    )
    if (!suggestion.quantity) {
      skipped.push(`${line.title}: ${suggestion.reason}`)
      continue
    }
    if (suggestion.family)
      families.set(suggestion.family, [...(families.get(suggestion.family) ?? []), line.title])
    if (line.quantity !== suggestion.quantity || !line.zoneId)
      changes.push({ id: line.id, quantity: suggestion.quantity })
  }
  const conflicts = [...families.values()]
    .filter((titles) => titles.length > 1)
    .map(
      (titles) =>
        `Один метраж кабеля выбран для нескольких работ: ${titles.join('; ')}. Оставьте одну позицию или разделите объёмы вручную.`,
    )
  return { changes, skipped, conflicts }
}

/** Общие выбранные позиции становятся строками помещения, сохраняя цену и комментарий. */
export function applyRoomWorkFill(
  lines: readonly EstimateLine[],
  zone: EstimateZone,
  changes: readonly RoomFillChange[],
): EstimateLine[] {
  let next = [...lines]
  for (const change of changes) {
    const line = next.find((entry) => entry.id === change.id)
    if (
      !line ||
      !line.enabled ||
      line.source === 'manual' ||
      (line.zoneId && line.zoneId !== zone.id) ||
      change.quantity <= 0
    )
      continue
    if (line.zoneId)
      next = next.map((entry) =>
        entry.id === line.id ? { ...entry, quantity: change.quantity } : entry,
      )
    else {
      if (
        next.some(
          (entry) => entry.zoneId === zone.id && entry.priceKey === line.priceKey && entry.enabled,
        )
      )
        continue
      const clone = createZonedEstimateLine({
        ...line,
        sectionId: line.sectionId,
        quantity: change.quantity,
        zoneId: zone.id,
        zoneName: zone.name,
      })
      const disabled = next.find(
        (entry) =>
          entry.zoneId === zone.id &&
          entry.priceKey === line.priceKey &&
          !entry.enabled &&
          entry.source !== 'manual',
      )
      next = next.map((entry) =>
        entry.id === line.id
          ? { ...entry, enabled: false }
          : entry.id === disabled?.id
            ? { ...clone, id: disabled.id }
            : entry,
      )
      if (!disabled) next.push(clone)
    }
  }
  return next
}
