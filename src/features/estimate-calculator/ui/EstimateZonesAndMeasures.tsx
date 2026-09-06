import { useState } from 'react'

import {
  createEstimateZone,
  ESTIMATE_ZONE_TEMPLATES,
  ESTIMATE_ZONE_TYPE_OPTIONS,
  updateEstimateZone,
  type CeilingEstimateInput,
  type ElectricEstimateInput,
  type EstimateZone,
  type EstimateZoneType,
  type FloorEstimateInput,
  type TileEstimateInput,
  type WallEstimateInput,
} from '@/entities/estimate'

import { validateEstimateZoneName } from '../model/estimate-zone-name'
import { EstimateClearableInput } from './EstimateClearableInput'
import { EstimateConfirmDialog } from './EstimateConfirmDialog'
import { EstimateNumberInput } from './EstimateNumberInput'
import { EstimateSelect } from './EstimateSelect'
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
  | {
      section: 'ceilings'
      zones: readonly EstimateZone[]
      onZonesChange: (zones: EstimateZone[]) => void
      onDeleteZone: (zoneId: string) => void
      generalInput: CeilingEstimateInput
      onGeneralChange: (patch: Partial<CeilingEstimateInput>) => void
    }
  | {
      section: 'tile'
      zones: readonly EstimateZone[]
      onZonesChange: (zones: EstimateZone[]) => void
      onDeleteZone: (zoneId: string) => void
      generalInput: TileEstimateInput
      onGeneralChange: (patch: Partial<TileEstimateInput>) => void
    }
  | {
      section: 'electrics'
      zones: readonly EstimateZone[]
      onZonesChange: (zones: EstimateZone[]) => void
      onDeleteZone: (zoneId: string) => void
      generalInput: ElectricEstimateInput
      onGeneralChange: (patch: Partial<ElectricEstimateInput>) => void
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

function ceilingGeneralSummary(input: CeilingEstimateInput): string {
  return `Площадь потолков ${formatArea(input.totalCeilingArea)} м²`
}

function tileGeneralSummary(input: TileEstimateInput): string {
  return `Пол ${formatArea(input.floorTileArea)} м² · Стены ${formatArea(input.wallTileArea)} м²`
}

function electricGeneralSummary(input: ElectricEstimateInput): string {
  return `Розетки ${formatArea(input.electricSocketsCount)} · Свет ${formatArea(input.electricLightPointsCount)} · Кабель ${formatArea(input.electricCableLength)} м`
}

function floorZoneSummary(zone: EstimateZone): string {
  return `Площадь пола ${formatArea(zone.floorArea)} м² · Демонтаж пола ${formatArea(zone.demolitionFloorArea)} м²`
}

function wallZoneSummary(zone: EstimateZone): string {
  return `Площадь стен ${formatArea(zone.wallArea)} м² · Демонтаж стен ${formatArea(zone.demolitionWallArea)} м²`
}

function ceilingZoneSummary(zone: EstimateZone): string {
  return `Площадь потолков ${formatArea(zone.ceilingArea)} м² · Демонтаж потолков ${formatArea(zone.demolitionCeilingArea)} м²`
}

function tileZoneSummary(zone: EstimateZone): string {
  return `Пол ${formatArea(zone.tileFloorArea)} м² · Стены ${formatArea(zone.tileWallArea)} м²`
}

function electricZoneSummary(zone: EstimateZone): string {
  return `Розетки ${formatArea(zone.electricSocketsCount)} · Свет ${formatArea(zone.electricLightPointsCount)} · Кабель ${formatArea(zone.electricCableLength)} м`
}

function sectionTitleId(section: EstimateZonesAndMeasuresProps['section']): string {
  switch (section) {
    case 'floors':
      return 'floor-zones-and-measures-title'
    case 'walls':
      return 'wall-zones-and-measures-title'
    case 'ceilings':
      return 'ceiling-zones-and-measures-title'
    case 'tile':
      return 'tile-zones-and-measures-title'
    case 'electrics':
      return 'electric-zones-and-measures-title'
  }
}

function sectionLead(section: EstimateZonesAndMeasuresProps['section']): string {
  switch (section) {
    case 'floors':
      return 'Общие замеры раздела — для работ без зоны. Ниже — площади выбранных зон для сценариев полов.'
    case 'walls':
      return 'Общие замеры раздела — для работ без зоны. Ниже — площади выбранных зон для сценариев стен.'
    case 'ceilings':
      return 'Общие замеры раздела — для работ без зоны. Ниже — площади выбранных зон для сценариев потолков.'
    case 'tile':
      return 'Общие замеры раздела — для работ без зоны. Ниже — площади выбранных зон для сценариев плитки.'
    case 'electrics':
      return 'Общие счётчики раздела — для работ без зоны. Ниже — точки и трассы выбранных зон для сценариев электрики.'
  }
}

function generalSummary(props: EstimateZonesAndMeasuresProps): string {
  switch (props.section) {
    case 'floors':
      return floorGeneralSummary(props.generalInput)
    case 'walls':
      return wallGeneralSummary(props.generalInput)
    case 'ceilings':
      return ceilingGeneralSummary(props.generalInput)
    case 'tile':
      return tileGeneralSummary(props.generalInput)
    case 'electrics':
      return electricGeneralSummary(props.generalInput)
  }
}

function zoneSummary(
  section: EstimateZonesAndMeasuresProps['section'],
  zone: EstimateZone,
): string {
  switch (section) {
    case 'floors':
      return floorZoneSummary(zone)
    case 'walls':
      return wallZoneSummary(zone)
    case 'ceilings':
      return ceilingZoneSummary(zone)
    case 'tile':
      return tileZoneSummary(zone)
    case 'electrics':
      return electricZoneSummary(zone)
  }
}

export function EstimateZonesAndMeasures(props: EstimateZonesAndMeasuresProps) {
  const { zones, onZonesChange, onDeleteZone, section } = props
  const [draftName, setDraftName] = useState('')
  const [expandedId, setExpandedId] = useState<string | 'general' | null>('general')
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<EstimateZone | null>(null)

  function addZone(name: string, zoneType: EstimateZoneType = 'other') {
    const validated = validateEstimateZoneName(name)
    if (!validated.ok) {
      setError(validated.message)
      return
    }
    const zone = createEstimateZone({
      name: validated.value,
      fields: { zoneType },
    })
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

  const titleId = sectionTitleId(section)

  return (
    <section className={styles.wrap} aria-labelledby={titleId}>
      <div className={styles.head}>
        <h2 className={styles.title} id={titleId}>
          Зоны и замеры
        </h2>
        <p className={styles.lead}>{sectionLead(section)}</p>
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
                <span className={styles.itemMeta}>{generalSummary(props)}</span>
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
              ) : section === 'walls' ? (
                <WallGeneralFields
                  input={props.generalInput}
                  onChange={props.onGeneralChange}
                />
              ) : section === 'ceilings' ? (
                <CeilingGeneralFields
                  input={props.generalInput}
                  onChange={props.onGeneralChange}
                />
              ) : section === 'tile' ? (
                <TileGeneralFields
                  input={props.generalInput}
                  onChange={props.onGeneralChange}
                />
              ) : (
                <ElectricGeneralFields
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
                    <span className={styles.itemMeta}>{zoneSummary(section, zone)}</span>
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
                  <div className={styles.field}>
                    <span className={styles.label}>Тип зоны</span>
                    <EstimateSelect
                      value={zone.zoneType}
                      options={ESTIMATE_ZONE_TYPE_OPTIONS}
                      ariaLabel={`Тип зоны ${zone.name}`}
                      onChange={(next) =>
                        patchZone(zone.id, { zoneType: next as EstimateZoneType })
                      }
                    />
                  </div>
                  {section === 'floors' ? (
                    <FloorZoneFields zone={zone} onPatch={(patch) => patchZone(zone.id, patch)} />
                  ) : section === 'walls' ? (
                    <WallZoneFields zone={zone} onPatch={(patch) => patchZone(zone.id, patch)} />
                  ) : section === 'ceilings' ? (
                    <CeilingZoneFields zone={zone} onPatch={(patch) => patchZone(zone.id, patch)} />
                  ) : section === 'tile' ? (
                    <TileZoneFields zone={zone} onPatch={(patch) => patchZone(zone.id, patch)} />
                  ) : (
                    <ElectricZoneFields zone={zone} onPatch={(patch) => patchZone(zone.id, patch)} />
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
          {ESTIMATE_ZONE_TEMPLATES.map((template) => (
            <button
              key={template.name}
              type="button"
              className={styles.template}
              onClick={() => addZone(template.name, template.zoneType)}
            >
              {template.name}
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

function CeilingGeneralFields(props: {
  input: CeilingEstimateInput
  onChange: (patch: Partial<CeilingEstimateInput>) => void
}) {
  const { input, onChange } = props
  return (
    <>
      <div className={styles.grid}>
        <NumberField
          label="Площадь потолков"
          unit="м²"
          value={input.totalCeilingArea}
          onChange={(totalCeilingArea) => onChange({ totalCeilingArea })}
        />
        <NumberField
          label="Демонтаж потолков"
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

function CeilingZoneFields(props: {
  zone: EstimateZone
  onPatch: (patch: Partial<Omit<EstimateZone, 'id'>>) => void
}) {
  const { zone, onPatch } = props
  return (
    <div className={styles.grid}>
      <NumberField
        label="Площадь потолков"
        unit="м²"
        value={zone.ceilingArea}
        onChange={(ceilingArea) => onPatch({ ceilingArea })}
      />
      <NumberField
        label="Демонтаж потолков"
        unit="м²"
        value={zone.demolitionCeilingArea}
        onChange={(demolitionCeilingArea) => onPatch({ demolitionCeilingArea })}
      />
      <NumberField
        label="Штукатурка"
        unit="м²"
        value={zone.plasterCeilingArea}
        onChange={(plasterCeilingArea) => onPatch({ plasterCeilingArea })}
      />
      <NumberField
        label="Шпаклёвка"
        unit="м²"
        value={zone.puttyCeilingArea}
        onChange={(puttyCeilingArea) => onPatch({ puttyCeilingArea })}
      />
      <NumberField
        label="Финиш"
        unit="м²"
        value={zone.finishCeilingArea}
        onChange={(finishCeilingArea) => onPatch({ finishCeilingArea })}
      />
    </div>
  )
}

function TileGeneralFields(props: {
  input: TileEstimateInput
  onChange: (patch: Partial<TileEstimateInput>) => void
}) {
  const { input, onChange } = props
  return (
    <>
      <div className={styles.grid}>
        <NumberField
          label="Плитка пола"
          unit="м²"
          value={input.floorTileArea}
          onChange={(floorTileArea) => onChange({ floorTileArea })}
        />
        <NumberField
          label="Плитка стен"
          unit="м²"
          value={input.wallTileArea}
          onChange={(wallTileArea) => onChange({ wallTileArea })}
        />
        <NumberField
          label="Фартук"
          unit="м²"
          value={input.backsplashArea}
          onChange={(backsplashArea) => onChange({ backsplashArea })}
        />
        <NumberField
          label="Подрезка / кромка"
          unit="м. пог."
          value={input.cuttingLength}
          onChange={(cuttingLength) => onChange({ cuttingLength })}
        />
        <NumberField
          label="Углы / примыкания"
          unit="м. пог."
          value={input.cornerLength}
          onChange={(cornerLength) => onChange({ cornerLength })}
        />
        <NumberField
          label="Отверстия"
          unit="шт."
          value={input.holesCount}
          onChange={(holesCount) => onChange({ holesCount })}
        />
        <NumberField
          label="Замена плитки"
          unit="шт."
          value={input.repairCount}
          onChange={(repairCount) => onChange({ repairCount })}
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

function TileZoneFields(props: {
  zone: EstimateZone
  onPatch: (patch: Partial<Omit<EstimateZone, 'id'>>) => void
}) {
  const { zone, onPatch } = props
  return (
    <div className={styles.grid}>
      <NumberField
        label="Плитка пола"
        unit="м²"
        value={zone.tileFloorArea}
        onChange={(tileFloorArea) => onPatch({ tileFloorArea })}
      />
      <NumberField
        label="Плитка стен"
        unit="м²"
        value={zone.tileWallArea}
        onChange={(tileWallArea) => onPatch({ tileWallArea })}
      />
      <NumberField
        label="Фартук"
        unit="м²"
        value={zone.tileBacksplashArea}
        onChange={(tileBacksplashArea) => onPatch({ tileBacksplashArea })}
      />
      <NumberField
        label="Подрезка / кромка"
        unit="м. пог."
        value={zone.tileCuttingLength}
        onChange={(tileCuttingLength) => onPatch({ tileCuttingLength })}
      />
      <NumberField
        label="Углы / примыкания"
        unit="м. пог."
        value={zone.tileCornerLength}
        onChange={(tileCornerLength) => onPatch({ tileCornerLength })}
      />
      <NumberField
        label="Отверстия"
        unit="шт."
        value={zone.tileHolesCount}
        onChange={(tileHolesCount) => onPatch({ tileHolesCount })}
      />
      <NumberField
        label="Замена плитки"
        unit="шт."
        value={zone.tileRepairCount}
        onChange={(tileRepairCount) => onPatch({ tileRepairCount })}
      />
    </div>
  )
}

function ElectricGeneralFields(props: {
  input: ElectricEstimateInput
  onChange: (patch: Partial<ElectricEstimateInput>) => void
}) {
  const { input, onChange } = props
  return (
    <>
      <ElectricMeasureGroups
        values={{
          electricSocketsCount: input.electricSocketsCount,
          electricSwitchesCount: input.electricSwitchesCount,
          electricLightPointsCount: input.electricLightPointsCount,
          electricDataPointsCount: input.electricDataPointsCount,
          electricStrobeLength: input.electricStrobeLength,
          electricCableLength: input.electricCableLength,
          electricSocketBoxesCount: input.electricSocketBoxesCount,
          electricJunctionBoxesCount: input.electricJunctionBoxesCount,
          electricPanelModulesCount: input.electricPanelModulesCount,
          electricWarmFloorArea: input.electricWarmFloorArea,
          electricApplianceConnectionsCount: input.electricApplianceConnectionsCount,
        }}
        onChange={onChange}
      />
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

function ElectricZoneFields(props: {
  zone: EstimateZone
  onPatch: (patch: Partial<Omit<EstimateZone, 'id'>>) => void
}) {
  const { zone, onPatch } = props
  return (
    <ElectricMeasureGroups
      values={{
        electricSocketsCount: zone.electricSocketsCount,
        electricSwitchesCount: zone.electricSwitchesCount,
        electricLightPointsCount: zone.electricLightPointsCount,
        electricDataPointsCount: zone.electricDataPointsCount,
        electricStrobeLength: zone.electricStrobeLength,
        electricCableLength: zone.electricCableLength,
        electricSocketBoxesCount: zone.electricSocketBoxesCount,
        electricJunctionBoxesCount: zone.electricJunctionBoxesCount,
        electricPanelModulesCount: zone.electricPanelModulesCount,
        electricWarmFloorArea: zone.electricWarmFloorArea,
        electricApplianceConnectionsCount: zone.electricApplianceConnectionsCount,
      }}
      onChange={onPatch}
    />
  )
}

type ElectricMeasureValues = {
  electricSocketsCount: number
  electricSwitchesCount: number
  electricLightPointsCount: number
  electricDataPointsCount: number
  electricStrobeLength: number
  electricCableLength: number
  electricSocketBoxesCount: number
  electricJunctionBoxesCount: number
  electricPanelModulesCount: number
  electricWarmFloorArea: number
  electricApplianceConnectionsCount: number
}

function ElectricMeasureGroups(props: {
  values: ElectricMeasureValues
  onChange: (patch: Partial<ElectricMeasureValues>) => void
}) {
  const { values, onChange } = props
  return (
    <div className={styles.measureGroups}>
      <div className={styles.measureGroup}>
        <p className={styles.measureGroupTitle}>Точки</p>
        <div className={styles.grid}>
          <NumberField
            label="Розетки"
            unit="шт."
            value={values.electricSocketsCount}
            onChange={(electricSocketsCount) => onChange({ electricSocketsCount })}
          />
          <NumberField
            label="Выключатели"
            unit="шт."
            value={values.electricSwitchesCount}
            onChange={(electricSwitchesCount) => onChange({ electricSwitchesCount })}
          />
          <NumberField
            label="Световые точки"
            unit="шт."
            value={values.electricLightPointsCount}
            onChange={(electricLightPointsCount) => onChange({ electricLightPointsCount })}
          />
          <NumberField
            label="Слаботочка"
            unit="шт."
            value={values.electricDataPointsCount}
            onChange={(electricDataPointsCount) => onChange({ electricDataPointsCount })}
          />
          <NumberField
            label="Подрозетники"
            unit="шт."
            value={values.electricSocketBoxesCount}
            onChange={(electricSocketBoxesCount) => onChange({ electricSocketBoxesCount })}
          />
          <NumberField
            label="Распаечные коробки"
            unit="шт."
            value={values.electricJunctionBoxesCount}
            onChange={(electricJunctionBoxesCount) => onChange({ electricJunctionBoxesCount })}
          />
        </div>
      </div>

      <div className={styles.measureGroup}>
        <p className={styles.measureGroupTitle}>Трассы</p>
        <div className={styles.grid}>
          <NumberField
            label="Штробы"
            unit="м. пог."
            value={values.electricStrobeLength}
            onChange={(electricStrobeLength) => onChange({ electricStrobeLength })}
          />
          <NumberField
            label="Кабель"
            unit="м. пог."
            value={values.electricCableLength}
            onChange={(electricCableLength) => onChange({ electricCableLength })}
          />
        </div>
      </div>

      <div className={styles.measureGroup}>
        <p className={styles.measureGroupTitle}>Щит</p>
        <div className={styles.grid}>
          <NumberField
            label="Модули щита"
            unit="шт."
            value={values.electricPanelModulesCount}
            onChange={(electricPanelModulesCount) => onChange({ electricPanelModulesCount })}
          />
        </div>
      </div>

      <div className={styles.measureGroup}>
        <p className={styles.measureGroupTitle}>Тёплый пол / техника</p>
        <div className={styles.grid}>
          <NumberField
            label="Эл. тёплый пол"
            unit="м²"
            value={values.electricWarmFloorArea}
            onChange={(electricWarmFloorArea) => onChange({ electricWarmFloorArea })}
          />
          <NumberField
            label="Подключения техники"
            unit="шт."
            value={values.electricApplianceConnectionsCount}
            onChange={(electricApplianceConnectionsCount) =>
              onChange({ electricApplianceConnectionsCount })
            }
          />
        </div>
      </div>
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
