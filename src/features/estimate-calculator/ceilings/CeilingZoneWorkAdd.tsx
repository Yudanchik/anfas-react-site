import type { EstimateLine } from '@/entities/estimate'
import { EstimateConfirmDialog } from '../ui/EstimateConfirmDialog'
import { useRoomWorkQuantity } from '../model/use-room-work-quantity'
import { useMemo, useState } from 'react'

import {
  createEstimateZone,
  ESTIMATE_GENERAL_WORKS_TITLE,
  getCeilingZoneMappingOptions,
  CEILING_ZONE_WORK_CATEGORIES,
  type CeilingPriceMappingItem,
  type CeilingZoneWorkCategoryId,
  type EstimateZone,
} from '@/entities/estimate'

import { validateEstimateZoneName } from '../model/estimate-zone-name'
import { useEstimateStatusMessage } from '../model/use-estimate-status-message'
import { EstimateNumberInput } from '../ui/EstimateNumberInput'
import { EstimateSelect } from '../ui/EstimateSelect'
import styles from '../floors/FloorZoneWorkAdd.module.scss'

const GENERAL_ZONE = '__general__'
const CUSTOM_ZONE = '__custom__'

type CeilingZoneWorkAddProps = {
  lines?: readonly EstimateLine[]
  zones?: readonly EstimateZone[]
  onZonesChange?: (zones: EstimateZone[]) => void
  /** Без своей рамки/заголовка — внутри панели «Строки сметы». */
  embedded?: boolean
  feedbackEpoch?: number
  mapping?: readonly CeilingPriceMappingItem[]
  onAdd: (params: {
    priceKey: string
    quantity: number
    zoneName: string
    zoneId?: string
    comment?: string
  }) => boolean
}

export function CeilingZoneWorkAdd({
  lines = [],
  zones = [],
  onZonesChange,
  embedded = false,
  feedbackEpoch,
  mapping,
  onAdd,
}: CeilingZoneWorkAddProps) {
  const [categoryId, setCategoryId] = useState<CeilingZoneWorkCategoryId>('demolition')
  const options = useMemo(
    () => getCeilingZoneMappingOptions(categoryId, mapping),
    [categoryId, mapping],
  )
  const [priceKey, setPriceKey] = useState(() => options[0]?.id ?? '')
  const [zoneSelect, setZoneSelect] = useState('')
  const [customZoneName, setCustomZoneName] = useState('')
  const [confirmDuplicate, setConfirmDuplicate] = useState(false)
  const [comment, setComment] = useState('')
  const { status, setSuccess, setError } = useEstimateStatusMessage({
    clearTokens: feedbackEpoch === undefined ? [] : [feedbackEpoch],
  })

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
    return zones[0]?.id ?? GENERAL_ZONE
  }, [zones, zoneSelect])

  const { quantity, setQuantity, resetQuantity, useMeasure, suggestion } = useRoomWorkQuantity(
    'ceilings',
    zones.find((zone) => zone.id === resolvedZoneSelect),
    selectedWork,
  )

  const categorySelectOptions = useMemo(
    () =>
      CEILING_ZONE_WORK_CATEGORIES.map((category) => ({
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

  function handleCategoryChange(next: CeilingZoneWorkCategoryId) {
    setCategoryId(next)
    const nextOptions = getCeilingZoneMappingOptions(next, mapping)
    setPriceKey(nextOptions[0]?.id ?? '')
  }

  function handleSubmit() {
    const alreadyExists = lines.some(
      (line) =>
        line.enabled &&
        line.priceKey === effectivePriceKey &&
        (resolvedZoneSelect === GENERAL_ZONE
          ? !line.zoneId && !line.zoneName
          : line.zoneId === resolvedZoneSelect),
    )
    if (quantity > 0 && alreadyExists && resolvedZoneSelect !== GENERAL_ZONE)
      setConfirmDuplicate(true)
    else handleConfirmedSubmit()
  }

  function handleConfirmedSubmit() {
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
    resetQuantity()
    setComment('')
  }

  return (
    <section
      className={embedded ? styles.embedded : styles.wrap}
      aria-labelledby={embedded ? undefined : 'ceiling-zone-work-add-title'}
    >
      {embedded ? (
        <p className={styles.embeddedHint}>
          Точечное исключение: одна работа из прайса для общих работ или зоны. Для типового набора
          используйте сценарий.
        </p>
      ) : (
        <div className={styles.head}>
          <h2 className={styles.title} id="ceiling-zone-work-add-title">
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
            onChange={(next) => handleCategoryChange(next as CeilingZoneWorkCategoryId)}
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

        <p className={styles.embeddedHint}>
          {suggestion.reason}{' '}
          {suggestion.quantity > 0 ? (
            <button type="button" onClick={useMeasure}>
              Подставить замер: {suggestion.quantity} {quantityUnit}
            </button>
          ) : null}
        </p>
        <label className={styles.field} htmlFor="ceiling-zone-work-quantity">
          <span className={styles.label}>
            Площадь / метраж
            <span className={styles.unit}>{quantityUnit}</span>
          </span>
          <EstimateNumberInput
            id="ceiling-zone-work-quantity"
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
      <EstimateConfirmDialog
        open={confirmDuplicate}
        title="Добавить ещё одну строку этой работы?"
        description="Такая работа уже включена в выбранном помещении. Повторное добавление может увеличить итог дважды. Для исправления количества используйте существующую строку; отдельную строку добавляйте для другого участка."
        confirmLabel="Добавить отдельную строку"
        cancelLabel="Отмена"
        onCancel={() => setConfirmDuplicate(false)}
        onConfirm={() => {
          setConfirmDuplicate(false)
          handleConfirmedSubmit()
        }}
      />
    </section>
  )
}
