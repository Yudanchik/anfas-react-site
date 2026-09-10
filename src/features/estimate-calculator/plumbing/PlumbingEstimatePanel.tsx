import { useMemo, useState } from 'react'

import {
  groupPlumbingEstimateLines,
  type EstimateLine,
  type EstimateZone,
  type PlumbingPriceMappingItem,
} from '@/entities/estimate'

import type { PlumbingScenarioDraftState } from '../model/estimate-calculator-persistence'
import { EstimateGroupedTable } from '../ui/EstimateGroupedTable'
import { EstimateManualLine } from '../ui/EstimateManualLine'
import { EstimateSectionLines } from '../ui/EstimateSectionLines'
import { EstimateZonesAndMeasures } from '../ui/EstimateZonesAndMeasures'
import { PlumbingEstimateHelpers } from './PlumbingEstimateHelpers'
import { PlumbingEstimateScenarios } from './PlumbingEstimateScenarios'
import { PlumbingZoneWorkAdd } from './PlumbingZoneWorkAdd'
import type { PlumbingEstimateEditor } from './use-plumbing-estimate-editor'
import styles from '../ui/EstimateCalculatorWorkspace.module.scss'

type PlumbingEstimatePanelProps = {
  editor: PlumbingEstimateEditor
  zones: readonly EstimateZone[]
  onZonesChange: (zones: EstimateZone[]) => void
  onDeleteZone: (zoneId: string) => void
  scenarioDraft: PlumbingScenarioDraftState
  onScenarioDraftChange: (patch: Partial<PlumbingScenarioDraftState>) => void
  onResetSection: () => void
  globalFeedbackEpoch?: number
  mapping?: readonly PlumbingPriceMappingItem[]
}

export function PlumbingEstimatePanel({
  editor,
  zones,
  onZonesChange,
  onDeleteZone,
  scenarioDraft,
  onScenarioDraftChange,
  onResetSection,
  globalFeedbackEpoch,
  mapping,
}: PlumbingEstimatePanelProps) {
  const groups = useMemo(() => groupPlumbingEstimateLines(editor.lines), [editor.lines])
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
          section="plumbing"
          zones={zones}
          onZonesChange={onZonesChange}
          onDeleteZone={onDeleteZone}
          generalInput={editor.input}
          onGeneralChange={editor.patchInput}
        />
      </div>

      <div className={styles.zoneAlt}>
        <PlumbingEstimateScenarios
          draft={scenarioDraft}
          onDraftChange={onScenarioDraftChange}
          zones={zones}
          generalInput={editor.input}
          feedbackEpoch={feedbackEpoch}
          onApplyScenario={editor.applyScenario}
        />
      </div>

      <div className={styles.zone}>
        <PlumbingEstimateHelpers
          plumbingWaterPipeLength={editor.input.plumbingWaterPipeLength}
          plumbingSewerPipeLength={editor.input.plumbingSewerPipeLength}
          plumbingWaterPointsCount={editor.input.plumbingWaterPointsCount}
          plumbingSewerPointsCount={editor.input.plumbingSewerPointsCount}
          plumbingWarmFloorArea={editor.input.plumbingWarmFloorArea}
          onApplyWaterPipeLength={editor.applyWaterPipeLength}
          onApplySewerPipeLength={editor.applySewerPipeLength}
          onApplyWaterPointsCount={editor.applyWaterPointsCount}
          onApplySewerPointsCount={editor.applySewerPointsCount}
          onApplyWarmFloorArea={editor.applyWarmFloorArea}
          onReset={handleReset}
        />
      </div>

      <div className={styles.zoneAlt}>
        <EstimateSectionLines
          idPrefix="plumbing-estimate"
          title="Строки сметы — сантехника"
          pricePanel={
            <PlumbingZoneWorkAdd
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
              titleId="plumbing-estimate-manual-title"
              embedded
              feedbackEpoch={feedbackEpoch}
              onAdd={editor.addManualLine}
            />
          }
        >
          <EstimateGroupedTable
            idPrefix="plumbing-estimate"
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
  patchLine: PlumbingEstimateEditor['patchLine'],
): (
  lineId: string,
  patch: Partial<Pick<EstimateLine, 'quantity' | 'unitPrice' | 'coefficient' | 'comment'>>,
) => void {
  return patchLine
}
