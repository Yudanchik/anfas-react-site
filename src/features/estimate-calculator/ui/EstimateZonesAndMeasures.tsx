import { useState } from 'react'

import {
  createEstimateZone,
  ESTIMATE_ZONE_NAME_TEMPLATES,
  updateEstimateZone,
  type EstimateZone,
  type FloorEstimateInput,
  type WallEstimateInput,
} from '@/entities/estimate'

import { validateEstimateZoneName } from '../model/estimate-zone-name'
import { EstimateClearableInput } from './EstimateClearableInput'
import { EstimateConfirmDialog } from './EstimateConfirmDialog'
import { EstimateNumberInput } from './EstimateNumberInput'
import styles from './EstimateZonesAndMeasures.module.scss'

type EstimateZonesAndMeasuresProps =
  | {
      section: 'floors'
      zones: readonly EstimateZone[]
      onZonesChange: (zones: EstimateZone[]) => void
      onDeleteZone: (zoneId: string) => void
      generalInput: FloorEstimateInput
      onGeneralChange: (patch: Partial<FloorEstimateInput>) => void
    }
  | {
      section: 'walls'
      zones: readonly EstimateZone[]
      onZonesChange: (zones: EstimateZone[]) => void
      onDeleteZone: (zoneId: string) => void
      generalInput: WallEstimateInput
      onGeneralChange: (patch: Partial<WallEstimateInput>) => void
    }

function formatArea(value: number): string {
  return value > 0 ? String(value) : '—'
}

function floorGeneralSummary(input: FloorEstimateInput): string {
  return `Общая площадь пола ${formatArea(input.totalFloorArea)} м²`
}

function wallGeneralSummary(input: WallEstimateInput): string {
  return `Площадь стен ${formatArea(input.totalWallArea)} м²`
}

function floorZoneSummary(zone: EstimateZone): string {
  return `Площадь пола ${formatArea(zone.floorArea)} м² · Демонтаж пола ${formatArea(zone.demolitionFloorArea)} м²`
}

function wallZoneSummary(zone: EstimateZone): string {
  return `Площадь стен ${formatArea(zone.wallArea)} м² · Демонтаж стен ${formatArea(zone.demolitionWallArea)} м²`
}

export function EstimateZonesAndMeasures(props: EstimateZonesAndMeasuresProps) {
  const { zones, onZonesChange, onDeleteZone, section } = props
  const [draftName, setDraftName] = useState('')
  const [expandedId, setExpandedId] = useState<string | 'general' | null>('general')
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<EstimateZone | null>(null)

  function addZone(name: string) {
    const validated = validateEstimateZoneName(name)
    if (!validated.ok) {
      setError(validated.message)
      return
    }
    const zone = createEstimateZone({ name: validated.value })
    onZonesChange([...zones, zone])
    setDraftName('')
    setError(null)
    setExpandedId(zone.id)
  }

  function patchZone(zoneId: string, patch: Partial<Omit<EstimateZone, 'id'>>) {
    onZonesChange(updateEstimateZone(zones, zoneId, patch))
  }

  function confirmDeleteZone() {
    if (!pendingDelete) return
    onDeleteZone(pendingDelete.id)
    if (expandedId === pendingDelete.id) setExpandedId(null)
    setPendingDelete(null)
  }

  const titleId =
    section === 'floors' ? 'floor-zones-and-measures-title' : 'wall-zones-and-measures-title'

  return (
    <section className={styles.wrap} aria-labelledby={titleId}>
      <div className={styles.head}>
        <h2 className={styles.title} id={titleId}>
          Зоны и замеры
        </h2>
        <p className={styles.lead}>
          {section === 'floors'
            ? 'Общие замеры раздела — для работ без зоны. Ниже — площади выбранных зон для сценариев полов.'
            : 'Общие замеры раздела — для работ без зоны. Ниже — площади выбранных зон для сценариев стен.'}
        </p>
      </div>

      <ul className={styles.list}>
        <li className={styles.item} data-kind="general">
          <div
            className={styles.itemHead}
            data-open={expandedId === 'general' ? 'true' : 'false'}
          >
            <button
              type="button"
              className={styles.itemToggle}
              data-open={expandedId === 'general' ? 'true' : 'false'}
              aria-expanded={expandedId === 'general'}
              onClick={() => setExpandedId(expandedId === 'general' ? null : 'general')}
            >
              <span
                className={styles.chevron}
                data-open={expandedId === 'general' ? 'true' : 'false'}
                aria-hidden="true"
              />
              <span className={styles.itemCopy}>
                <span className={styles.itemName}>Общие работы</span>
                <span className={styles.itemMeta}>
                  {section === 'floors'
                    ? floorGeneralSummary(props.generalInput)
                    : wallGeneralSummary(props.generalInput)}
                </span>
              </span>
            </button>
          </div>
          {expandedId === 'general' ? (
            <div className={styles.editor}>
              {section === 'floors' ? (
                <FloorGeneralFields
                  input={props.generalInput}
                  onChange={props.onGeneralChange}
                />
              ) : (
                <WallGeneralFields
                  input={props.generalInput}
                  onChange={props.onGeneralChange}
                />
              )}
            </div>
          ) : null}
        </li>

        {zones.map((zone) => {
          const open = expandedId === zone.id
          return (
            <li key={zone.id} className={styles.item}>
              <div className={styles.itemHead} data-open={open ? 'true' : 'false'}>
                <button
                  type="button"
                  className={styles.itemToggle}
                  data-open={open ? 'true' : 'false'}
                  aria-expanded={open}
                  onClick={() => setExpandedId(open ? null : zone.id)}
                >
                  <span
                    className={styles.chevron}
                    data-open={open ? 'true' : 'false'}
                    aria-hidden="true"
                  />
                  <span className={styles.itemCopy}>
                    <span className={styles.itemName}>{zone.name}</span>
                    <span className={styles.itemMeta}>
                      {section === 'floors' ? floorZoneSummary(zone) : wallZoneSummary(zone)}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => setPendingDelete(zone)}
                >
                  Удалить
                </button>
              </div>
              {open ? (
                <div className={styles.editor}>
                  <ZoneNameField
                    key={zone.id}
                    zoneId={zone.id}
                    savedName={zone.name}
                    onCommit={(name) => patchZone(zone.id, { name })}
                  />
                  {section === 'floors' ? (
                    <FloorZoneFields zone={zone} onPatch={(patch) => patchZone(zone.id, patch)} />
                  ) : (
                    <WallZoneFields zone={zone} onPatch={(patch) => patchZone(zone.id, patch)} />
                  )}
                  <label className={styles.field}>
                    <span className={styles.label}>Комментарий</span>
                    <input
                      className={styles.control}
                      value={zone.comment ?? ''}
                      placeholder="Необязательно"
                      onChange={(event) => patchZone(zone.id, { comment: event.target.value })}
                    />
                  </label>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>

      <div className={styles.addBlock}>
        <div className={styles.templates}>
          {ESTIMATE_ZONE_NAME_TEMPLATES.map((name) => (
            <button
              key={name}
              type="button"
              className={styles.template}
              onClick={() => addZone(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className={styles.addRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${titleId}-new-zone`}>
              Новая зона
            </label>
            <EstimateClearableInput
              id={`${titleId}-new-zone`}
              value={draftName}
              placeholder="Например, Спальня"
              maxLength={60}
              clearAriaLabel="Очистить название зоны"
              onValueChange={(value) => {
                setDraftName(value)
                if (error) setError(null)
              }}
            />
          </div>
          <button type="button" className={styles.addBtn} onClick={() => addZone(draftName)}>
            Добавить зону
          </button>
        </div>
        {error ? (
          <p className={styles.error} role="status">
            {error}
          </p>
        ) : null}
      </div>

      <EstimateConfirmDialog
        open={pendingDelete !== null}
        title="Удалить зону?"
        description={
          pendingDelete
            ? `Будут удалены строки сметы, которые относятся к зоне «${pendingDelete.name}». Общие работы и другие зоны останутся.`
            : 'Будут удалены строки сметы, которые относятся к этой зоне. Общие работы и другие зоны останутся.'
        }
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDeleteZone}
      />
    </section>
  )
}

function ZoneNameField(props: {
  zoneId: string
  savedName: string
  onCommit: (name: string) => void
}) {
  const { zoneId, savedName, onCommit } = props
  const inputId = `zone-name-${zoneId}`
  const [draft, setDraft] = useState(savedName)
  const [fieldError, setFieldError] = useState<string | null>(null)

  function commitDraft() {
    const validated = validateEstimateZoneName(draft)
    if (!validated.ok) {
      setFieldError(validated.message)
      return
    }
    setFieldError(null)
    if (validated.value !== savedName) {
      onCommit(validated.value)
    }
    setDraft(validated.value)
  }

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        Название
      </label>
      <EstimateClearableInput
        id={inputId}
        value={draft}
        maxLength={60}
        aria-invalid={fieldError ? true : undefined}
        clearAriaLabel="Очистить название зоны"
        onValueChange={(value) => {
          setDraft(value)
          if (fieldError) setFieldError(null)
        }}
        onBlur={commitDraft}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            ;(event.target as HTMLInputElement).blur()
          }
        }}
      />
      {fieldError ? (
        <span className={styles.fieldError} role="status">
          {fieldError}
        </span>
      ) : null}
    </div>
  )
}

function FloorGeneralFields(props: {
  input: FloorEstimateInput
  onChange: (patch: Partial<FloorEstimateInput>) => void
}) {
  const { input, onChange } = props
  return (
    <>
      <div className={styles.grid}>
        <NumberField
          label="Общая площадь пола"
          unit="м²"
          value={input.totalFloorArea}
          onChange={(totalFloorArea) => onChange({ totalFloorArea })}
        />
        <NumberField
          label="Демонтаж пола"
          unit="м²"
          value={input.demolitionArea}
          onChange={(demolitionArea) => onChange({ demolitionArea })}
        />
        <NumberField
          label="Стяжка / выравнивание"
          unit="м²"
          value={input.screedArea}
          onChange={(screedArea) => onChange({ screedArea })}
        />
        <NumberField
          label="Мокрые зоны"
          unit="м²"
          value={input.wetZonesArea}
          onChange={(wetZonesArea) => onChange({ wetZonesArea })}
        />
        <NumberField
          label="Средний перепад"
          unit="мм"
          value={input.avgDeltaMm}
          onChange={(avgDeltaMm) => onChange({ avgDeltaMm })}
        />
      </div>
      <details className={styles.details}>
        <summary>Комментарий замерщика</summary>
        <textarea
          className={styles.comment}
          rows={2}
          value={input.surveyorComment ?? ''}
          onChange={(event) => onChange({ surveyorComment: event.target.value })}
        />
      </details>
    </>
  )
}

function WallGeneralFields(props: {
  input: WallEstimateInput
  onChange: (patch: Partial<WallEstimateInput>) => void
}) {
  const { input, onChange } = props
  return (
    <>
      <div className={styles.grid}>
        <NumberField
          label="Площадь стен"
          unit="м²"
          value={input.totalWallArea}
          onChange={(totalWallArea) => onChange({ totalWallArea })}
        />
        <NumberField
          label="Демонтаж стен"
          unit="м²"
          value={input.demolitionArea}
          onChange={(demolitionArea) => onChange({ demolitionArea })}
        />
        <NumberField
          label="Штукатурка"
          unit="м²"
          value={input.plasterArea}
          onChange={(plasterArea) => onChange({ plasterArea })}
        />
        <NumberField
          label="Шпаклёвка"
          unit="м²"
          value={input.puttyArea}
          onChange={(puttyArea) => onChange({ puttyArea })}
        />
        <NumberField
          label="Финиш"
          unit="м²"
          value={input.finishArea}
          onChange={(finishArea) => onChange({ finishArea })}
        />
        <NumberField
          label="Откосы"
          unit="м. пог."
          value={input.slopesLengthM}
          onChange={(slopesLengthM) => onChange({ slopesLengthM })}
        />
        <NumberField
          label="Углы"
          unit="м. пог."
          value={input.cornersLengthM}
          onChange={(cornersLengthM) => onChange({ cornersLengthM })}
        />
        <NumberField
          label="Высота"
          unit="м"
          value={input.wallHeightM}
          onChange={(wallHeightM) => onChange({ wallHeightM })}
        />
      </div>
      <details className={styles.details}>
        <summary>Комментарий замерщика</summary>
        <textarea
          className={styles.comment}
          rows={2}
          value={input.surveyorComment ?? ''}
          onChange={(event) => onChange({ surveyorComment: event.target.value })}
        />
      </details>
    </>
  )
}

function FloorZoneFields(props: {
  zone: EstimateZone
  onPatch: (patch: Partial<Omit<EstimateZone, 'id'>>) => void
}) {
  const { zone, onPatch } = props
  return (
    <div className={styles.grid}>
      <NumberField
        label="Общая площадь пола"
        unit="м²"
        value={zone.floorArea}
        onChange={(floorArea) => onPatch({ floorArea })}
      />
      <NumberField
        label="Демонтаж пола"
        unit="м²"
        value={zone.demolitionFloorArea}
        onChange={(demolitionFloorArea) => onPatch({ demolitionFloorArea })}
      />
      <NumberField
        label="Стяжка / выравнивание"
        unit="м²"
        value={zone.screedArea}
        onChange={(screedArea) => onPatch({ screedArea })}
      />
      <NumberField
        label="Мокрые зоны"
        unit="м²"
        value={zone.wetArea}
        onChange={(wetArea) => onPatch({ wetArea })}
      />
    </div>
  )
}

function WallZoneFields(props: {
  zone: EstimateZone
  onPatch: (patch: Partial<Omit<EstimateZone, 'id'>>) => void
}) {
  const { zone, onPatch } = props
  return (
    <div className={styles.grid}>
      <NumberField
        label="Площадь стен"
        unit="м²"
        value={zone.wallArea}
        onChange={(wallArea) => onPatch({ wallArea })}
      />
      <NumberField
        label="Демонтаж стен"
        unit="м²"
        value={zone.demolitionWallArea}
        onChange={(demolitionWallArea) => onPatch({ demolitionWallArea })}
      />
      <NumberField
        label="Штукатурка"
        unit="м²"
        value={zone.plasterArea}
        onChange={(plasterArea) => onPatch({ plasterArea })}
      />
      <NumberField
        label="Шпаклёвка"
        unit="м²"
        value={zone.puttyArea}
        onChange={(puttyArea) => onPatch({ puttyArea })}
      />
      <NumberField
        label="Финиш"
        unit="м²"
        value={zone.finishArea}
        onChange={(finishArea) => onPatch({ finishArea })}
      />
      <NumberField
        label="Откосы"
        unit="м. пог."
        value={zone.slopesLength}
        onChange={(slopesLength) => onPatch({ slopesLength })}
      />
      <NumberField
        label="Углы"
        unit="м. пог."
        value={zone.cornersLength}
        onChange={(cornersLength) => onPatch({ cornersLength })}
      />
    </div>
  )
}

function NumberField(props: {
  label: string
  unit: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>
        {props.label}
        <span className={styles.unit}>{props.unit}</span>
      </span>
      <EstimateNumberInput
        className={styles.control}
        value={props.value}
        onValueChange={props.onChange}
      />
    </label>
  )
}
