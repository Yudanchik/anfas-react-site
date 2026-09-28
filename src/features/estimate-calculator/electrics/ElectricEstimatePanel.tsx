import { useMemo, useState } from 'react'

import {
  groupElectricEstimateLines,
  type ElectricPriceMappingItem,
  type EstimateLine,
  type EstimateZone,
} from '@/entities/estimate'

import type { ElectricScenarioDraftState } from '../model/estimate-calculator-persistence'
import { EstimateGroupedTable } from '../ui/EstimateGroupedTable'
import { EstimateManualLine } from '../ui/EstimateManualLine'
import { EstimateSectionLines } from '../ui/EstimateSectionLines'
import { EstimateZonesAndMeasures } from '../ui/EstimateZonesAndMeasures'
import { ElectricEstimateHelpers } from './ElectricEstimateHelpers'
import { ElectricEstimateScenarios } from './ElectricEstimateScenarios'
import { ElectricZoneWorkAdd } from './ElectricZoneWorkAdd'
import type { ElectricEstimateEditor } from './use-electric-estimate-editor'
import styles from '../ui/EstimateCalculatorWorkspace.module.scss'

type ElectricEstimatePanelProps = {
  editor: ElectricEstimateEditor
  zones: readonly EstimateZone[]
  onZonesChange: (zones: EstimateZone[]) => void
  onDeleteZone: (zoneId: string) => void
  scenarioDraft: ElectricScenarioDraftState
  onScenarioDraftChange: (patch: Partial<ElectricScenarioDraftState>) => void
  onResetSection: () => void
  globalFeedbackEpoch?: number
  mapping?: readonly ElectricPriceMappingItem[]
}

export function ElectricEstimatePanel({
  editor,
  zones,
  onZonesChange,
  onDeleteZone,
  scenarioDraft,
  onScenarioDraftChange,
  onResetSection,
  globalFeedbackEpoch,
  mapping,
}: ElectricEstimatePanelProps) {
  const groups = useMemo(() => groupElectricEstimateLines(editor.lines), [editor.lines])
  const [sectionFeedbackEpoch, setSectionFeedbackEpoch] = useState(0)
  const feedbackEpoch = sectionFeedbackEpoch + (globalFeedbackEpoch ?? 0)

  function handleReset() {
    setSectionFeedbackEpoch((n) => n + 1)
    onResetSection()
  }

  return (
    <div className={styles.workspace}>
      <div className={styles.zone}>
        <EstimateZonesAndMeasures
          section="electrics"
          zones={zones}
          onZonesChange={onZonesChange}
          onDeleteZone={onDeleteZone}
          generalInput={editor.input}
          onGeneralChange={editor.patchInput}
        />
      </div>

      <div className={styles.zoneAlt}>
        <ElectricEstimateScenarios
          draft={scenarioDraft}
          onDraftChange={onScenarioDraftChange}
          zones={zones}
          generalInput={editor.input}
          feedbackEpoch={feedbackEpoch}
          onApplyScenario={editor.applyScenario}
        />
      </div>

      <div className={styles.zone}>
        <ElectricEstimateHelpers
          electricSocketsCount={editor.input.electricSocketsCount}
          electricSwitchesCount={editor.input.electricSwitchesCount}
          electricLightPointsCount={editor.input.electricLightPointsCount}
          electricStrobeLength={editor.input.electricStrobeLength}
          electricCableLength={editor.input.electricCableLength}
          electricWarmFloorArea={editor.input.electricWarmFloorArea}
          onApplySocketsCount={editor.applySocketsCount}
          onApplySwitchesCount={editor.applySwitchesCount}
          onApplyLightPointsCount={editor.applyLightPointsCount}
          onApplyStrobeLength={editor.applyStrobeLength}
          onApplyCableLength={editor.applyCableLength}
          onApplyWarmFloorArea={editor.applyWarmFloorArea}
          onReset={handleReset}
        />
      </div>

      <div className={styles.zoneAlt}>
        <EstimateSectionLines
          idPrefix="electric-estimate"
          title="Строки сметы — электрика"
          pricePanel={
            <ElectricZoneWorkAdd
              zones={zones}
              onZonesChange={onZonesChange}
              embedded
              feedbackEpoch={feedbackEpoch}
              mapping={mapping}
              onAdd={editor.addZonedLine}
            />
          }
          manualPanel={
            <EstimateManualLine
              titleId="electric-estimate-manual-title"
              embedded
              feedbackEpoch={feedbackEpoch}
              onAdd={editor.addManualLine}
            />
          }
        >
          <EstimateGroupedTable
            idPrefix="electric-estimate"
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
  patchLine: ElectricEstimateEditor['patchLine'],
): (
  lineId: string,
  patch: Partial<Pick<EstimateLine, 'quantity' | 'unitPrice' | 'coefficient' | 'comment'>>,
) => void {
  return patchLine
}
