import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

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
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<BriefFormValues>({
    defaultValues: {
      name: '',
      phone: '',
      service: 'general',
    },
    resolver: zodResolver(briefSchema),
  })

  const selectedService = watch('service')
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
      className={`${styles.modal} ${isOpen ? styles.open : ''}`}
      aria-hidden={!isOpen}
      data-service={activeService}
    >
      <button
        className={styles.backdrop}
        type="button"
        aria-label="Закрыть форму"
        onClick={close}
      />
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Обсудить проект"
        data-service={activeService}
      >
        <button className={styles.close} type="button" onClick={close} aria-label="Закрыть">
          <span />
          <span />
        </button>

        {!submitted ? (
          <>
            <p className={styles.eyebrow}>{content.eyebrow}</p>
            <h2 className={styles.title}>{content.title}</h2>
            <p className={styles.lead}>{content.lead}</p>
            <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
              <input type="hidden" value={activeService} {...register('service')} />

              <div className={styles.selected}>
                <span>Выбрано</span>
                <strong>{selectedOption.label}</strong>
                <small>{content.serviceNote}</small>
              </div>

              <label className={styles.field}>
                <span>Ваше имя</span>
                <input
                  type="text"
                  autoComplete="name"
                  maxLength={48}
                  placeholder="Ваше имя"
                  {...register('name')}
                  onChange={(event) =>
                    setValue('name', sanitizeNameValue(event.target.value), { shouldValidate: true })
                  }
                />
                {errors.name && <small className={styles.error}>{errors.name.message}</small>}
              </label>

              <label className={styles.field}>
                <span>Телефон</span>
                <input
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
                {errors.phone && <small className={styles.error}>{errors.phone.message}</small>}
              </label>

              <button className={styles.submit} type="submit">
                <span>{content.submitLabel}</span>
                <i>
                  <ArrowIcon size={16} />
                </i>
              </button>
              <small className={styles.privacy}>
                Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности.
              </small>
            </form>
          </>
        ) : (
          <div className={styles.success}>
            <span>✓</span>
            <h2>{content.successTitle}</h2>
            <p>{content.successLead}</p>
            <button type="button" onClick={close}>
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
