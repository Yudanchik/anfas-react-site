import { useMemo, useState } from 'react'

import {
  groupCeilingEstimateLines,
  type CeilingPriceMappingItem,
  type EstimateLine,
  type EstimateZone,
} from '@/entities/estimate'

import type { CeilingScenarioDraftState } from '../model/estimate-calculator-persistence'
import { EstimateGroupedTable } from '../ui/EstimateGroupedTable'
import { EstimateManualLine } from '../ui/EstimateManualLine'
import { EstimateSectionLines } from '../ui/EstimateSectionLines'
import { EstimateZonesAndMeasures } from '../ui/EstimateZonesAndMeasures'
import { CeilingEstimateHelpers } from './CeilingEstimateHelpers'
import { CeilingEstimateScenarios } from './CeilingEstimateScenarios'
import { CeilingZoneWorkAdd } from './CeilingZoneWorkAdd'
import type { CeilingEstimateEditor } from './use-ceiling-estimate-editor'
import styles from '../ui/EstimateCalculatorWorkspace.module.scss'

type CeilingEstimatePanelProps = {
  editor: CeilingEstimateEditor
  zones: readonly EstimateZone[]
  onZonesChange: (zones: EstimateZone[]) => void
  onDeleteZone: (zoneId: string) => void
  scenarioDraft: CeilingScenarioDraftState
  onScenarioDraftChange: (patch: Partial<CeilingScenarioDraftState>) => void
  onResetSection: () => void
  globalFeedbackEpoch?: number
  mapping?: readonly CeilingPriceMappingItem[]
}

export function CeilingEstimatePanel({
  editor,
  zones,
  onZonesChange,
  onDeleteZone,
  scenarioDraft,
  onScenarioDraftChange,
  onResetSection,
  globalFeedbackEpoch,
  mapping,
}: CeilingEstimatePanelProps) {
  const groups = useMemo(() => groupCeilingEstimateLines(editor.lines), [editor.lines])
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
          section="ceilings"
          zones={zones}
          onZonesChange={onZonesChange}
          onDeleteZone={onDeleteZone}
          generalInput={editor.input}
          onGeneralChange={editor.patchInput}
        />
      </div>

      <div className={styles.zoneAlt}>
        <CeilingEstimateScenarios
          draft={scenarioDraft}
          onDraftChange={onScenarioDraftChange}
          zones={zones}
          generalInput={editor.input}
          feedbackEpoch={feedbackEpoch}
          onApplyScenario={editor.applyScenario}
        />
      </div>

      <div className={styles.zone}>
        <CeilingEstimateHelpers
          totalCeilingArea={editor.input.totalCeilingArea}
          demolitionArea={editor.input.demolitionArea}
          plasterArea={editor.input.plasterArea}
          puttyArea={editor.input.puttyArea}
          finishArea={editor.input.finishArea}
          onApplyTotalArea={editor.applyTotalArea}
          onApplyDemolitionArea={editor.applyDemolitionArea}
          onApplyPlasterArea={editor.applyPlasterArea}
          onApplyPuttyArea={editor.applyPuttyArea}
          onApplyFinishArea={editor.applyFinishArea}
          onReset={handleReset}
        />
      </div>

      <div className={styles.zoneAlt}>
        <EstimateSectionLines
          idPrefix="ceiling-estimate"
          title="Строки сметы — потолки"
          pricePanel={
            <CeilingZoneWorkAdd
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
              titleId="ceiling-estimate-manual-title"
              embedded
              feedbackEpoch={feedbackEpoch}
              onAdd={editor.addManualLine}
            />
          }
        >
          <EstimateGroupedTable
            idPrefix="ceiling-estimate"
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
  patchLine: CeilingEstimateEditor['patchLine'],
): (
  lineId: string,
  patch: Partial<Pick<EstimateLine, 'quantity' | 'unitPrice' | 'coefficient' | 'comment'>>,
) => void {
  return patchLine
}
