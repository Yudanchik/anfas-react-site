const NBSP = '\u00a0'

const SHORT_WORD =
  '(?:в|во|к|ко|о|об|обо|у|с|со|на|за|из|от|до|по|при|для|без|над|под|про|и|а|но|да|же|ли|бы|не|ни|как|или|либо|это|то)'

const SHORT_WORD_RE = new RegExp(
  `(?<![^\\s(\\u2014${NBSP}])(${SHORT_WORD})[ \\t]+(?=\\S)`,
  'giu',
)

export function tieRussianShortWords(text: string) {
  if (!text) {
    return text
  }

  return text.replace(SHORT_WORD_RE, `$1${NBSP}`)
}
