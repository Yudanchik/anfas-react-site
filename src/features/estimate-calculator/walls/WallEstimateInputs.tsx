import type { WallEstimateInput } from '@/entities/estimate'

import styles from './WallEstimateInputs.module.scss'

type WallEstimateInputsProps = {
  input: WallEstimateInput
  onChange: (patch: Partial<WallEstimateInput>) => void
}

function parseNumberInput(raw: string): number {
  const normalized = raw.replace(',', '.').trim()
  if (normalized === '') return 0
  const value = Number(normalized)
  return Number.isFinite(value) ? value : 0
}

const fields: ReadonlyArray<{
  key: keyof WallEstimateInput
  label: string
  unit: string
}> = [
  { key: 'totalWallArea', label: 'Площадь стен', unit: 'м²' },
  { key: 'demolitionArea', label: 'Демонтаж', unit: 'м²' },
  { key: 'plasterArea', label: 'Штукатурка', unit: 'м²' },
  { key: 'puttyArea', label: 'Шпаклёвка', unit: 'м²' },
  { key: 'finishArea', label: 'Финиш', unit: 'м²' },
  { key: 'slopesLengthM', label: 'Откосы', unit: 'м. пог.' },
  { key: 'cornersLengthM', label: 'Углы', unit: 'м. пог.' },
  { key: 'wallHeightM', label: 'Высота', unit: 'м' },
]

export function WallEstimateInputs({ input, onChange }: WallEstimateInputsProps) {
  return (
    <section className={styles.wrap} aria-labelledby="wall-estimate-inputs-title">
      <h2 className={styles.title} id="wall-estimate-inputs-title">
        Параметры стен
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
