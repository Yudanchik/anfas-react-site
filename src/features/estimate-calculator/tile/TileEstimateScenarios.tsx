import { useMemo, useState } from 'react'

import {
  TILE_PRICE_MAPPING,
  resolveTileScenarioKeys,
  formatTileScenarioLabel,
  formatTileScenarioZoneMismatchMessage,
  isTileScenarioAllowedForZone,
  resolveTileScenarioOptionsForZone,
  type EstimateZone,
  type EstimateLine,
  type TileCladFormatOption,
  type TileDemolitionSurfacesOption,
  type TileEstimateInput,
  type TileGroutOption,
  type TileScenarioApplication,
  type TileStateOption,
} from '@/entities/estimate'

import type { TileScenarioDraftState } from '../model/estimate-calculator-persistence'
import { useEstimateStatusMessage } from '../model/use-estimate-status-message'
import {
  canApplyTileScenario,
  validateTileScenarioMeasures,
} from '../model/validate-scenario-measures'
import { ALL_SCENARIO_ROOMS } from '../model/room-scenario-status'
import { useRoomScenarioBatch } from '../model/use-room-scenario-batch'
import { EstimateScenarioRooms } from '../ui/EstimateScenarioRooms'
import { EstimateScenarioWizard } from '../ui/EstimateScenarioWizard'
import { EstimateSelect } from '../ui/EstimateSelect'
import { formatTileScenarioTargetLabel } from './format-tile-scenario-target-label'
import styles from '../ui/EstimateScenarioWizard.module.scss'

export { formatTileScenarioTargetLabel } from './format-tile-scenario-target-label'

type TileEstimateScenariosProps = {
  draft: TileScenarioDraftState
  onDraftChange: (patch: Partial<TileScenarioDraftState>) => void
  lines?: readonly EstimateLine[]
  onZonesChange?: (zones: EstimateZone[]) => void
  zones?: readonly EstimateZone[]
  generalInput: TileEstimateInput
  feedbackEpoch?: number
  onApplyScenario: (
    application: TileScenarioApplication,
    target?: { zone?: EstimateZone },
  ) => {
    label: string
    addedCount: number
    zoneName?: string
    error?: string
  }
}

const CLAD_FORMAT_OPTIONS: ReadonlyArray<{ value: TileCladFormatOption; label: string }> = [
  { value: '301-1300', label: '301–1300' },
  { value: '1301-1700', label: '1301–1700' },
  { value: '1701-3600', label: '1701–3600' },
  { value: 'over-3600', label: '>3600' },
  { value: 'mosaic', label: 'Мозаика' },
  { value: 'small-format', label: 'Мелкоштучка' },
]

const GROUT_OPTIONS: ReadonlyArray<{ value: TileGroutOption; label: string }> = [
  { value: 'cement', label: 'Цементная' },
  { value: 'epoxy', label: 'Эпоксидная' },
  { value: 'none', label: 'Без затирки / ремонт' },
]

const DEMOLITION_SURFACES_OPTIONS: ReadonlyArray<{
  value: TileDemolitionSurfacesOption
  label: string
}> = [
  { value: 'both', label: 'Пол и стены' },
  { value: 'floor', label: 'Только пол' },
  { value: 'walls', label: 'Только стены' },
]

function showsCladFormat(state: TileStateOption): boolean {
  return (
    state === 'bathroom-from-scratch' ||
    state === 'bathroom-replacement' ||
    state === 'floor-only' ||
    state === 'walls-only' ||
    state === 'kitchen-backsplash' ||
    state === 'large-format'
  )
}

function showsGrout(state: TileStateOption): boolean {
  return (
    state === 'bathroom-from-scratch' ||
    state === 'bathroom-replacement' ||
    state === 'floor-only' ||
    state === 'walls-only' ||
    state === 'grout-repair-only'
  )
}

function showsDemolitionSurfaces(state: TileStateOption): boolean {
  return state === 'demolition-only'
}

function resolveCompatibleState(
  state: TileStateOption,
  zoneType: EstimateZone['zoneType'] | null,
): TileStateOption {
  if (isTileScenarioAllowedForZone(state, zoneType)) return state
  const { primary } = resolveTileScenarioOptionsForZone(zoneType, false)
  return primary[0]?.id ?? 'floor-only'
}

export function TileEstimateScenarios({
  draft,
  onDraftChange,
  zones = [],
  lines = [],
  onZonesChange,
  generalInput,
  feedbackEpoch,
  onApplyScenario,
}: TileEstimateScenariosProps) {
  const { state, preparation, cladFormat, grout, demolitionSurfaces } = draft
  const [targetId, setTargetId] = useState('')
  const { status, setSuccess, setError } = useEstimateStatusMessage({
    clearTokens: [targetId, feedbackEpoch ?? 0, zones.length],
  })

  const targetOptions = useMemo(
    () => [
      { value: ALL_SCENARIO_ROOMS, label: `Все помещения · ${zones.length}` },
      ...zones.map((zone) => ({
        value: zone.id,
        label: formatTileScenarioTargetLabel(zone),
      })),
    ],
    [zones],
  )
  const resolvedTargetId = targetOptions.some((option) => option.value === targetId)
    ? targetId
    : (zones[0]?.id ?? '')
  const selectedZone =
    resolvedTargetId === ALL_SCENARIO_ROOMS
      ? zones[0]
      : zones.find((zone) => zone.id === resolvedTargetId)
  const filterZoneType =
    resolvedTargetId === ALL_SCENARIO_ROOMS ? null : selectedZone ? selectedZone.zoneType : null
  const { primary } = resolveTileScenarioOptionsForZone(filterZoneType, false)
  const stateOptions = primary.map((option) => ({ value: option.id, label: option.label }))
  const compatibleState = resolveCompatibleState(state, filterZoneType)

  const showClad = showsCladFormat(compatibleState)
  const showGrout = showsGrout(compatibleState)
  const showDemoSurfaces = showsDemolitionSurfaces(compatibleState)

  const application: TileScenarioApplication = {
    state: compatibleState,
    preparation: showClad ? preparation : undefined,
    cladFormat: showClad ? cladFormat : undefined,
    grout: showGrout ? grout : undefined,
    demolitionSurfaces: showDemoSurfaces ? demolitionSurfaces : undefined,
  }

  const zoneFitOk = isTileScenarioAllowedForZone(application.state, filterZoneType)
  const measureCheck = validateTileScenarioMeasures({
    application,
    input: generalInput,
    zone: selectedZone,
  })
  const canApply =
    Boolean(selectedZone) &&
    zoneFitOk &&
    canApplyTileScenario({
      application,
      input: generalInput,
      zone: selectedZone,
    })
  const applyDisabledHint = !zoneFitOk
    ? formatTileScenarioZoneMismatchMessage(application.state)
    : canApply
      ? null
      : measureCheck.ok
        ? null
        : measureCheck.message

  const previewLabel = formatTileScenarioLabel(application)
  const mappingById = new Map(TILE_PRICE_MAPPING.map((item) => [item.id, item]))
  const previewKeys = resolveTileScenarioKeys(application)

  function syncStateForZoneType(zoneType: EstimateZone['zoneType'] | null) {
    if (isTileScenarioAllowedForZone(state, zoneType)) return
    const next = resolveCompatibleState(state, zoneType)
    if (next === state) return
    const patch: Partial<TileScenarioDraftState> = { state: next }
    if (next === 'large-format' && cladFormat === '301-1300') {
      patch.cladFormat = '1701-3600'
    }
    onDraftChange(patch)
  }

  const batch = useRoomScenarioBatch({
    section: 'tile',
    zones,
    lines,
    targetId: resolvedTargetId,
    onZonesChange,
    setSuccess,
    setError,
    check: (zone) => validateTileScenarioMeasures({ application, input: generalInput, zone }),
    apply: (zone) => onApplyScenario(application, { zone }),
  })
  function handleApply() {
    return batch.apply()
  }

  return (
    <EstimateScenarioWizard
      key={`${resolvedTargetId}:${feedbackEpoch ?? 0}`}
      roomOverview={<EstimateScenarioRooms batch={batch} onSelect={setTargetId} />}
      applyLabel={batch.applyLabel}
      allRooms={batch.all}
      title="Сценарий плитки"
      context={
        batch.all ? (
          `Один набор ответов для всех ${zones.length} помещений. Замеры берутся отдельно из каждого.`
        ) : selectedZone ? (
          <>
            Помещение: <strong>{selectedZone.name}</strong>
          </>
        ) : (
          'Сначала добавьте помещение в блоке замеров.'
        )
      }
      steps={[
        {
          label: 'помещение и исходные работы',
          title: 'Что будем делать и где?',
          blockedReason: selectedZone ? undefined : 'Сначала добавьте помещение.',
          content: (
            <>
              {selectedZone ? (
                <div className={styles.targetRow}>
                  <span className={styles.targetLabel}>Применить к</span>
                  <EstimateSelect
                    value={resolvedTargetId}
                    options={targetOptions}
                    ariaLabel="Применить сценарий плитки к"
                    onChange={(next) => {
                      setTargetId(next)
                      const zone = zones.find((entry) => entry.id === next)
                      syncStateForZoneType(zone ? zone.zoneType : null)
                    }}
                  />
                </div>
              ) : (
                <p className={styles.applyHint}>Добавьте помещение в блоке замеров выше.</p>
              )}{' '}
              <div className={styles.field}>
                <span>Сценарий</span>
                <EstimateSelect
                  value={compatibleState}
                  options={stateOptions}
                  ariaLabel="Сценарий плитки"
                  onChange={(nextValue) => {
                    const next = nextValue as TileStateOption
                    if (!isTileScenarioAllowedForZone(next, filterZoneType)) {
                      setError(formatTileScenarioZoneMismatchMessage(next))
                      return
                    }
                    const patch: Partial<TileScenarioDraftState> = { state: next }
                    if (next === 'large-format' && cladFormat === '301-1300') {
                      patch.cladFormat = '1701-3600'
                    }
                    onDraftChange(patch)
                  }}
                />
              </div>
            </>
          ),
        },
        {
          label: 'параметры работ',
          title: 'Уточните выбранные работы',
          content: (
            <>
              {showClad ? (
                <div className={styles.field}>
                  <span>Основание уже подготовлено под плитку?</span>
                  <EstimateSelect
                    value={preparation}
                    options={[
                      { value: 'inspect', label: 'Пока не проверено' },
                      { value: 'prepare', label: 'Нет · добавить обеспыливание и грунтование' },
                      { value: 'ready', label: 'Да · не считать подготовку повторно' },
                    ]}
                    ariaLabel="Подготовка основания под плитку"
                    onChange={(next) => onDraftChange({ preparation: next as TileScenarioDraftState['preparation'] })}
                  />
                  <p className={styles.applyHint}>
                    Если пол и стены подготовлены по-разному, примените маршруты для них отдельно.
                    Гидроизоляция учитывается в разделе «Полы».
                  </p>
                </div>
              ) : null}
              {' '}
              {showClad ? (
                <div className={styles.field}>
                  <span>Формат облицовки</span>
                  <EstimateSelect
                    value={cladFormat}
                    options={CLAD_FORMAT_OPTIONS}
                    ariaLabel="Формат облицовки"
                    onChange={(next) => onDraftChange({ cladFormat: next as TileCladFormatOption })}
                  />
                </div>
              ) : null}
              {showGrout ? (
                <div className={styles.field}>
                  <span>
                    {compatibleState === 'grout-repair-only' ? 'Затирка / ремонт' : 'Затирка'}
                  </span>
                  <EstimateSelect
                    value={grout}
                    options={
                      compatibleState === 'grout-repair-only'
                        ? GROUT_OPTIONS
                        : GROUT_OPTIONS.filter((option) => option.value !== 'none')
                    }
                    ariaLabel="Затирка"
                    onChange={(next) => onDraftChange({ grout: next as TileGroutOption })}
                  />
                </div>
              ) : null}
              {showDemoSurfaces ? (
                <div className={styles.field}>
                  <span>Демонтаж плитки</span>
                  <EstimateSelect
                    value={demolitionSurfaces}
                    options={DEMOLITION_SURFACES_OPTIONS}
                    ariaLabel="Поверхности демонтажа плитки"
                    onChange={(next) =>
                      onDraftChange({
                        demolitionSurfaces: next as TileDemolitionSurfacesOption,
                      })
                    }
                  />
                </div>
              ) : null}
            </>
          ),
        },
        {
          label: 'проверка работ',
          title: 'Добавить предложенные работы?',
          content: (
            <p className={styles.applyHint}>
              Проверьте список справа. Новые работы добавятся для выбранного помещения. Уже
              добавленные одинаковые позиции обновятся; дополнительные строки сохранятся.
            </p>
          ),
        },
      ]}
      preview={
        <>
          {' '}
          <p className={styles.hydroHint}>Будет применено: {previewLabel}</p>
          <ul>
            {previewKeys.map((key) => (
              <li key={key}>{mappingById.get(key)?.title ?? key}</li>
            ))}
          </ul>
          <p className={styles.applyHint}>Гидроизоляция добавляется в разделе «Полы».</p>
          {!batch.all && applyDisabledHint ? (
            <p className={styles.applyHint}>{applyDisabledHint}</p>
          ) : null}
        </>
      }
      canApply={batch.canApply}
      disabledHint={
        batch.all
          ? batch.canApply
            ? null
            : 'Нет помещений с подходящими замерами.'
          : applyDisabledHint
      }
      onApply={handleApply}
      status={
        status ? (
          <p className={styles.status} data-kind={status.kind} role="status" aria-live="polite">
            {status.message}
          </p>
        ) : null
      }
    />
  )
}
