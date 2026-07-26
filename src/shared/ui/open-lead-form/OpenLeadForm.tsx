import { zodResolver } from '@hookform/resolvers/zod'
import { useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { useForm, useWatch } from 'react-hook-form'

import { submitLead } from '@/features/brief/api/submitLead'
import {
  briefServiceOptions,
  formatPhoneValue,
  sanitizeNameValue,
  type BriefService,
} from '@/features/brief/model/brief.form'
import { briefSchema, type BriefFormValues } from '@/features/brief/model/brief.schema'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import {
  ConsultationIcon,
  HomeIcon,
  PackageIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
} from './FormIcons'
import styles from './OpenLeadForm.module.scss'

type OpenLeadFormProps = {
  className?: string
  title: ReactNode
  lead: string
  defaultService?: BriefService
  submitLabel?: string
  successMessage?: string
}

type LeadFormValues = BriefFormValues & { company?: string }

const serviceIcons = {
  general: ConsultationIcon,
  individual: HomeIcon,
  package: PackageIcon,
} satisfies Record<BriefService, typeof ConsultationIcon>

export function OpenLeadForm({
  className,
  title,
  lead,
  defaultService = 'individual',
  submitLabel = 'Обсудить проект',
  successMessage = 'Спасибо. Мы получили заявку и свяжемся с вами для уточнения деталей.',
}: OpenLeadFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const formId = useId()
  const nameInputId = `${formId}-name`
  const phoneInputId = `${formId}-phone`
  const nameErrorId = `${formId}-name-error`
  const phoneErrorId = `${formId}-phone-error`
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<LeadFormValues>({
    defaultValues: {
      name: '',
      phone: '',
      service: defaultService,
      company: '',
    },
    resolver: zodResolver(briefSchema),
  })

  const selectedService = useWatch({ control, name: 'service' })
  const activeService: BriefService = selectedService ?? defaultService

  const submit = async (values: LeadFormValues) => {
    setSubmitError(null)
    const result = await submitLead({
      name: values.name,
      phone: values.phone,
      service: values.service,
      company: values.company,
      source: 'open-lead-form',
    })

    if (!result.ok) {
      setSubmitError(result.error)
      return
    }

    setSubmitted(true)
    reset({
      name: '',
      phone: '',
      service: activeService,
      company: '',
    })
  }

  return (
    <section className={`${styles.openLeadForm} ${className ?? ''}`} data-reveal data-service={activeService}>
      <div className={styles.openLeadForm__header}>
        <h2 className={styles.openLeadForm__title}>{title}</h2>
        <p className={styles.openLeadForm__lead}>{lead}</p>
      </div>

      <form className={styles.openLeadForm__form} onSubmit={handleSubmit(submit)} noValidate>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, opacity: 0 }}
          {...register('company')}
        />
        <fieldset className={styles.openLeadForm__servicePicker}>
          <legend className={styles.openLeadForm__legend}>Что интересует сейчас</legend>
          <div className={styles.openLeadForm__serviceOptions}>
            {briefServiceOptions.map((option) => {
              const Icon = serviceIcons[option.value]

              return (
                <label
                  className={`${styles.openLeadForm__serviceOption} ${
                    activeService === option.value ? styles.openLeadForm__serviceOption_active : ''
                  }`}
                  key={option.value}
                >
                  <input
                    className={styles.openLeadForm__serviceOptionInput}
                    type="radio"
                    value={option.value}
                    required
                    {...register('service')}
                  />
                  <span className={styles.openLeadForm__serviceOptionContent}>
                    <Icon className={styles.openLeadForm__serviceOptionIcon} size={22} />
                    <span className={styles.openLeadForm__serviceOptionText}>{option.label}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className={styles.openLeadForm__fields}>
          <div className={styles.openLeadForm__field}>
            <label className={styles.openLeadForm__fieldLabel} htmlFor={nameInputId}>
              Имя
            </label>
            <div className={styles.openLeadForm__fieldControlWrap}>
              <UserIcon className={styles.openLeadForm__fieldIcon} size={27} />
              <input
                className={styles.openLeadForm__fieldInput}
                id={nameInputId}
                type="text"
                placeholder="Ваше имя"
                autoComplete="name"
                required
                maxLength={48}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? nameErrorId : undefined}
                {...register('name')}
                onChange={(event) =>
                  setValue('name', sanitizeNameValue(event.target.value), { shouldValidate: true })
                }
              />
            </div>
            {errors.name ? (
              <small className={styles.openLeadForm__error} id={nameErrorId}>
                {errors.name.message}
              </small>
            ) : null}
          </div>

          <div className={styles.openLeadForm__field}>
            <label className={styles.openLeadForm__fieldLabel} htmlFor={phoneInputId}>
              Телефон
            </label>
            <div className={styles.openLeadForm__fieldControlWrap}>
              <PhoneIcon className={styles.openLeadForm__fieldIcon} size={27} />
              <input
                className={styles.openLeadForm__fieldInput}
                id={phoneInputId}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                maxLength={18}
                placeholder="+7 (999) 000-00-00"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? phoneErrorId : undefined}
                {...register('phone')}
                onChange={(event) =>
                  setValue('phone', formatPhoneValue(event.target.value), { shouldValidate: true })
                }
              />
            </div>
            {errors.phone ? (
              <small className={styles.openLeadForm__error} id={phoneErrorId}>
                {errors.phone.message}
              </small>
            ) : null}
          </div>
        </div>

        <div className={styles.openLeadForm__footer}>
          {submitError ? (
            <small className={styles.openLeadForm__error} role="alert">
              {submitError}
            </small>
          ) : null}
          <div className={styles.openLeadForm__footerAction}>
            <button className={styles.openLeadForm__button} type="submit" disabled={isSubmitting}>
              <span className={styles.openLeadForm__buttonText}>
                {isSubmitting ? 'Отправляем...' : submitLabel}
              </span>
              <i className={styles.openLeadForm__buttonIcon} aria-hidden="true">
                <ArrowIcon size={16} />
              </i>
            </button>
          </div>

          <div className={styles.openLeadForm__privacy}>
            <span className={styles.openLeadForm__privacyIcon} aria-hidden="true">
              <ShieldCheckIcon size={22} />
            </span>
            <p className={styles.openLeadForm__privacyText}>
              Нажимая кнопку, вы соглашаетесь с{' '}
              <Link className={styles.openLeadForm__privacyLink} to="/privacy">
                политикой конфиденциальности
              </Link>{' '}
              и на обработку персональных данных.
            </p>
          </div>
        </div>
      </form>

      {submitted ? <p className={styles.openLeadForm__success}>{successMessage}</p> : null}
    </section>
  )
}
