import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router'

import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import { briefSchema, type BriefFormValues } from '../model/brief.schema'
import {
  briefServiceOptions,
  briefServiceCopy,
  formatPhoneValue,
  sanitizeNameValue,
} from '../model/brief.form'
import { useBrief } from '../model/BriefContext'
import styles from './BriefModal.module.scss'

export function BriefModal() {
  const { closeBrief, isOpen, presetService } = useBrief()
  const [submitted, setSubmitted] = useState(false)
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<BriefFormValues>({
    defaultValues: {
      name: '',
      phone: '',
      service: 'general',
    },
    resolver: zodResolver(briefSchema),
  })

  const selectedService = useWatch({ control, name: 'service' })
  const activeService = isOpen ? presetService : selectedService
  const content = briefServiceCopy[activeService]
  const selectedOption =
    briefServiceOptions.find((option) => option.value === activeService) ?? briefServiceOptions[0]

  useEffect(() => {
    document.body.classList.toggle('modal-open', isOpen)

    return () => document.body.classList.remove('modal-open')
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setValue('service', presetService, { shouldValidate: true })
    }
  }, [isOpen, presetService, setValue])

  const close = () => {
    closeBrief()
    setSubmitted(false)
    reset()
  }

  const submit = (_values: BriefFormValues) => {
    setSubmitted(true)
  }

  return (
    <div
      className={`${styles.briefModal} ${isOpen ? styles.briefModal_open : ''}`}
      aria-hidden={!isOpen}
      data-service={activeService}
    >
      <button
        className={styles.briefModal__backdrop}
        type="button"
        aria-label="Закрыть форму"
        onClick={close}
      />
      <div
        className={styles.briefModal__panel}
        role="dialog"
        aria-modal="true"
        aria-label="Обсудить проект"
        data-service={activeService}
      >
        <button className={styles.briefModal__close} type="button" onClick={close} aria-label="Закрыть">
          <span className={styles.briefModal__closeLine} />
          <span className={styles.briefModal__closeLine} />
        </button>

        {!submitted ? (
          <>
            <p className={styles.briefModal__eyebrow}>{content.eyebrow}</p>
            <h2 className={styles.briefModal__title}>{content.title}</h2>
            <p className={styles.briefModal__lead}>{content.lead}</p>
            <form className={styles.briefModal__form} onSubmit={handleSubmit(submit)} noValidate>
              <input type="hidden" value={activeService} {...register('service')} />

              <div className={styles.briefModal__selected}>
                <span className={styles.briefModal__selectedLabel}>Выбрано</span>
                <strong className={styles.briefModal__selectedValue}>{selectedOption.label}</strong>
                <small className={styles.briefModal__selectedNote}>{content.serviceNote}</small>
              </div>

              <label className={styles.briefModal__field}>
                <span className={styles.briefModal__fieldLabel}>Ваше имя</span>
                <input
                  className={styles.briefModal__fieldControl}
                  type="text"
                  autoComplete="name"
                  maxLength={48}
                  placeholder="Ваше имя"
                  {...register('name')}
                  onChange={(event) =>
                    setValue('name', sanitizeNameValue(event.target.value), { shouldValidate: true })
                  }
                />
                {errors.name && <small className={styles.briefModal__error}>{errors.name.message}</small>}
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
                  {...register('phone')}
                  onChange={(event) =>
                    setValue('phone', formatPhoneValue(event.target.value), { shouldValidate: true })
                  }
                />
                {errors.phone && <small className={styles.briefModal__error}>{errors.phone.message}</small>}
              </label>

              <button className={styles.briefModal__submit} type="submit">
                <span className={styles.briefModal__submitText}>{content.submitLabel}</span>
                <i className={styles.briefModal__submitIcon}>
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
            <span className={styles.briefModal__successIcon}>✓</span>
            <h2 className={styles.briefModal__successTitle}>{content.successTitle}</h2>
            <p className={styles.briefModal__successText}>{content.successLead}</p>
            <button className={styles.briefModal__successButton} type="button" onClick={close}>
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
