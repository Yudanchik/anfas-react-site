import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'

import styles from './EstimateSelect.module.scss'

export type EstimateSelectOption = {
  value: string
  label: string
  /** Полный текст для title / tooltip (если label укорочен). */
  title?: string
}

type EstimateSelectProps = {
  value: string
  options: readonly EstimateSelectOption[]
  onChange: (value: string) => void
  id?: string
  className?: string
  disabled?: boolean
  placeholder?: string
  ariaLabel?: string
  'aria-labelledby'?: string
}

/**
 * Кастомный select калькулятора сметы.
 * Системный dropdown Windows не используем — стили и длинные прайс-названия контролируем сами.
 */
export function EstimateSelect({
  value,
  options,
  onChange,
  id,
  className,
  disabled = false,
  placeholder = 'Выберите…',
  ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: EstimateSelectProps) {
  const reactId = useId()
  const listboxId = `${reactId}-listbox`
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)

  const selected = options.find((option) => option.value === value)
  const triggerLabel = selected?.label ?? placeholder
  const triggerTitle = selected?.title ?? selected?.label

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open || highlightIndex < 0) return
    const optionEl = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${highlightIndex}"]`,
    )
    optionEl?.scrollIntoView({ block: 'nearest' })
  }, [highlightIndex, open])

  function resolveOpenHighlight(): number {
    const selectedIndex = options.findIndex((option) => option.value === value)
    return selectedIndex >= 0 ? selectedIndex : 0
  }

  function openMenu() {
    setHighlightIndex(resolveOpenHighlight())
    setOpen(true)
  }

  function close() {
    setOpen(false)
  }

  function toggleMenu() {
    if (disabled) return
    if (open) {
      close()
      return
    }
    openMenu()
  }

  function selectValue(next: string) {
    onChange(next)
    close()
  }

  function moveHighlight(delta: number) {
    if (options.length === 0) return
    setHighlightIndex((prev) => {
      const start = prev < 0 ? (delta > 0 ? -1 : 0) : prev
      return (start + delta + options.length) % options.length
    })
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!open) {
          openMenu()
        } else {
          moveHighlight(1)
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!open) {
          openMenu()
        } else {
          moveHighlight(-1)
        }
        break
      case 'Enter':
      case ' ':
        if (open) {
          event.preventDefault()
          const option = options[highlightIndex]
          if (option) selectValue(option.value)
        }
        break
      case 'Escape':
        if (open) {
          event.preventDefault()
          close()
        }
        break
      default:
        break
    }
  }

  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={rootClass} ref={rootRef} data-open={open ? 'true' : 'false'}>
      <button
        type="button"
        id={id}
        className={styles.trigger}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        title={triggerTitle}
        onClick={toggleMenu}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={styles.triggerText} data-empty={!selected ? 'true' : undefined}>
          {triggerLabel}
        </span>
        <span className={styles.chevron} aria-hidden="true" />
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listboxId}
          className={styles.list}
          role="listbox"
          aria-activedescendant={
            highlightIndex >= 0 ? `${listboxId}-option-${highlightIndex}` : undefined
          }
          tabIndex={-1}
        >
          {options.length === 0 ? (
            <li className={styles.empty} role="presentation">
              Нет вариантов
            </li>
          ) : (
            options.map((option, index) => {
              const selectedOption = option.value === value
              const highlighted = index === highlightIndex
              return (
                <li
                  key={option.value}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={selectedOption}
                  data-index={index}
                  data-selected={selectedOption ? 'true' : undefined}
                  data-highlighted={highlighted ? 'true' : undefined}
                  className={styles.option}
                  title={option.title ?? option.label}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    selectValue(option.value)
                  }}
                >
                  <span className={styles.optionText}>{option.label}</span>
                </li>
              )
            })
          )}
        </ul>
      ) : null}
    </div>
  )
}
