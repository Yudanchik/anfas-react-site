import type { FloorRecommendation, FloorRecommendationLevel } from '../shared/estimate.types'

const SUGGESTIONS: Record<FloorRecommendationLevel, readonly string[]> = {
  'up-to-5': [
    'self-leveling-device',
    'self-leveling-primer',
    'self-leveling-dust-removal',
  ],
  '5-to-20': [
    'self-leveling-prep',
    'self-leveling-grind',
    'self-leveling-dust-removal',
    'self-leveling-primer',
    'self-leveling-device',
  ],
  '20-to-50': [
    'semidry-screed-up-to-80',
    'wet-screed-up-to-50',
    'self-leveling-device',
  ],
  'over-50': [
    'semidry-screed-over-80',
    'wet-screed-50-to-80',
    'wet-screed-over-80',
    'self-leveling-device',
  ],
}

const MESSAGES: Record<FloorRecommendationLevel, string> = {
  'up-to-5':
    'Перепад до 5 мм: обычно достаточно локальной подготовки и тонкого наливного пола. Включайте строки вручную.',
  '5-to-20':
    'Перепад 5–20 мм: финишное выравнивание наливным по подготовленному основанию. Стяжка не обязательна — решает сметчик.',
  '20-to-50':
    'Перепад 20–50 мм: рассмотрите полусухую стяжку до 80 мм или мокрую до 50 мм, при необходимости плюс наливной.',
  'over-50':
    'Перепад больше 50 мм: нужна стяжка большей толщины (полусухая свыше 80 мм / мокрая 50–80 или свыше 80 мм). Не выбирается автоматически.',
}

/**
 * Текст и suggested `priceKey` по среднему перепаду пола (мм).
 * Строки сметы сам не включает — сметчик применяет подсказку вручную или через сценарий.
 */
export function getFloorRecommendation(avgDeltaMm: number): FloorRecommendation {
  const delta = Number.isFinite(avgDeltaMm) && avgDeltaMm > 0 ? avgDeltaMm : 0
  const level = resolveLevel(delta)

  return {
    level,
    avgDeltaMm: delta,
    message: MESSAGES[level],
    suggestedPriceKeys: SUGGESTIONS[level],
  }
}

function resolveLevel(avgDeltaMm: number): FloorRecommendationLevel {
  if (avgDeltaMm <= 5) return 'up-to-5'
  if (avgDeltaMm <= 20) return '5-to-20'
  if (avgDeltaMm <= 50) return '20-to-50'
  return 'over-50'
}
