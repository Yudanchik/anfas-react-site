import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'

import styles from './PricesSeoNote.module.scss'

type PricesSeoNoteProps = {
  text: string
  title?: string
}

export function PricesSeoNote({ text, title }: PricesSeoNoteProps) {
  return (
    <aside className={styles.note}>
      {title ? <strong className={styles.noteTitle}>{tieRussianShortWords(title)}</strong> : null}
      <p>{tieRussianShortWords(text)}</p>
    </aside>
  )
}
