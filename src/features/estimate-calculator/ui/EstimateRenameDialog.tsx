import { useEffect, useId, useRef, type FormEvent } from 'react'
import styles from './EstimateRenameDialog.module.scss'
type Props = {
  title: string
  busy: boolean
  error: string
  onSave: (title: string) => void
  onCancel: () => void
}
export function EstimateRenameDialog({ title, busy, error, onSave, onCancel }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const titleId = useId()
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    input.current?.select()
    return () => element?.close()
  }, [])
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!busy) onSave(String(new FormData(event.currentTarget).get('title') ?? '').trim())
  }
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onCancel()
      }}
    >
      <form onSubmit={submit}>
        <h2 id={titleId}>Название сметы</h2>
        <label className={styles.field}>
          Новое название
          <input
            ref={input}
            name="title"
            defaultValue={title}
            maxLength={120}
            required
            disabled={busy}
          />
        </label>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} disabled={busy} onClick={onCancel}>
            Отмена
          </button>
          <button type="submit" className={styles.primary} disabled={busy}>
            {busy ? 'Сохраняем…' : 'Сохранить название'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
