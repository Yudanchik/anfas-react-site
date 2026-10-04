import { useId, useState } from 'react'

import {
  createEstimateZone,
  formatWallScenarioLabel,
  getWallScenarioProgress,
  patchElectricPoints,
  patchPlumbingFixturePoints,
  ESTIMATE_ZONE_TEMPLATES,
  ESTIMATE_ZONE_TYPE_OPTIONS,
  updateEstimateZone,
  type CeilingEstimateInput,
  type ElectricEstimateInput,
  type EstimateZone,
  type EstimateLine,
  type EstimateZoneType,
  type FloorEstimateInput,
  type PlumbingEstimateInput,
  type TileEstimateInput,
  type WallEstimateInput,
} from '@/entities/estimate'

import { getRoomScenarioStatus } from '../model/room-scenario-status'
import { validateEstimateZoneName } from '../model/estimate-zone-name'
import { MEASURE_FIELD_HINTS } from '../model/measure-field-hints'
import { EstimateFieldHint } from './EstimateFieldHint'
import { EstimateClearableInput } from './EstimateClearableInput'
import { EstimateConfirmDialog } from './EstimateConfirmDialog'
import { EstimateNumberInput } from './EstimateNumberInput'
import { EstimateSelect } from './EstimateSelect'
import { WallMeasurementEditor } from './WallMeasurementEditor'
import styles from './EstimateZonesAndMeasures.module.scss'

type EstimateZonesAndMeasuresProps = { lines?: readonly EstimateLine[] } & (
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
      wallLines: readonly EstimateLine[]
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
  | {
      section: 'plumbing'
      zones: readonly EstimateZone[]
      onZonesChange: (zones: EstimateZone[]) => void
      onDeleteZone: (zoneId: string) => void
      generalInput: PlumbingEstimateInput
      onGeneralChange: (patch: Partial<PlumbingEstimateInput>) => void
    }
)

function formatArea(value: number): string {
  return value > 0 ? String(value) : '—'
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

function plumbingZoneSummary(zone: EstimateZone): string {
  return `Точки воды ${formatArea(zone.plumbingWaterPointsCount)} · Канализация ${formatArea(zone.plumbingSewerPointsCount)} · ТП ${formatArea(zone.plumbingWarmFloorArea)} м²`
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
    case 'plumbing':
      return 'plumbing-zones-and-measures-title'
  }
}

function sectionLead(section: EstimateZonesAndMeasuresProps['section']): string {
  switch (section) {
    case 'floors':
      return 'Добавьте помещения и укажите площади пола. Если размеры комнаты уже заполнены на вкладке стен, площадь пола подставится автоматически.'
    case 'walls':
      return 'Добавьте помещение, укажите размеры стен и проёмов. Ниже выберите отделку — сценарий возьмёт замеры выбранной комнаты.'
    case 'ceilings':
      return 'Укажите площадь потолка по помещениям. Размеры комнаты со вкладки стен уже используются для расчёта; отдельные объёмы можно уточнить.'
    case 'tile':
      return 'Укажите площади облицовки и дополнительные замеры по каждому помещению.'
    case 'electrics':
      return 'Посчитайте точки и замерьте трассы в каждом помещении. Подрозетники рассчитываются по розеткам, выключателям и слаботочным точкам.'
    case 'plumbing':
      return 'Начните со списка приборов помещения, затем уточните выводы и длины труб.'
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
    case 'plumbing':
      return plumbingZoneSummary(zone)
  }
}

export function EstimateZonesAndMeasures(props: EstimateZonesAndMeasuresProps) {
  const { zones, onZonesChange, onDeleteZone, section } = props
  const [draftName, setDraftName] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
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
      fields: {
        zoneType,
        plumbingPointsMode: 'fixtures',
        plumbingFixtureCountsMode: 'auto',
        plumbingOldToiletsCount: 0,
        plumbingOldSinksCount: 0,
        plumbingOldBathtubsCount: 0,
        plumbingOldMixersCount: 0,

        electricOldSocketsCount: 0,
        electricOldSwitchesCount: 0,
        electricOldLightPointsCount: 0,
        electricOldCableLength: 0,
      },
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
          Помещения и замеры
        </h2>
        <p className={styles.lead}>{sectionLead(section)}</p>
      </div>

      <ul className={styles.list}>
        {zones.map((zone) => {
          const open = expandedId === zone.id
          const scenarioProgress =
            section === 'walls' ? getWallScenarioProgress(zone, props.wallLines) : null
          const otherProgress =
            section !== 'walls' ? getRoomScenarioStatus(section, zone, props.lines ?? []) : null
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
                    {scenarioProgress ? (
                      <span className={styles.scenarioBadge} data-state={scenarioProgress}>
                        {scenarioProgress === 'pending'
                          ? 'Работы по стенам ещё не добавлены'
                          : scenarioProgress === 'unknown'
                            ? 'Работы есть · сценарий не отмечен'
                            : scenarioProgress === 'review'
                              ? 'Сценарий стен · проверить изменения'
                              : `Сценарий стен: ${formatWallScenarioLabel(zone.wallScenario!.application)}`}
                      </span>
                    ) : null}
                    {otherProgress ? (
                      <span
                        className={styles.scenarioBadge}
                        data-state={otherProgress.applied ? 'applied' : 'pending'}
                      >
                        {otherProgress.text}
                      </span>
                    ) : null}
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => setPendingDelete(zone)}
                >
                  Убрать из раздела
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
                  {section !== 'walls' ? (
                    <div className={styles.field}>
                      <span className={styles.label}>Тип помещения</span>
                      <EstimateSelect
                        value={zone.zoneType}
                        options={ESTIMATE_ZONE_TYPE_OPTIONS}
                        ariaLabel={`Тип помещения ${zone.name}`}
                        onChange={(next) =>
                          patchZone(zone.id, { zoneType: next as EstimateZoneType })
                        }
                      />
                    </div>
                  ) : null}
                  {section === 'floors' ? (
                    <FloorZoneFields zone={zone} onPatch={(patch) => patchZone(zone.id, patch)} />
                  ) : section === 'walls' ? (
                    <>
                      <WallMeasurementEditor
                        zone={zone}
                        onPatch={(patch) => patchZone(zone.id, patch)}
                      />
                      <details className={styles.details}>
                        <summary>
                          Уточнить объёмы отдельных работ
                          {zone.demolitionWallArea ||
                          zone.plasterArea ||
                          zone.puttyArea ||
                          zone.finishArea ||
                          zone.cornersLength
                            ? ' · задано'
                            : ''}
                        </summary>
                        <p className={styles.advancedHint}>
                          Эти поля меняют количество работы, но сами не добавляют строку в смету.
                          Например, 12 м² в «Демонтаж стен» подставятся в сценарий «Только
                          демонтаж». В сценарии «После демонтажа» демонтаж уже считается выполненным
                          и не добавляется. Если площадь демонтажа, штукатурки, шпаклёвки или финиша
                          равна нулю, сценарий берёт общую площадь стен. Откосы и углы задаются
                          отдельно в погонных метрах.
                        </p>
                        <WallZoneFields
                          zone={zone}
                          onPatch={(patch) => patchZone(zone.id, patch)}
                        />
                      </details>
                    </>
                  ) : section === 'ceilings' ? (
                    <CeilingZoneFields zone={zone} onPatch={(patch) => patchZone(zone.id, patch)} />
                  ) : section === 'tile' ? (
                    <TileZoneFields zone={zone} onPatch={(patch) => patchZone(zone.id, patch)} />
                  ) : section === 'electrics' ? (
                    <ElectricZoneFields
                      zone={zone}
                      onPatch={(patch) => patchZone(zone.id, patch)}
                    />
                  ) : (
                    <PlumbingZoneFields
                      zone={zone}
                      onPatch={(patch) => patchZone(zone.id, patch)}
                    />
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
              Новое помещение
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
            Добавить помещение
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
        title="Убрать помещение из этого раздела?"
        description={
          pendingDelete
            ? `Помещение «${pendingDelete.name}» будет убрано только из этого раздела. Его строки в этом разделе будут удалены. Замеры и работы в остальных разделах сохранятся. Помещение можно вернуть, но удалённые строки потребуется добавить заново.`
            : 'Будут удалены строки сметы, которые относятся к этой зоне. Общие работы и другие зоны останутся.'
        }
        confirmLabel="Убрать из раздела"
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
        label="Площадь демонтажа стен"
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
      <NumberField
        label="Стыки листов ГКЛ на стенах"
        unit="м. пог."
        value={zone.gklWallSeamsLength ?? 0}
        onChange={(gklWallSeamsLength) => onPatch({ gklWallSeamsLength })}
      />
    </div>
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
      <NumberField
        label="Стыки листов ГКЛ на потолке"
        unit="м. пог."
        value={zone.gklCeilingSeamsLength ?? 0}
        onChange={(gklCeilingSeamsLength) => onPatch({ gklCeilingSeamsLength })}
      />
    </div>
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

function ElectricZoneFields(props: {
  zone: EstimateZone
  onPatch: (patch: Partial<Omit<EstimateZone, 'id'>>) => void
}) {
  const { zone, onPatch } = props
  return (
    <>
      <details className={styles.details}>
        <summary>Демонтаж старой электрики</summary>
        <p className={styles.measureHint}>
          Отдельные объёмы снимаемой электрики. Новые точки ниже не определяют объём демонтажа. В
          старых сметах уточните эти поля перед повторным применением.
        </p>
        <div className={styles.grid}>
          <NumberField
            label="Старые розетки"
            unit="шт."
            value={zone.electricOldSocketsCount ?? 0}
            onChange={(electricOldSocketsCount) => onPatch({ electricOldSocketsCount })}
          />
          <NumberField
            label="Старые выключатели"
            unit="шт."
            value={zone.electricOldSwitchesCount ?? 0}
            onChange={(electricOldSwitchesCount) => onPatch({ electricOldSwitchesCount })}
          />
          <NumberField
            label="Старые светильники"
            unit="шт."
            value={zone.electricOldLightPointsCount ?? 0}
            onChange={(electricOldLightPointsCount) => onPatch({ electricOldLightPointsCount })}
          />
          <NumberField
            label="Старый кабель"
            unit="м. пог."
            value={zone.electricOldCableLength ?? 0}
            onChange={(electricOldCableLength) => onPatch({ electricOldCableLength })}
          />
        </div>
      </details>
      <details className={styles.details}>
        <summary>Разделить кабель по способам прокладки</summary>
        <p className={styles.measureHint}>
          Введите метры каждого кабеля: например, 80 м открыто и 20 м в штробе. Новые штробы
          измеряйте отдельно: два кабеля в одной штробе не удваивают её длину. Для готовой штробы
          укажите 0 м штробления.
        </p>
        <div className={styles.grid}>
          <NumberField
            label="Кабель открыто на крепёж"
            unit="м. пог."
            value={zone.electricCableOpenLength ?? 0}
            onChange={(electricCableOpenLength) =>
              onPatch({
                electricCableOpenLength,
                electricCableChaseLength: zone.electricCableChaseLength ?? 0,
                electricCableLength: electricCableOpenLength + (zone.electricCableChaseLength ?? 0),
              })
            }
          />
          <NumberField
            label="Кабель в штробе"
            unit="м. пог."
            value={zone.electricCableChaseLength ?? 0}
            onChange={(electricCableChaseLength) =>
              onPatch({
                electricCableChaseLength,
                electricCableOpenLength: zone.electricCableOpenLength ?? 0,
                electricCableLength: electricCableChaseLength + (zone.electricCableOpenLength ?? 0),
              })
            }
          />
        </div>
        {zone.electricCableOpenLength !== undefined ||
        zone.electricCableChaseLength !== undefined ? (
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() =>
              onPatch({ electricCableOpenLength: undefined, electricCableChaseLength: undefined })
            }
          >
            Использовать общий метраж
          </button>
        ) : null}
      </details>
      <ElectricMeasureGroups
        values={{
          electricSocketsCount: zone.electricSocketsCount,
          electricSwitchesCount: zone.electricSwitchesCount,
          electricLightPointsCount: zone.electricLightPointsCount,
          electricDataPointsCount: zone.electricDataPointsCount,
          electricStrobeLength: zone.electricStrobeLength,
          electricCableLength: zone.electricCableLength,
          electricCableOpenLength: zone.electricCableOpenLength,
          electricCableChaseLength: zone.electricCableChaseLength,
          electricSocketBoxesCount: zone.electricSocketBoxesCount,
          electricJunctionBoxesCount: zone.electricJunctionBoxesCount,
          electricPanelModulesCount: zone.electricPanelModulesCount,
          electricWarmFloorArea: zone.electricWarmFloorArea,
          electricApplianceConnectionsCount: zone.electricApplianceConnectionsCount,
        }}
        onChange={onPatch}
      />
    </>
  )
}

type ElectricMeasureValues = {
  electricCableOpenLength?: number
  electricCableChaseLength?: number
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
  const changePoints = (patch: Partial<ElectricMeasureValues>) =>
    onChange(patchElectricPoints(values, patch))
  return (
    <div className={styles.measureGroups}>
      <div className={styles.measureGroup}>
        <p className={styles.measureGroupTitle}>Точки</p>
        <div className={styles.grid}>
          <NumberField
            label="Розетки"
            unit="шт."
            value={values.electricSocketsCount}
            onChange={(electricSocketsCount) => changePoints({ electricSocketsCount })}
          />
          <NumberField
            label="Выключатели"
            unit="шт."
            value={values.electricSwitchesCount}
            onChange={(electricSwitchesCount) => changePoints({ electricSwitchesCount })}
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
            onChange={(electricDataPointsCount) => changePoints({ electricDataPointsCount })}
          />
          <NumberField
            label="Подрозетники"
            unit="шт."
            value={values.electricSocketBoxesCount}
            onChange={(electricSocketBoxesCount) => onChange({ electricSocketBoxesCount })}
          />
          <p className={styles.measureHint}>
            Считаются по розеткам, выключателям и слаботочным точкам. Для накладных или уже готовых
            мест исправьте число вручную.
          </p>
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
            disabled={
              values.electricCableOpenLength !== undefined ||
              values.electricCableChaseLength !== undefined
            }
            unit="м. пог."
            value={values.electricCableLength}
            onChange={(electricCableLength) =>
              onChange({
                electricCableLength,
                electricCableOpenLength: undefined,
                electricCableChaseLength: undefined,
              })
            }
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

function PlumbingZoneFields(props: {
  zone: EstimateZone
  onPatch: (patch: Partial<Omit<EstimateZone, 'id'>>) => void
}) {
  const { zone, onPatch } = props
  return (
    <>
      <details className={styles.details}>
        <summary>Демонтаж старой сантехники</summary>
        <p className={styles.measureHint}>
          Сколько приборов снимаем. Новые приборы заполняйте ниже: их количество может отличаться.
        </p>
        <div className={styles.grid}>
          <NumberField
            label="Старые унитазы"
            unit="шт."
            value={zone.plumbingOldToiletsCount ?? 0}
            onChange={(plumbingOldToiletsCount) => onPatch({ plumbingOldToiletsCount })}
          />
          <NumberField
            label="Старые раковины"
            unit="шт."
            value={zone.plumbingOldSinksCount ?? 0}
            onChange={(plumbingOldSinksCount) => onPatch({ plumbingOldSinksCount })}
          />
          <NumberField
            label="Старые ванны"
            unit="шт."
            value={zone.plumbingOldBathtubsCount ?? 0}
            onChange={(plumbingOldBathtubsCount) => onPatch({ plumbingOldBathtubsCount })}
          />
          <NumberField
            label="Старые смесители"
            unit="шт."
            value={zone.plumbingOldMixersCount ?? 0}
            onChange={(plumbingOldMixersCount) => onPatch({ plumbingOldMixersCount })}
          />
        </div>
      </details>
      <div className={styles.field}>
        <span className={styles.label}>Как заполнять выводы воды и канализации?</span>
        <EstimateSelect
          value={zone.plumbingPointsMode ?? 'manual'}
          ariaLabel="Способ заполнения сантехнических выводов"
          options={[
            { value: 'fixtures', label: 'По списку приборов · типовая схема' },
            { value: 'manual', label: 'Вручную по схеме объекта' },
          ]}
          onChange={(next) =>
            onPatch(
              patchPlumbingFixturePoints(zone, {
                plumbingPointsMode: next as 'fixtures' | 'manual',
              }),
            )
          }
        />
        <p className={styles.measureHint}>
          Типовая схема: раковина, ванна и душ — по 2 вывода воды и 1 сливу; унитаз и машины — по 1
          выводу и сливу. Бойлер, полотенцесушитель, общие подключения и другие исключения уточните
          вручную. Изменение выводов переключает ручной режим.
        </p>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Тип унитазов в помещении</span>
        <EstimateSelect
          value={zone.plumbingToiletMount ?? 'unknown'}
          options={[
            { value: 'unknown', label: 'Пока не выбран / разные типы — рамы вручную' },
            { value: 'floor', label: 'Напольные · без новых рам' },
            { value: 'installation', label: 'Подвесные · нужна новая рама на каждый' },
            { value: 'existing', label: 'Подвесные · рамы уже установлены' },
          ]}
          ariaLabel="Тип установки унитазов"
          onChange={(next) =>
            onPatch(
              patchPlumbingFixturePoints(zone, {
                plumbingToiletMount: next as EstimateZone['plumbingToiletMount'],
              }),
            )
          }
        />
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Смесители и новые инсталляции</span>
        <EstimateSelect
          value={zone.plumbingFixtureCountsMode ?? 'manual'}
          options={[
            { value: 'auto', label: 'По приборам · отдельный смеситель на раковину, ванну и душ' },
            { value: 'manual', label: 'Вручную · общие/встроенные смесители или разные типы' },
          ]}
          ariaLabel="Расчёт смесителей и инсталляций"
          onChange={(next) =>
            onPatch(
              patchPlumbingFixturePoints(zone, {
                plumbingFixtureCountsMode: next as 'auto' | 'manual',
              }),
            )
          }
        />
        <p className={styles.measureHint}>
          Типовой расчёт: раковина + ванна + душ = смесители. Общий смеситель ванны и раковины,
          готовая кабина или встроенная система требуют ручной правки. Новые рамы считаются только
          при явном выборе подвесных унитазов с новой рамой. Изменение этих количеств включает
          ручной режим этой группы.
        </p>
      </div>
      <PlumbingMeasureGroups
        values={{
          plumbingWaterPointsCount: zone.plumbingWaterPointsCount,
          plumbingSewerPointsCount: zone.plumbingSewerPointsCount,
          plumbingWaterPipeLength: zone.plumbingWaterPipeLength,
          plumbingSewerPipeLength: zone.plumbingSewerPipeLength,
          plumbingCollectorsCount: zone.plumbingCollectorsCount,
          plumbingToiletsCount: zone.plumbingToiletsCount,
          plumbingSinksCount: zone.plumbingSinksCount,
          plumbingBathtubsCount: zone.plumbingBathtubsCount,
          plumbingShowersCount: zone.plumbingShowersCount,
          plumbingMixersCount: zone.plumbingMixersCount,
          plumbingInstallationsCount: zone.plumbingInstallationsCount,
          plumbingDrainsCount: zone.plumbingDrainsCount,
          plumbingWasherConnectionsCount: zone.plumbingWasherConnectionsCount,
          plumbingDishwasherConnectionsCount: zone.plumbingDishwasherConnectionsCount,
          plumbingWaterHeatersCount: zone.plumbingWaterHeatersCount,
          plumbingTowelWarmersCount: zone.plumbingTowelWarmersCount,
          plumbingWarmFloorArea: zone.plumbingWarmFloorArea,
        }}
        onChange={(patch) => onPatch(patchPlumbingFixturePoints(zone, patch))}
      />
    </>
  )
}

type PlumbingMeasureValues = {
  plumbingWaterPointsCount: number
  plumbingSewerPointsCount: number
  plumbingWaterPipeLength: number
  plumbingSewerPipeLength: number
  plumbingCollectorsCount: number
  plumbingToiletsCount: number
  plumbingSinksCount: number
  plumbingBathtubsCount: number
  plumbingShowersCount: number
  plumbingMixersCount: number
  plumbingInstallationsCount: number
  plumbingDrainsCount: number
  plumbingWasherConnectionsCount: number
  plumbingDishwasherConnectionsCount: number
  plumbingWaterHeatersCount: number
  plumbingTowelWarmersCount: number
  plumbingWarmFloorArea: number
}

function PlumbingMeasureGroups(props: {
  values: PlumbingMeasureValues
  onChange: (patch: Partial<PlumbingMeasureValues>) => void
}) {
  const { values, onChange } = props
  return (
    <div className={styles.measureGroups}>
      <div className={styles.measureGroup}>
        <p className={styles.measureGroupTitle}>Приборы</p>
        <div className={styles.grid}>
          <NumberField
            label="Унитазы"
            unit="шт."
            value={values.plumbingToiletsCount}
            onChange={(plumbingToiletsCount) => onChange({ plumbingToiletsCount })}
          />
          <NumberField
            label="Раковины"
            unit="шт."
            value={values.plumbingSinksCount}
            onChange={(plumbingSinksCount) => onChange({ plumbingSinksCount })}
          />
          <NumberField
            label="Ванны"
            unit="шт."
            value={values.plumbingBathtubsCount}
            onChange={(plumbingBathtubsCount) => onChange({ plumbingBathtubsCount })}
          />
          <NumberField
            label="Души"
            unit="шт."
            value={values.plumbingShowersCount}
            onChange={(plumbingShowersCount) => onChange({ plumbingShowersCount })}
          />
          <NumberField
            label="Смесители"
            unit="шт."
            value={values.plumbingMixersCount}
            onChange={(plumbingMixersCount) => onChange({ plumbingMixersCount })}
          />
          <NumberField
            label="Инсталляции"
            unit="шт."
            value={values.plumbingInstallationsCount}
            onChange={(plumbingInstallationsCount) => onChange({ plumbingInstallationsCount })}
          />
          <NumberField
            label="Трапы"
            unit="шт."
            value={values.plumbingDrainsCount}
            onChange={(plumbingDrainsCount) => onChange({ plumbingDrainsCount })}
          />
          <NumberField
            label="Стир. машина"
            unit="шт."
            value={values.plumbingWasherConnectionsCount}
            onChange={(plumbingWasherConnectionsCount) =>
              onChange({ plumbingWasherConnectionsCount })
            }
          />
          <NumberField
            label="Посудомойка"
            unit="шт."
            value={values.plumbingDishwasherConnectionsCount}
            onChange={(plumbingDishwasherConnectionsCount) =>
              onChange({ plumbingDishwasherConnectionsCount })
            }
          />
          <NumberField
            label="Водонагреватели"
            unit="шт."
            value={values.plumbingWaterHeatersCount}
            onChange={(plumbingWaterHeatersCount) => onChange({ plumbingWaterHeatersCount })}
          />
          <NumberField
            label="Полотенцесушители"
            unit="шт."
            value={values.plumbingTowelWarmersCount}
            onChange={(plumbingTowelWarmersCount) => onChange({ plumbingTowelWarmersCount })}
          />
        </div>
      </div>

      <div className={styles.measureGroup}>
        <p className={styles.measureGroupTitle}>Точки</p>
        <div className={styles.grid}>
          <NumberField
            label="Водорозетки"
            unit="шт."
            value={values.plumbingWaterPointsCount}
            onChange={(plumbingWaterPointsCount) => onChange({ plumbingWaterPointsCount })}
          />
          <NumberField
            label="Выводы канализации"
            unit="шт."
            value={values.plumbingSewerPointsCount}
            onChange={(plumbingSewerPointsCount) => onChange({ plumbingSewerPointsCount })}
          />
        </div>
      </div>

      <div className={styles.measureGroup}>
        <p className={styles.measureGroupTitle}>Трассы</p>
        <div className={styles.grid}>
          <NumberField
            label="Трубы воды"
            unit="м. пог."
            value={values.plumbingWaterPipeLength}
            onChange={(plumbingWaterPipeLength) => onChange({ plumbingWaterPipeLength })}
          />
          <NumberField
            label="Трубы канализации"
            unit="м. пог."
            value={values.plumbingSewerPipeLength}
            onChange={(plumbingSewerPipeLength) => onChange({ plumbingSewerPipeLength })}
          />
        </div>
      </div>

      <div className={styles.measureGroup}>
        <p className={styles.measureGroupTitle}>Коллектор / учёт</p>
        <div className={styles.grid}>
          <NumberField
            label="Коллекторы"
            unit="шт."
            value={values.plumbingCollectorsCount}
            onChange={(plumbingCollectorsCount) => onChange({ plumbingCollectorsCount })}
          />
        </div>
      </div>

      <div className={styles.measureGroup}>
        <p className={styles.measureGroupTitle}>Водяной тёплый пол</p>
        <div className={styles.grid}>
          <NumberField
            label="Водяной ТП"
            unit="м²"
            value={values.plumbingWarmFloorArea}
            onChange={(plumbingWarmFloorArea) => onChange({ plumbingWarmFloorArea })}
          />
        </div>
      </div>
    </div>
  )
}

function NumberField(props: {
  disabled?: boolean
  label: string
  unit: string
  value: number
  onChange: (value: number) => void
}) {
  const id = useId()
  const hint = MEASURE_FIELD_HINTS[props.label]
  return (
    <div className={styles.field}>
      <span className={styles.label}>
        <label htmlFor={id}>{props.label}</label>
        <span className={styles.unit}>{props.unit}</span>
        {hint ? <EstimateFieldHint label={props.label} text={hint} /> : null}
      </span>
      <EstimateNumberInput
        id={id}
        disabled={props.disabled}
        className={styles.control}
        value={props.value}
        onValueChange={props.onChange}
      />
    </div>
  )
}
