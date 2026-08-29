import type { FloorEstimateInput } from '@/entities/estimate'

import { EstimateNumberInput } from '@/features/estimate-calculator/ui/EstimateNumberInput'

import styles from './FloorEstimateInputs.module.scss'

type FloorEstimateInputsProps = {
  input: FloorEstimateInput
  onChange: (patch: Partial<FloorEstimateInput>) => void
}

const fields: ReadonlyArray<{
  key: Exclude<keyof FloorEstimateInput, 'surveyorComment'>
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
