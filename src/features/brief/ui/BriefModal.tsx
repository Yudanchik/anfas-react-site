import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import { briefSchema, type BriefFormValues } from '../model/brief.schema'
import { useBrief } from '../model/BriefContext'
import styles from './BriefModal.module.scss'

export function BriefModal() {
  const { closeBrief, isOpen } = useBrief()
  const [submitted, setSubmitted] = useState(false)
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<BriefFormValues>({
    defaultValues: {
      name: '',
      phone: '',
      service: undefined,
    },
    resolver: zodResolver(briefSchema),
  })

  useEffect(() => {
    document.body.classList.toggle('modal-open', isOpen)

    return () => document.body.classList.remove('modal-open')
  }, [isOpen])

  const close = () => {
    closeBrief()
    setSubmitted(false)
    reset()
  }

  const submit = (_values: BriefFormValues) => {
    setSubmitted(true)
  }

  return (
    <div className={`${styles.modal} ${isOpen ? styles.open : ''}`} aria-hidden={!isOpen}>
      <button
        className={styles.backdrop}
        type="button"
        aria-label="Закрыть форму"
        onClick={close}
      />
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Обсудить проект">
        <button className={styles.close} type="button" onClick={close} aria-label="Закрыть">
          <span />
          <span />
        </button>

        {!submitted ? (
          <>
            <p className={styles.eyebrow}>Начнём знакомство</p>
            <h2 className={styles.title}>
              Расскажите
              <br />
              <em>о вашем проекте</em>
            </h2>
            <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
              <label className={styles.field}>
                <span>Как вас зовут?</span>
                <input type="text" placeholder="Ваше имя" {...register('name')} />
                {errors.name && <small className={styles.error}>{errors.name.message}</small>}
              </label>

              <label className={styles.field}>
                <span>Как с вами связаться?</span>
                <input type="tel" placeholder="+7 999 000-00-00" {...register('phone')} />
                {errors.phone && <small className={styles.error}>{errors.phone.message}</small>}
              </label>

              <label className={styles.field}>
                <span>Что планируете?</span>
                <select defaultValue="" {...register('service')}>
                  <option value="" disabled>
                    Выберите услугу
                  </option>
                  <option value="design">Дизайн-проект</option>
                  <option value="renovation">Ремонт под ключ</option>
                  <option value="full">Дизайн и ремонт</option>
                </select>
                {errors.service && <small className={styles.error}>{errors.service.message}</small>}
              </label>

              <button className={styles.submit} type="submit">
                <span>Отправить заявку</span>
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
            <h2>Спасибо!</h2>
            <p>
              Форма уже валидируется на клиенте. На следующем этапе подключим безопасный серверный
              обработчик заявки.
            </p>
            <button type="button" onClick={close}>
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
