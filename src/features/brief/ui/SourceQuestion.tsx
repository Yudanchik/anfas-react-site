import type { UseFormRegisterReturn } from 'react-hook-form'

import { sourceOptions } from '@/shared/lib/lead-attribution'

import styles from './SourceQuestion.module.scss'

export function SourceQuestion({ field }: { field: UseFormRegisterReturn }) {
  return (
    <label className={styles.question}>
      <span>
        Откуда вы узнали о нас? <small>Необязательно</small>
      </span>
      <select {...field}>
        {sourceOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
