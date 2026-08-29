import { useEffect, useMemo, useRef, useState } from 'react'

import {
  createEstimateZone,
  ESTIMATE_GENERAL_WORKS_TITLE,
  getWallZoneMappingOptions,
  WALL_ZONE_WORK_CATEGORIES,
  type EstimateZone,
  type WallZoneWorkCategoryId,
} from '@/entities/estimate'

import { validateEstimateZoneName } from '../model/estimate-zone-name'
import { EstimateNumberInput } from '../ui/EstimateNumberInput'
import { EstimateSelect } from '../ui/EstimateSelect'
import styles from '../floors/FloorZoneWorkAdd.module.scss'

const GENERAL_ZONE = '__general__'
const CUSTOM_ZONE = '__custom__'

type WallZoneWorkAddProps = {
  zones?: readonly EstimateZone[]
  onZonesChange?: (zones: EstimateZone[]) => void
  /** Без своей рамки/заголовка — внутри панели «Строки сметы». */
  embedded?: boolean
  onAdd: (params: {
    priceKey: string
    quantity: number
    zoneName: string
    zoneId?: string
    comment?: string
  }) => boolean
}

type StatusKind = 'success' | 'error' | 'info'

type StatusState = {
  kind: StatusKind
  message: string
}

const SUCCESS_CLEAR_MS = 4500

export function WallZoneWorkAdd({
  zones = [],
  onZonesChange,
  embedded = false,
  onAdd,
}: WallZoneWorkAddProps) {
  const [categoryId, setCategoryId] = useState<WallZoneWorkCategoryId>('demolition')
  const options = useMemo(() => getWallZoneMappingOptions(categoryId), [categoryId])
  const [priceKey, setPriceKey] = useState(() => options[0]?.id ?? '')
  const [zoneSelect, setZoneSelect] = useState(GENERAL_ZONE)
  const [customZoneName, setCustomZoneName] = useState('')
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

  const zoneSelectOptions = useMemo(
    () => [
      { value: GENERAL_ZONE, label: ESTIMATE_GENERAL_WORKS_TITLE },
      ...zones.map((zone) => ({ value: zone.id, label: `Зона: ${zone.name}` })),
      { value: CUSTOM_ZONE, label: 'Свободная зона…' },
    ],
    [zones],
  )

  const resolvedZoneSelect = useMemo(() => {
    if (zoneSelect === GENERAL_ZONE || zoneSelect === CUSTOM_ZONE) return zoneSelect
    if (zones.some((zone) => zone.id === zoneSelect)) return zoneSelect
    return GENERAL_ZONE
  }, [zones, zoneSelect])

  const categorySelectOptions = useMemo(
    () =>
      WALL_ZONE_WORK_CATEGORIES.map((category) => ({
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

  function handleCategoryChange(next: WallZoneWorkCategoryId) {
    setCategoryId(next)
    const nextOptions = getWallZoneMappingOptions(next)
    setPriceKey(nextOptions[0]?.id ?? '')
  }

  function handleSubmit() {
    if (!effectivePriceKey || !selectedWork) {
      setError('Выберите работу из списка')
      return
    }

    let zoneName = ''
    let zoneId: string | undefined
    let targetLabel = ESTIMATE_GENERAL_WORKS_TITLE

    if (resolvedZoneSelect === GENERAL_ZONE) {
      zoneName = ''
      zoneId = undefined
    } else {
      const selectedZone = zones.find((zone) => zone.id === resolvedZoneSelect)
      if (selectedZone) {
        zoneName = selectedZone.name
        zoneId = selectedZone.id
        targetLabel = `Зона: ${selectedZone.name}`
      } else {
        const zone = validateEstimateZoneName(customZoneName)
        if (!zone.ok) {
          setError(zone.message)
          return
        }
        if (!onZonesChange) {
          setError('Сначала добавьте зону в блоке «Зоны и замеры»')
          return
        }
        const created = createEstimateZone({ name: zone.value })
        onZonesChange([...zones, created])
        zoneName = created.name
        zoneId = created.id
        targetLabel = `Зона: ${created.name}`
      }
    }

    if (!(quantity > 0)) {
      setError('Укажите объём работы больше 0')
      return
    }

    const ok = onAdd({
      priceKey: effectivePriceKey,
      quantity,
      zoneName,
      zoneId,
      comment: comment.trim() || undefined,
    })
    if (!ok) {
      setError('Не удалось добавить работу')
      return
    }

    setSuccess(
      `Работа добавлена в смету: ${selectedWork.title}, ${targetLabel}, объём: ${quantity} ${selectedWork.unit}`,
    )
    setQuantity(0)
    setComment('')
  }

  return (
    <section
      className={embedded ? styles.embedded : styles.wrap}
      aria-labelledby={embedded ? undefined : 'wall-zone-work-add-title'}
    >
      {embedded ? (
        <p className={styles.embeddedHint}>
          Точечное исключение: одна работа из прайса для общих работ или зоны. Для типового набора
          используйте сценарий.
        </p>
      ) : (
        <div className={styles.head}>
          <h2 className={styles.title} id="wall-zone-work-add-title">
            Добавить работу из прайса
          </h2>
          <p className={styles.lead}>
            Точечное исключение: одна работа из прайса для общих работ или зоны.
          </p>
        </div>
      )}

      <div className={styles.form}>
        <div className={styles.field}>
          <span className={styles.label}>Тип</span>
          <EstimateSelect
            value={categoryId}
            options={categorySelectOptions}
            ariaLabel="Тип работы"
            onChange={(next) => handleCategoryChange(next as WallZoneWorkCategoryId)}
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

        <div className={styles.field}>
          <span className={styles.label}>Куда добавить</span>
          <EstimateSelect
            value={resolvedZoneSelect}
            options={zoneSelectOptions}
            ariaLabel="Общие работы или зона"
            onChange={setZoneSelect}
          />
        </div>

        {resolvedZoneSelect === CUSTOM_ZONE ? (
          <label className={styles.field}>
            <span className={styles.label}>Название свободной зоны</span>
            <input
              className={styles.control}
              value={customZoneName}
              placeholder="Кухня"
              maxLength={60}
              onChange={(event) => setCustomZoneName(event.target.value)}
            />
          </label>
        ) : null}

        <label className={styles.field} htmlFor="wall-zone-work-quantity">
          <span className={styles.label}>
            Площадь / метраж
            <span className={styles.unit}>{quantityUnit}</span>
          </span>
          <EstimateNumberInput
            id="wall-zone-work-quantity"
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
        <p className={styles.status} data-kind={status.kind} role="status" aria-live="polite">
          {status.message}
        </p>
      ) : null}
    </section>
  )
}
