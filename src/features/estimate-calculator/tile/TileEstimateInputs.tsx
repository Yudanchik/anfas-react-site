import type { TileEstimateInput } from '@/entities/estimate'

import { EstimateNumberInput } from '../ui/EstimateNumberInput'
import styles from './TileEstimateInputs.module.scss'

type TileEstimateInputsProps = {
  input: TileEstimateInput
  onChange: (patch: Partial<TileEstimateInput>) => void
}

const fields: ReadonlyArray<{
  key: Exclude<keyof TileEstimateInput, 'surveyorComment'>
  label: string
  unit: string
}> = [
  { key: 'floorTileArea', label: 'Плитка пола', unit: 'м²' },
  { key: 'wallTileArea', label: 'Плитка стен', unit: 'м²' },
  { key: 'backsplashArea', label: 'Фартук', unit: 'м²' },
  { key: 'cuttingLength', label: 'Подрезка / кромка', unit: 'м. пог.' },
  { key: 'cornerLength', label: 'Углы / примыкания', unit: 'м. пог.' },
  { key: 'holesCount', label: 'Отверстия', unit: 'шт.' },
  { key: 'repairCount', label: 'Замена плитки', unit: 'шт.' },
]

export function TileEstimateInputs({ input, onChange }: TileEstimateInputsProps) {
  return (
    <section className={styles.wrap} aria-labelledby="tile-estimate-inputs-title">
      <h2 className={styles.title} id="tile-estimate-inputs-title">
        Параметры плитки
      </h2>
      <p className={styles.lead}>
        Введите площади и замеры объекта. Эти значения используются сценариями и быстрыми действиями.
        Гидроизоляция — через раздел «Полы».
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
