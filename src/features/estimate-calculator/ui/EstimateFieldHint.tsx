import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import styles from './EstimateFieldHint.module.scss'

export function EstimateFieldHint({ text, label }: { text: string; label: string }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const anchor = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ left: 8, top: 8, width: 280 })
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  function show() {
    clearTimeout(hideTimer.current)
    const rect = anchor.current?.getBoundingClientRect()
    if (!rect) return
    const width = Math.min(280, window.innerWidth - 16)
    setPosition({
      width,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
      top: Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 160)),
    })
    setOpen(true)
  }
  function hide() {
    hideTimer.current = setTimeout(() => setOpen(false), 120)
  }
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      clearTimeout(hideTimer.current)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [open])
  return (
    <span className={styles.wrap} onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        ref={anchor}
        className={styles.button}
        aria-label={`Подсказка: ${label}`}
        aria-describedby={open ? id : undefined}
        onFocus={show}
        onBlur={() => setOpen(false)}
        onClick={show}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
        }}
      >
        i
      </button>
      {open && typeof document !== 'undefined'
        ? createPortal(
            <span
              id={id}
              role="tooltip"
              className={styles.tooltip}
              style={position}
              onMouseEnter={() => clearTimeout(hideTimer.current)}
              onMouseLeave={hide}
            >
              {text}
            </span>,
            document.body,
          )
        : null}
    </span>
  )
}
