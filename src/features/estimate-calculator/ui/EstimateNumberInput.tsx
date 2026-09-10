import type { InputHTMLAttributes } from 'react'
import { useState } from 'react'

import {
  formatEstimateNumberDisplay,
  getEstimateNumberFocusDraft,
  parseEstimateNumberInput,
  sanitizeEstimateNumberDraft,
} from '../model/estimate-number-input'
import styles from './EstimateNumberInput.module.scss'

type EstimateNumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'onFocus' | 'onBlur'
> & {
  value: number
  onValueChange: (value: number) => void
  className?: string
}

export function EstimateNumberInput({
  value,
  onValueChange,
  className,
  ...rest
}: EstimateNumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const display = draft ?? formatEstimateNumberDisplay(value)
  const classNames = [styles.input, className].filter(Boolean).join(' ')

  return (
    <input
      {...rest}
      className={classNames}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={display}
      onFocus={() => {
        setDraft(getEstimateNumberFocusDraft(value))
      }}
      onBlur={() => {
        if (draft !== null) {
          onValueChange(parseEstimateNumberInput(draft))
        }
        setDraft(null)
      }}
      onChange={(event) => {
        const next = sanitizeEstimateNumberDraft(event.target.value)
        setDraft(next)
        onValueChange(parseEstimateNumberInput(next))
      }}
    />
  )
}
