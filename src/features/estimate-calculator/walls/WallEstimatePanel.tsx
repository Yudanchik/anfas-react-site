import { useMemo, useState } from 'react'

import {
  groupWallEstimateLines,
  wallScenarioMeasureSignature,
  wallScenarioForZone,
  type EstimateLine,
  type EstimateZone,
  type WallPriceMappingItem,
  type WallScenarioApplication,
  type WallScenarioApplyMode,
} from '@/entities/estimate'

import { restoreWallScenarioDraft, type WallScenarioDraftState } from '../model/estimate-calculator-persistence'
import { EstimateGroupedTable } from '../ui/EstimateGroupedTable'
import { EstimateManualLine } from '../ui/EstimateManualLine'
import { EstimateSectionLines } from '../ui/EstimateSectionLines'
import { EstimateZonesAndMeasures } from '../ui/EstimateZonesAndMeasures'
import { WallEstimateScenarios } from './WallEstimateScenarios'
import { WallZoneWorkAdd } from './WallZoneWorkAdd'
import type { WallEstimateEditor } from './use-wall-estimate-editor'
import styles from '../ui/EstimateCalculatorWorkspace.module.scss'

type WallEstimatePanelProps = {
  editor: WallEstimateEditor
  zones: readonly EstimateZone[]
  onZonesChange: (zones: EstimateZone[]) => void
  onDeleteZone: (zoneId: string) => void
  scenarioDraft: WallScenarioDraftState
  onScenarioDraftChange: (patch: Partial<WallScenarioDraftState>) => void
  onResetSection: () => void
  globalFeedbackEpoch?: number
  mapping?: readonly WallPriceMappingItem[]
}

function nextScenarioApplications(zone: EstimateZone, application: WallScenarioApplication, mode: WallScenarioApplyMode) {
  if (mode === 'replace' || !zone.wallScenario) return [application]
  const previous = zone.wallScenario.applications ?? [zone.wallScenario.application]
  const signature = (value: WallScenarioApplication) => JSON.stringify(
    Object.entries(value).filter(([, answer]) => answer !== undefined)
      .sort(([left], [right]) => left.localeCompare(right)),
  )
  return previous.some((item) => signature(item) === signature(application))
    ? previous : [...previous, application].slice(-20)
}

export function WallEstimatePanel({
  editor,
  zones,
  onZonesChange,
  onDeleteZone,
  scenarioDraft,
  onScenarioDraftChange,
  globalFeedbackEpoch,
  mapping,
}: WallEstimatePanelProps) {
  const groups = useMemo(() => groupWallEstimateLines(editor.lines), [editor.lines])
  const [sectionFeedbackEpoch, setSectionFeedbackEpoch] = useState(0)
  const [scenarioStep, setScenarioStep] = useState<1 | 2 | 3>(1)
  const [scenarioTargetId, setScenarioTargetId] = useState(zones.at(-1)?.id ?? '')
  const feedbackEpoch = sectionFeedbackEpoch + (globalFeedbackEpoch ?? 0)

  function handleZonesChange(nextZones: EstimateZone[]) {
    const previousIds = new Set(zones.map((zone) => zone.id))
    const added = nextZones.filter((zone) => !previousIds.has(zone.id)).at(-1)
    if (added) {
      setScenarioTargetId(added.id)
      setScenarioStep(1)
      onScenarioDraftChange(restoreWallScenarioDraft(null))
      setSectionFeedbackEpoch((n) => n + 1)
    }
    onZonesChange(nextZones)
  }

  function handleScenarioTargetChange(targetId: string) {
    setScenarioTargetId(targetId)
    setScenarioStep(1)
    setSectionFeedbackEpoch((n) => n + 1)
    if (targetId === 'all') {
      onScenarioDraftChange(restoreWallScenarioDraft(null))
      return
    }
    const saved = zones.find((zone) => zone.id === targetId)?.wallScenario?.application
    const defaults = restoreWallScenarioDraft(null)
    onScenarioDraftChange(saved ? {
      ...defaults,
      state: saved.state,
      finishTarget: saved.finishTarget,
      demolitionCovering: saved.demolitionCovering ?? defaults.demolitionCovering,
      demolitionBeforeWork: saved.demolitionBeforeWork ?? false,
      wallpaperType: saved.wallpaperType ?? defaults.wallpaperType,
      paintLayers: saved.paintLayers ?? defaults.paintLayers,
      slopesWork: saved.slopesWork ?? defaults.slopesWork,
      substrate: saved.substrate ?? defaults.substrate,
      leveling: saved.leveling ?? defaults.leveling,
      moisture: saved.moisture ?? defaults.moisture,
      quality: saved.quality ?? defaults.quality,
      reinforce: saved.reinforce ?? defaults.reinforce,
      baseCondition: saved.baseCondition ?? defaults.baseCondition,
    } : defaults)
  }

  function handleApplyScenario(application: WallScenarioApplication, target?: { zone?: EstimateZone }, mode: WallScenarioApplyMode = 'add') {
    const effective = target?.zone ? wallScenarioForZone(application, target.zone) : application
    const result = editor.applyScenario(effective, target, mode)
    if (!result.error && target?.zone) {
      onZonesChange(zones.map((zone) => zone.id === target.zone?.id
        ? { ...zone, wallScenario: {
          application: effective,
          applications: nextScenarioApplications(zone, effective, mode),
          measureSignature: wallScenarioMeasureSignature(zone),
        } }
        : zone))
    }
    return result
  }

  function handleApplyToZones(application: WallScenarioApplication, targetZones: readonly EstimateZone[], mode: WallScenarioApplyMode = 'add') {
    const result = editor.applyScenarioToZones(application, targetZones, mode)
    if (!result.error) {
      const targetIds = new Set(targetZones.map((zone) => zone.id))
      onZonesChange(zones.map((zone) => targetIds.has(zone.id)
        ? { ...zone, wallScenario: {
          application: wallScenarioForZone(application, zone),
          applications: nextScenarioApplications(zone, wallScenarioForZone(application, zone), mode),
          measureSignature: wallScenarioMeasureSignature(zone),
        } }
        : zone))
      setScenarioStep(1)
      onScenarioDraftChange(restoreWallScenarioDraft(null))
    }
    return result
  }

  function handleDeleteZone(zoneId: string) {
    if (scenarioTargetId === zoneId) {
      setScenarioTargetId(zones.find((zone) => zone.id !== zoneId)?.id ?? '')
      setScenarioStep(1)
      setSectionFeedbackEpoch((n) => n + 1)
    }
    onDeleteZone(zoneId)
  }

  return (
    <div className={styles.workspace}>
      <div className={styles.zone}>
        <EstimateZonesAndMeasures
          section="walls"
          zones={zones}
          onZonesChange={handleZonesChange}
          onDeleteZone={handleDeleteZone}
          generalInput={editor.input}
          onGeneralChange={editor.patchInput}
          wallLines={editor.lines}
        />
      </div>

      <div className={styles.zoneAlt}>
        <WallEstimateScenarios
          draft={scenarioDraft}
          onDraftChange={onScenarioDraftChange}
          step={scenarioStep}
          onStepChange={setScenarioStep}
          targetId={scenarioTargetId}
          onTargetChange={handleScenarioTargetChange}
          zones={zones}
          generalInput={editor.input}
          wallLines={editor.lines}
          mapping={mapping}
          feedbackEpoch={feedbackEpoch}
          onApplyScenario={handleApplyScenario}
          onApplyToZones={handleApplyToZones}
        />
      </div>

      <div className={styles.zoneAlt}>
        <EstimateSectionLines
          idPrefix="wall-estimate"
          title="Строки сметы — стены"
          pricePanel={
            <WallZoneWorkAdd
              zones={zones}
              onZonesChange={handleZonesChange}
              embedded
              feedbackEpoch={feedbackEpoch}
              mapping={mapping}
              onAdd={editor.addZonedLine}
            />
          }
          manualPanel={
            <EstimateManualLine
              titleId="wall-estimate-manual-title"
              embedded
              feedbackEpoch={feedbackEpoch}
              onAdd={editor.addManualLine}
            />
          }
        >
          <EstimateGroupedTable
            idPrefix="wall-estimate"
            embedded
            groups={groups}
            onToggle={editor.toggleLine}
            onPatchLine={patchLineAdapter(editor.patchLine)}
            onRemoveManualLine={editor.removeManualLine}
          />
        </EstimateSectionLines>
      </div>
    </div>
  )
}

function patchLineAdapter(
  patchLine: WallEstimateEditor['patchLine'],
): (
  lineId: string,
  patch: Partial<Pick<EstimateLine, 'quantity' | 'unitPrice' | 'coefficient' | 'comment'>>,
) => void {
  return patchLine
}
