import type { FloorEstimateInput } from '@/entities/estimate'

import styles from './FloorEstimateInputs.module.scss'

type FloorEstimateInputsProps = {
  input: FloorEstimateInput
  onChange: (patch: Partial<FloorEstimateInput>) => void
}

function parseNumberInput(raw: string): number {
  const normalized = raw.replace(',', '.').trim()
  if (normalized === '') return 0
  const value = Number(normalized)
  return Number.isFinite(value) ? value : 0
}

const fields: ReadonlyArray<{
  key: keyof FloorEstimateInput
  label: string
  unit: string
}> = [
  { key: 'totalFloorArea', label: 'Общая площадь пола', unit: 'м²' },
  { key: 'demolitionArea', label: 'Площадь демонтажа', unit: 'м²' },
  { key: 'screedArea', label: 'Площадь стяжки', unit: 'м²' },
  { key: 'wetZonesArea', label: 'Мокрые зоны', unit: 'м²' },
  { key: 'avgDeltaMm', label: 'Средний перепад', unit: 'мм' },
]

export function FloorEstimateInputs({ input, onChange }: FloorEstimateInputsProps) {
  return (
    <section className={styles.wrap} aria-labelledby="floor-estimate-inputs-title">
      <h2 className={styles.title} id="floor-estimate-inputs-title">
        Параметры замера
      </h2>
      <div className={styles.grid}>
        {fields.map((field) => (
          <label key={field.key} className={styles.field}>
            <span className={styles.label}>
              {field.label}
              <span className={styles.unit}>{field.unit}</span>
            </span>
            <input
              className={styles.control}
              type="number"
              min={0}
              step="any"
              value={Number(input[field.key] ?? 0)}
              onChange={(event) =>
                onChange({ [field.key]: parseNumberInput(event.target.value) })
              }
            />
          </label>
        ))}
      </div>

      <details className={styles.commentDetails}>
        <summary className={styles.commentSummary}>Комментарий замерщика</summary>
        <textarea
          className={styles.comment}
          rows={2}
          value={input.surveyorComment ?? ''}
          onChange={(event) => onChange({ surveyorComment: event.target.value })}
        />
      </details>
    </section>
  )
}
