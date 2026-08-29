import { useEffect, useRef, useState, type FormEvent } from 'react'

import { validateManualEstimateLineInput } from '../model/validate-manual-estimate-line'
import { EstimateNumberInput } from './EstimateNumberInput'
import styles from './EstimateManualLine.module.scss'

type EstimateManualLineProps = {
  titleId?: string
  /** Без своей рамки/заголовка — внутри панели «Строки сметы». */
  embedded?: boolean
  onAdd: (params: { title: string; unit: string; unitPrice: number; quantity: number }) => void
}

type StatusKind = 'success' | 'error'

type StatusState = {
  kind: StatusKind
  message: string
}

const SUCCESS_CLEAR_MS = 4500

export function EstimateManualLine({
  titleId = 'estimate-manual-title',
  embedded = false,
  onAdd,
}: EstimateManualLineProps) {
  const [title, setTitle] = useState('')
  const [unit, setUnit] = useState('м²')
  const [unitPrice, setUnitPrice] = useState(0)
  const [quantity, setQuantity] = useState(0)
  const [status, setStatus] = useState<StatusState | null>(null)
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current)
    }
  }, [])

  function setError(message: string) {
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }
    setStatus({ kind: 'error', message })
  }

  function setSuccess(message: string) {
    if (successTimerRef.current) clearTimeout(successTimerRef.current)
    setStatus({ kind: 'success', message })
    successTimerRef.current = setTimeout(() => {
      setStatus((prev) => (prev?.kind === 'success' ? null : prev))
      successTimerRef.current = null
    }, SUCCESS_CLEAR_MS)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validated = validateManualEstimateLineInput({ title, quantity, unitPrice })
    if (!validated.ok) {
      setError(validated.message)
      return
    }

    const trimmedTitle = title.trim()
    onAdd({ title: trimmedTitle, unit, unitPrice, quantity })
    setSuccess(
      `Ручная строка добавлена: ${trimmedTitle}, объём: ${quantity} ${unit.trim() || 'м²'}`,
    )
    setTitle('')
    setUnit('м²')
    setUnitPrice(0)
    setQuantity(0)
  }

  return (
    <section
      className={embedded ? styles.embedded : styles.wrap}
      aria-labelledby={embedded ? undefined : titleId}
    >
      {embedded ? null : (
        <h2 className={styles.title} id={titleId}>
          Ручная строка
        </h2>
      )}
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          <span>Работа</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          <span>Ед.</span>
          <input value={unit} onChange={(event) => setUnit(event.target.value)} />
        </label>
        <div>
          <label htmlFor={`${titleId}-quantity`}>Объём</label>
          <EstimateNumberInput
            id={`${titleId}-quantity`}
            value={quantity}
            onValueChange={setQuantity}
          />
        </div>
        <div>
          <label htmlFor={`${titleId}-unit-price`}>Цена</label>
          <EstimateNumberInput
            id={`${titleId}-unit-price`}
            value={unitPrice}
            onValueChange={setUnitPrice}
          />
        </div>
        <button type="submit">Добавить строку</button>
      </form>
      {status ? (
        <p className={styles.status} data-kind={status.kind} role="status" aria-live="polite">
          {status.message}
        </p>
      ) : null}
    </section>
  )
}
