import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'

import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import { submitLead } from '../api/submitLead'
import { formatPhoneValue, sanitizeNameValue } from '../model/brief.form'
import { briefSchema, type BriefFormValues } from '../model/brief.schema'
import { useLeadModal } from '../model/LeadModalContext'
import styles from './BriefModal.module.scss'

const focusableSelector = [
  'a[href]',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

type LeadFormValues = BriefFormValues & { company?: string }

export function BriefModal() {
  const { closeLeadModal, isOpen, modalState, preset } = useLeadModal()
  const panelRef = useRef<HTMLDivElement>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<LeadFormValues>({
    defaultValues: {
      name: '',
      phone: '',
      service: 'general',
      wishes: '',
      company: '',
    },
    resolver: zodResolver(briefSchema),
  })

  const close = useCallback(() => {
    closeLeadModal()
    setSubmitted(false)
    setSubmitError(null)
    reset()
  }, [closeLeadModal, reset])

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus()
    }, 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements.at(-1)

      if (!firstElement || !lastElement) {
        event.preventDefault()
        return
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.body.classList.add('modal-open')
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.body.classList.remove('modal-open')
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [close, isOpen])

  useEffect(() => {
    if (isOpen) {
      setValue('service', preset.requestType)
    }
  }, [isOpen, preset.requestType, setValue])

  const submit = async (values: LeadFormValues) => {
    setSubmitError(null)
    const result = await submitLead({
      name: values.name,
      phone: values.phone,
      service: values.service,
      wishes: values.wishes,
      company: values.company,
      source: modalState.source || 'brief-modal',
    })

    if (!result.ok) {
      setSubmitError(result.error)
      return
    }

    setSubmitted(true)
  }

  if (!isOpen) return null

  return (
    <div className={styles.briefModal} data-intent={modalState.intent} data-source={modalState.source}>
      <button
        className={styles.briefModal__backdrop}
        type="button"
        tabIndex={-1}
        aria-label="Закрыть форму"
        onClick={close}
      />
      <div className={styles.briefModal__viewport}>
        <div
          className={styles.briefModal__panel}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-modal-title"
          aria-describedby="lead-modal-description"
        >
        <button
          className={styles.briefModal__close}
          type="button"
          onClick={close}
          aria-label="Закрыть модальное окно"
        >
          <span className={styles.briefModal__closeLine} />
          <span className={styles.briefModal__closeLine} />
        </button>

        {!submitted ? (
          <>
            <header className={styles.briefModal__header}>
              <p className={styles.briefModal__eyebrow}>{preset.eyebrow}</p>
              <h2 className={styles.briefModal__title} id="lead-modal-title">
                {preset.title}
              </h2>
              <p className={styles.briefModal__lead} id="lead-modal-description">
                {preset.description}
              </p>
            </header>

            <form className={styles.briefModal__form} onSubmit={handleSubmit(submit)} noValidate>
              <input type="hidden" {...register('service')} />
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, opacity: 0 }}
                {...register('company')}
              />

              <div className={styles.briefModal__selected}>
                <span className={styles.briefModal__selectedLabel}>Выбрано</span>
                <strong className={styles.briefModal__selectedValue}>{preset.selectedLabel}</strong>
                <small className={styles.briefModal__selectedNote}>{preset.selectedDescription}</small>
              </div>

              <div className={styles.briefModal__fields}>
                <label className={styles.briefModal__field}>
                  <span className={styles.briefModal__fieldLabel}>Ваше имя</span>
                  <input
                    className={styles.briefModal__fieldControl}
                    type="text"
                    autoComplete="name"
                    maxLength={48}
                    placeholder="Ваше имя"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'lead-modal-name-error' : undefined}
                    {...register('name')}
                    onChange={(event) =>
                      setValue('name', sanitizeNameValue(event.target.value), { shouldValidate: true })
                    }
                  />
                  {errors.name && (
                    <small className={styles.briefModal__error} id="lead-modal-name-error">
                      {errors.name.message}
                    </small>
                  )}
                </label>

                <label className={styles.briefModal__field}>
                  <span className={styles.briefModal__fieldLabel}>Телефон</span>
                  <input
                    className={styles.briefModal__fieldControl}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={18}
                    placeholder="+7 (999) 000-00-00"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'lead-modal-phone-error' : undefined}
                    {...register('phone')}
                    onChange={(event) =>
                      setValue('phone', formatPhoneValue(event.target.value), { shouldValidate: true })
                    }
                  />
                  {errors.phone && (
                    <small className={styles.briefModal__error} id="lead-modal-phone-error">
                      {errors.phone.message}
                    </small>
                  )}
                </label>
              </div>

              {modalState.intent === 'brief' && (
                <label className={`${styles.briefModal__field} ${styles.briefModal__field_fullWidth}`}>
                  <span className={styles.briefModal__fieldLabel}>
                    Немного о пожеланиях
                    <small className={styles.briefModal__fieldOptional}>Необязательно</small>
                  </span>
                  <textarea
                    className={`${styles.briefModal__fieldControl} ${styles.briefModal__fieldTextarea}`}
                    rows={4}
                    maxLength={600}
                    placeholder="Расскажите о квартире, желаемом стиле, сроках или важных деталях"
                    aria-invalid={Boolean(errors.wishes)}
                    aria-describedby={errors.wishes ? 'lead-modal-wishes-error' : undefined}
                    {...register('wishes')}
                  />
                  {errors.wishes && (
                    <small className={styles.briefModal__error} id="lead-modal-wishes-error">
                      {errors.wishes.message}
                    </small>
                  )}
                </label>
              )}

              {submitError ? (
                <small className={styles.briefModal__error} role="alert">
                  {submitError}
                </small>
              ) : null}

              <button className={styles.briefModal__submit} type="submit" disabled={isSubmitting}>
                <span className={styles.briefModal__submitText}>
                  {isSubmitting ? 'Отправляем…' : preset.submitLabel}
                </span>
                <i className={styles.briefModal__submitIcon} aria-hidden="true">
                  <ArrowIcon size={16} />
                </i>
              </button>
              <small className={styles.briefModal__privacy}>
                Нажимая кнопку, вы соглашаетесь с{' '}
                <Link className={styles.briefModal__privacyLink} to="/privacy">
                  политикой обработки персональных данных
                </Link>
                .
              </small>
            </form>
          </>
        ) : (
          <div className={styles.briefModal__success}>
            <span className={styles.briefModal__successIcon} aria-hidden="true">
              ✓
            </span>
            <h2 className={styles.briefModal__successTitle} id="lead-modal-title">
              {preset.successTitle}
            </h2>
            <p className={styles.briefModal__successText} id="lead-modal-description">
              {preset.successDescription}
            </p>
            <button className={styles.briefModal__successButton} type="button" onClick={close}>
              Закрыть
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
