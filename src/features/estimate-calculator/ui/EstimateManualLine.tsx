import { useState, type FormEvent } from 'react'

import styles from './EstimateManualLine.module.scss'

type EstimateManualLineProps = {
  titleId?: string
  onAdd: (params: { title: string; unit: string; unitPrice: number; quantity: number }) => void
}

function parseNumberInput(raw: string): number {
  const normalized = raw.replace(',', '.').trim()
  if (normalized === '') return 0
  const value = Number(normalized)
  return Number.isFinite(value) ? value : 0
}

export function EstimateManualLine({
  titleId = 'estimate-manual-title',
  onAdd,
}: EstimateManualLineProps) {
  const [title, setTitle] = useState('')
  const [unit, setUnit] = useState('м²')
  const [unitPrice, setUnitPrice] = useState(0)
  const [quantity, setQuantity] = useState(0)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) {
      setError('Укажите название ручной работы')
      return
    }
    setError(null)
    onAdd({ title, unit, unitPrice, quantity })
    setTitle('')
    setUnit('м²')
    setUnitPrice(0)
    setQuantity(0)
  }

  return (
    <section className={styles.wrap} aria-labelledby={titleId}>
      <h2 className={styles.title} id={titleId}>
        Ручная строка
      </h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          <span>Работа</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          <span>Ед.</span>
          <input value={unit} onChange={(event) => setUnit(event.target.value)} />
        </label>
        <label>
          <span>Объём</span>
          <input
            type="number"
            min={0}
            step="any"
            value={quantity}
            onChange={(event) => setQuantity(parseNumberInput(event.target.value))}
          />
        </label>
        <label>
          <span>Цена</span>
          <input
            type="number"
            min={0}
            step="any"
            value={unitPrice}
            onChange={(event) => setUnitPrice(parseNumberInput(event.target.value))}
          />
        </label>
        <button type="submit">Добавить строку</button>
      </form>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}
