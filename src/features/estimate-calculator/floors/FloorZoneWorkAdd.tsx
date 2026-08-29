import { useEffect, useMemo, useRef, useState } from 'react'

import {
  FLOOR_ZONE_WORK_CATEGORIES,
  getFloorZoneMappingOptions,
  type FloorZoneWorkCategoryId,
} from '@/entities/estimate'

import { validateEstimateZoneName } from '../model/estimate-zone-name'
import { EstimateNumberInput } from '../ui/EstimateNumberInput'
import { EstimateSelect } from '../ui/EstimateSelect'
import styles from './FloorZoneWorkAdd.module.scss'

type FloorZoneWorkAddProps = {
  onAdd: (params: {
    priceKey: string
    quantity: number
    zoneName: string
    comment?: string
  }) => boolean
}

type StatusKind = 'success' | 'error' | 'info'

type StatusState = {
  kind: StatusKind
  message: string
}

const SUCCESS_CLEAR_MS = 4500

export function FloorZoneWorkAdd({ onAdd }: FloorZoneWorkAddProps) {
  const [categoryId, setCategoryId] = useState<FloorZoneWorkCategoryId>('demolition')
  const options = useMemo(() => getFloorZoneMappingOptions(categoryId), [categoryId])
  const [priceKey, setPriceKey] = useState(() => options[0]?.id ?? '')
  const [zoneName, setZoneName] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<StatusState | null>(null)
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedOptions = options
  const effectivePriceKey =
    selectedOptions.some((item) => item.id === priceKey) && priceKey
      ? priceKey
      : (selectedOptions[0]?.id ?? '')
  const selectedWork = selectedOptions.find((item) => item.id === effectivePriceKey)
  const quantityUnit = selectedWork?.unit ?? 'м²'

  const categorySelectOptions = useMemo(
    () =>
      FLOOR_ZONE_WORK_CATEGORIES.map((category) => ({
        value: category.id,
        label: category.label,
      })),
    [],
  )

  const workSelectOptions = useMemo(
    () =>
      selectedOptions.map((item) => {
        const label = `${item.title} · ${item.unitPrice} ₽/${item.unit}`
        return {
          value: item.id,
          label,
          title: label,
        }
      }),
    [selectedOptions],
  )

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current)
    }
  }, [])

  function setError(message: string) {
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }
    setStatus({ kind: 'error', message })
  }

  function setSuccess(message: string) {
    if (successTimerRef.current) clearTimeout(successTimerRef.current)
    setStatus({ kind: 'success', message })
    successTimerRef.current = setTimeout(() => {
      setStatus((prev) => (prev?.kind === 'success' ? null : prev))
      successTimerRef.current = null
    }, SUCCESS_CLEAR_MS)
  }

  function handleCategoryChange(next: FloorZoneWorkCategoryId) {
    setCategoryId(next)
    const nextOptions = getFloorZoneMappingOptions(next)
    setPriceKey(nextOptions[0]?.id ?? '')
  }

  function handleSubmit() {
    if (!effectivePriceKey || !selectedWork) {
      setError('Выберите работу из списка')
      return
    }

    const zone = validateEstimateZoneName(zoneName)
    if (!zone.ok) {
      setError(zone.message)
      return
    }

    if (!(quantity > 0)) {
      setError('Укажите объём работы больше 0')
      return
    }

    const ok = onAdd({
      priceKey: effectivePriceKey,
      quantity,
      zoneName: zone.value,
      comment: comment.trim() || undefined,
    })
    if (!ok) {
      setError('Не удалось добавить работу')
      return
    }

    setSuccess(
      `Работа добавлена в смету: ${selectedWork.title}, зона: ${zone.value}, объём: ${quantity} ${selectedWork.unit}`,
    )
    setQuantity(0)
    setComment('')
  }

  return (
    <section className={styles.wrap} aria-labelledby="floor-zone-work-add-title">
      <div className={styles.head}>
        <h2 className={styles.title} id="floor-zone-work-add-title">
          Добавить работу по зоне
        </h2>
        <p className={styles.lead}>
          Добавляет отдельную работу из прайса для конкретной зоны: кухни, коридора, санузла или
          комнаты. Уже добавленные строки не затираются.
        </p>
      </div>

      <div className={styles.form}>
        <div className={styles.field}>
          <span className={styles.label}>Тип</span>
          <EstimateSelect
            value={categoryId}
            options={categorySelectOptions}
            ariaLabel="Тип работы по зоне"
            onChange={(next) => handleCategoryChange(next as FloorZoneWorkCategoryId)}
          />
        </div>

        <div className={`${styles.field} ${styles.workField}`}>
          <span className={styles.label}>Работа</span>
          <EstimateSelect
            className={styles.selectWork}
            value={effectivePriceKey}
            options={workSelectOptions}
            disabled={workSelectOptions.length === 0}
            ariaLabel="Работа из прайса"
            onChange={setPriceKey}
          />
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Зона</span>
          <input
            className={styles.control}
            value={zoneName}
            placeholder="Кухня"
            maxLength={60}
            onChange={(event) => setZoneName(event.target.value)}
          />
        </label>

        <label className={styles.field} htmlFor="floor-zone-work-quantity">
          <span className={styles.label}>
            Площадь / метраж
            <span className={styles.unit}>{quantityUnit}</span>
          </span>
          <EstimateNumberInput
            id="floor-zone-work-quantity"
            className={styles.control}
            value={quantity}
            onValueChange={setQuantity}
          />
        </label>

        <label className={`${styles.field} ${styles.commentField}`}>
          <span className={styles.label}>Комментарий</span>
          <input
            className={styles.control}
            value={comment}
            placeholder="Необязательно"
            onChange={(event) => setComment(event.target.value)}
          />
        </label>

        <div className={styles.actions}>
          <button type="button" className={styles.submit} onClick={handleSubmit}>
            Добавить в смету
          </button>
        </div>
      </div>

      {status ? (
        <p
          className={styles.status}
          data-kind={status.kind}
          role="status"
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}
    </section>
  )
}
