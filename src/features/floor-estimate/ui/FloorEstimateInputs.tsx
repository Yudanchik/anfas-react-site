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
  kind: 'number' | 'text'
}> = [
  { key: 'totalFloorArea', label: 'Общая площадь пола', unit: 'м²', kind: 'number' },
  { key: 'demolitionArea', label: 'Площадь демонтажа', unit: 'м²', kind: 'number' },
  { key: 'screedArea', label: 'Площадь стяжки/выравнивания', unit: 'м²', kind: 'number' },
  { key: 'wetZonesArea', label: 'Площадь мокрых зон', unit: 'м²', kind: 'number' },
  { key: 'avgDeltaMm', label: 'Средний перепад', unit: 'мм', kind: 'number' },
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
            <span>
              {field.label}, {field.unit}
            </span>
            <input
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
        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span>Комментарий замерщика</span>
          <textarea
            rows={3}
            value={input.surveyorComment ?? ''}
            onChange={(event) => onChange({ surveyorComment: event.target.value })}
          />
        </label>
      </div>
    </section>
  )
}
