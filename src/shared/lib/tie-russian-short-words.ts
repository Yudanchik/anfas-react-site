const NBSP = '\u00A0'

/** Короткие предлоги, союзы, частицы: пробел после них заменяется на NBSP. */
const SHORT_WORD =
  '(?:в|во|к|ко|о|об|обо|у|с|со|на|за|из|от|до|по|при|для|без|над|под|про|и|а|но|да|же|ли|бы|не|ни|как|или|либо|это|то)'

/**
 * Подтягивает к следующему слову короткие слова, чтобы они не оставались в конце строки.
 * Пример: «в Московском» -> «в» + NBSP + «Московском».
 */
const tieRussianShortWords = (text: string): string => {
  if (!text) return text

  const re = new RegExp(`(^|[\\s(\\u2014${NBSP}])(${SHORT_WORD})\\s+`, 'giu')
  return text.replace(re, (_, prefix: string, word: string) => `${prefix}${word}${NBSP}`)
}

export default tieRussianShortWords
