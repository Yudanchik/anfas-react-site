export const ESTIMATE_ZONE_NAME_MAX_LENGTH = 48

export type EstimateZoneNameValidation =
  | { ok: true; value: string }
  | { ok: false; message: string }

/**
 * Название зоны для zoned clone («Кухня», «Комната 1», «С/у 2»).
 * Цифры допустимы; длина ограничена; emoji и служебные символы — нет.
 */
export function validateEstimateZoneName(raw: string): EstimateZoneNameValidation {
  const value = raw.trim().replace(/\s+/g, ' ')
  if (!value) {
    return { ok: false, message: 'Укажите зону, например: кухня' }
  }
  if (value.length > ESTIMATE_ZONE_NAME_MAX_LENGTH) {
    return {
      ok: false,
      message: `Название зоны слишком длинное (макс. ${ESTIMATE_ZONE_NAME_MAX_LENGTH} символов)`,
    }
  }
  // Буквы (любой скрипт), цифры, пробел, дефис, тире, слэш, точка, обратный слэш
  if (!/^[\p{L}\p{N}\s\-–—./\\]+$/u.test(value)) {
    return {
      ok: false,
      message: 'В названии зоны допустимы буквы, цифры, пробел, дефис и слэш',
    }
  }
  return { ok: true, value }
}
