import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import type { CalculatorLeadContext } from '../model/calculator-lead-context'
import type { BriefService } from '../model/brief.form'
import { useLeadModal } from '../model/LeadModalContext'
import type { ModalIntent } from '../model/lead-modal'
import styles from './ModalTriggerButton.module.scss'

export type ModalButtonVariant = 'accent' | 'inverse' | 'outline'
export type ModalButtonSize = 'sm' | 'md' | 'lg'

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'disabled' | 'onClick' | 'type'
>

export type ModalTriggerButtonProps = NativeButtonProps & {
  children: ReactNode
  intent: ModalIntent
  variant?: ModalButtonVariant
  size?: ModalButtonSize
  source?: string
  projectSlug?: string
  requestType?: BriefService
  fullWidth?: boolean
  showArrow?: boolean
  disabled?: boolean
  analyticsEvent?: string
  calculatorContext?: CalculatorLeadContext
  className?: string
}

export function ModalTriggerButton({
  children,
  intent,
  variant = 'accent',
  size = 'md',
  source,
  projectSlug,
  requestType,
  fullWidth = false,
  showArrow = true,
  disabled = false,
  analyticsEvent,
  calculatorContext,
  className,
  ...buttonProps
}: ModalTriggerButtonProps) {
  const { openLeadModal } = useLeadModal()
  const classNames = [
    styles.modalTrigger,
    styles[`modalTrigger_${variant}`],
    styles[`modalTrigger_${size}`],
    fullWidth ? styles.modalTrigger_fullWidth : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  const handleClick = () => {
    if (disabled) return

    openLeadModal({ intent, source, projectSlug, requestType, analyticsEvent, calculatorContext })
  }

  return (
    <button
      {...buttonProps}
      className={classNames}
      type="button"
      disabled={disabled}
      onClick={handleClick}
    >
      <span className={styles.modalTrigger__label}>{children}</span>
      {showArrow && (
        <span className={styles.modalTrigger__icon} aria-hidden="true">
          <ArrowIcon size={16} />
        </span>
      )}
    </button>
  )
}
