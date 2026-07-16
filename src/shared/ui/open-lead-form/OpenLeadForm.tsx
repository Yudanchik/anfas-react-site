import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Link } from 'react-router'
import { useForm, useWatch } from 'react-hook-form'

import {
  briefServiceOptions,
  formatPhoneValue,
  sanitizeNameValue,
  type BriefService,
} from '@/features/brief/model/brief.form'
import { briefSchema, type BriefFormValues } from '@/features/brief/model/brief.schema'

import styles from './OpenLeadForm.module.scss'

type OpenLeadFormProps = {
  className?: string
  title: string
  lead: string
  defaultService?: BriefService
  submitLabel?: string
  successMessage?: string
}

export function OpenLeadForm({
  className,
  title,
  lead,
  defaultService = 'general',
  submitLabel = 'Отправить заявку',
  successMessage = 'Спасибо. Форма прошла клиентскую валидацию, и мы свяжемся с вами для уточнения деталей.',
}: OpenLeadFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<BriefFormValues>({
    defaultValues: {
      name: '',
      phone: '',
      service: defaultService,
    },
    resolver: zodResolver(briefSchema),
  })

  const selectedService = useWatch({ control, name: 'service' })

  const submit = (_values: BriefFormValues) => {
    setSubmitted(true)
    reset({
      name: '',
      phone: '',
      service: selectedService,
    })
  }

  return (
    <section className={`${styles.openLeadForm} ${className ?? ''}`} data-reveal>
      <div className={styles.openLeadForm__header}>
        <h2 className={styles.openLeadForm__title}>{title}</h2>
        <p className={styles.openLeadForm__lead}>{lead}</p>
      </div>

      <form className={styles.openLeadForm__form} onSubmit={handleSubmit(submit)} noValidate>
        <fieldset className={styles.openLeadForm__servicePicker}>
          <legend className={styles.openLeadForm__legend}>Что интересует сейчас</legend>
          <div className={styles.openLeadForm__serviceOptions}>
            {briefServiceOptions.map((option) => (
              <label
                className={`${styles.openLeadForm__serviceOption} ${
                  selectedService === option.value ? styles.openLeadForm__serviceOption_active : ''
                }`}
                key={option.value}
              >
                <input
                  className={styles.openLeadForm__serviceOptionInput}
                  type="radio"
                  value={option.value}
                  {...register('service')}
                />
                <span className={styles.openLeadForm__serviceOptionText}>{option.label}</span>
              </label>
            ))}
          </div>
          {errors.service ? <small className={styles.openLeadForm__error}>{errors.service.message}</small> : null}
        </fieldset>

        <div className={styles.openLeadForm__fields}>
          <label className={styles.openLeadForm__field}>
            <span className={styles.openLeadForm__fieldLabel}>Имя</span>
            <input
              className={styles.openLeadForm__fieldInput}
              type="text"
              placeholder="Ваше имя"
              autoComplete="name"
              maxLength={48}
              {...register('name')}
              onChange={(event) =>
                setValue('name', sanitizeNameValue(event.target.value), { shouldValidate: true })
              }
            />
            {errors.name ? <small className={styles.openLeadForm__error}>{errors.name.message}</small> : null}
          </label>

          <label className={styles.openLeadForm__field}>
            <span className={styles.openLeadForm__fieldLabel}>Телефон</span>
            <input
              className={styles.openLeadForm__fieldInput}
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
            {errors.phone ? <small className={styles.openLeadForm__error}>{errors.phone.message}</small> : null}
          </label>
        </div>

        <div className={styles.openLeadForm__footer}>
          <button className={styles.openLeadForm__button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Отправляем...' : submitLabel}
          </button>
          <p className={styles.openLeadForm__privacy}>
            Нажимая кнопку, вы соглашаетесь с{' '}
            <Link className={styles.openLeadForm__privacyLink} to="/privacy">
              политикой конфиденциальности
            </Link>{' '}
            и на обработку персональных данных.
          </p>
        </div>
      </form>

      {submitted ? <p className={styles.openLeadForm__success}>{successMessage}</p> : null}
    </section>
  )
}
