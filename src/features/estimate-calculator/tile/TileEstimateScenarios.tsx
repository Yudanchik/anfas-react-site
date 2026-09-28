import { useMemo, useState } from 'react'

import {
  ESTIMATE_GENERAL_WORKS_TITLE,
  formatTileScenarioFeedback,
  formatTileScenarioLabel,
  formatTileScenarioZoneFeedback,
  formatTileScenarioZoneMismatchMessage,
  isTileScenarioAllowedForZone,
  resolveTileScenarioOptionsForZone,
  type EstimateZone,
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
  getScenarioMeasuresDisabledHint,
  validateTileScenarioMeasures,
} from '../model/validate-scenario-measures'
import { EstimateSelect } from '../ui/EstimateSelect'
import { formatTileScenarioTargetLabel } from './format-tile-scenario-target-label'
import styles from './TileEstimateScenarios.module.scss'

export { formatTileScenarioTargetLabel } from './format-tile-scenario-target-label'

type TileEstimateScenariosProps = {
  draft: TileScenarioDraftState
  onDraftChange: (patch: Partial<TileScenarioDraftState>) => void
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

const GENERAL_TARGET = 'general'

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
  generalInput,
  feedbackEpoch,
  onApplyScenario,
}: TileEstimateScenariosProps) {
  const { state, cladFormat, grout, demolitionSurfaces } = draft
  const [targetId, setTargetId] = useState(GENERAL_TARGET)
  const { status, setSuccess, setError } = useEstimateStatusMessage({
    clearTokens: feedbackEpoch === undefined ? [] : [feedbackEpoch],
  })

  const targetOptions = useMemo(
    () => [
      { value: GENERAL_TARGET, label: ESTIMATE_GENERAL_WORKS_TITLE },
      ...zones.map((zone) => ({
        value: zone.id,
        label: formatTileScenarioTargetLabel(zone),
      })),
    ],
    [zones],
  )
  const resolvedTargetId = targetOptions.some((option) => option.value === targetId)
    ? targetId
    : GENERAL_TARGET
  const selectedZone = zones.find((zone) => zone.id === resolvedTargetId)
  const filterZoneType = selectedZone ? selectedZone.zoneType : null
  const { primary } = resolveTileScenarioOptionsForZone(filterZoneType, false)
  const stateOptions = primary.map((option) => ({ value: option.id, label: option.label }))
  const compatibleState = resolveCompatibleState(state, filterZoneType)

  const showClad = showsCladFormat(compatibleState)
  const showGrout = showsGrout(compatibleState)
  const showDemoSurfaces = showsDemolitionSurfaces(compatibleState)

  const application: TileScenarioApplication = {
    state: compatibleState,
    cladFormat: showClad ? cladFormat : undefined,
    grout: showGrout ? grout : undefined,
    demolitionSurfaces: showDemoSurfaces ? demolitionSurfaces : undefined,
  }

  const zoneFitOk = isTileScenarioAllowedForZone(application.state, filterZoneType)
  const canApply =
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
      : getScenarioMeasuresDisabledHint(Boolean(selectedZone))

  const previewLabel = formatTileScenarioLabel(application)

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

  function handleApply() {
    const check = validateTileScenarioMeasures({
      application,
      input: generalInput,
      zone: selectedZone,
    })
    if (!check.ok) {
      setError(check.message)
      return
    }

    const result = onApplyScenario(
      application,
      selectedZone ? { zone: selectedZone } : undefined,
    )
    if (result.error) {
      setError(result.error)
      return
    }
    setSuccess(
      result.zoneName
        ? formatTileScenarioZoneFeedback(result.label, result.zoneName, result.addedCount)
        : formatTileScenarioFeedback(result.label, result.addedCount),
    )
  }

  return (
    <section className={styles.wrap} aria-labelledby="tile-estimate-scenarios-title">
      <div className={styles.head}>
        <h2 className={styles.title} id="tile-estimate-scenarios-title">
          Сценарий плитки
        </h2>
        <p className={styles.lead}>
          Выберите сценарий и примените его к общим работам или конкретной зоне. Гидроизоляция —
          через раздел «Полы». После применения смету можно вручную уточнить.
        </p>
      </div>

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

      <div className={styles.grid}>
        <article className={`${styles.card} ${styles.cardAccent}`}>
          <div className={styles.cardTop}>
            <h3 className={styles.cardTitle}>Параметры сценария</h3>
            <span className={styles.badge}>Черновик</span>
          </div>

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

          {showClad ? (
            <div className={styles.field}>
              <span>Формат облицовки</span>
              <EstimateSelect
                value={cladFormat}
                options={CLAD_FORMAT_OPTIONS}
                ariaLabel="Формат облицовки"
                onChange={(next) =>
                  onDraftChange({ cladFormat: next as TileCladFormatOption })
                }
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

          <p className={styles.hydroHint}>Будет применено: {previewLabel}</p>

          <button
            type="button"
            className={styles.action}
            disabled={!canApply}
            onClick={handleApply}
          >
            Применить сценарий
          </button>
          {applyDisabledHint ? (
            <p className={styles.applyHint}>{applyDisabledHint}</p>
          ) : null}
        </article>
      </div>

      {status ? (
        <p className={styles.status} data-kind={status.kind} role="status" aria-live="polite">
          {status.message}
        </p>
      ) : null}
    </section>
  )
}
