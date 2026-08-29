import type { InputHTMLAttributes } from 'react'

import styles from './EstimateClearableInput.module.scss'

type EstimateClearableInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> & {
  value: string
  onValueChange: (value: string) => void
  clearAriaLabel?: string
}

/** Текстовое поле с крестиком очистки (только когда есть значение). */
export function EstimateClearableInput({
  value,
  onValueChange,
  clearAriaLabel = 'Очистить',
  className,
  disabled,
  ...rest
}: EstimateClearableInputProps) {
  const showClear = value.length > 0 && !disabled

  return (
    <div className={styles.wrap} data-has-clear={showClear ? 'true' : 'false'}>
      <input
        {...rest}
        type="text"
        className={[styles.input, className].filter(Boolean).join(' ')}
        value={value}
        disabled={disabled}
        onChange={(event) => onValueChange(event.target.value)}
      />
      {showClear ? (
        <button
          type="button"
          className={styles.clear}
          aria-label={clearAriaLabel}
          tabIndex={0}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onValueChange('')}
        >
          <span aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}
