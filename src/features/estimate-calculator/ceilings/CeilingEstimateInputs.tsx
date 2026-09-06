import type { CeilingEstimateInput } from '@/entities/estimate'

import { EstimateNumberInput } from '../ui/EstimateNumberInput'
import styles from './CeilingEstimateInputs.module.scss'

type CeilingEstimateInputsProps = {
  input: CeilingEstimateInput
  onChange: (patch: Partial<CeilingEstimateInput>) => void
}

const fields: ReadonlyArray<{
  key: Exclude<keyof CeilingEstimateInput, 'surveyorComment'>
  label: string
  unit: string
}> = [
  { key: 'totalCeilingArea', label: 'Площадь потолков', unit: 'м²' },
  { key: 'demolitionArea', label: 'Демонтаж', unit: 'м²' },
  { key: 'plasterArea', label: 'Штукатурка', unit: 'м²' },
  { key: 'puttyArea', label: 'Шпаклёвка', unit: 'м²' },
  { key: 'finishArea', label: 'Финиш', unit: 'м²' },
]

export function CeilingEstimateInputs({ input, onChange }: CeilingEstimateInputsProps) {
  return (
    <section className={styles.wrap} aria-labelledby="ceiling-estimate-inputs-title">
      <h2 className={styles.title} id="ceiling-estimate-inputs-title">
        Параметры потолков
      </h2>
      <p className={styles.lead}>
        Введите площади и замеры объекта. Эти значения используются сценариями и быстрыми действиями.
      </p>
      <div className={styles.grid}>
        {fields.map((field) => (
          <label key={field.key} className={styles.field}>
            <span className={styles.label}>
              {field.label}
              <span className={styles.unit}>{field.unit}</span>
            </span>
            <EstimateNumberInput
              className={styles.control}
              value={Number(input[field.key] ?? 0)}
              onValueChange={(value) => onChange({ [field.key]: value })}
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
