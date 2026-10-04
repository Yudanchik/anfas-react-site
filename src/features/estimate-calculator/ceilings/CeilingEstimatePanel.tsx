import { useMemo, useState } from 'react'

import {
  groupCeilingEstimateLines,
  type CeilingPriceMappingItem,
  type EstimateLine,
  type EstimateZone,
} from '@/entities/estimate'

import type { CeilingScenarioDraftState } from '../model/estimate-calculator-persistence'
import { EstimateRoomQuickFill } from '../ui/EstimateRoomQuickFill'
import { EstimateGroupedTable } from '../ui/EstimateGroupedTable'
import { EstimateManualLine } from '../ui/EstimateManualLine'
import { EstimateSectionLines } from '../ui/EstimateSectionLines'
import { EstimateZonesAndMeasures } from '../ui/EstimateZonesAndMeasures'
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
          lines={editor.lines}
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
          lines={editor.lines}
          onZonesChange={onZonesChange}
          draft={scenarioDraft}
          onDraftChange={onScenarioDraftChange}
          zones={zones}
          generalInput={editor.input}
          feedbackEpoch={feedbackEpoch}
          onApplyScenario={editor.applyScenario}
        />
      </div>

      <div className={styles.zoneAlt}>
        <EstimateSectionLines
          idPrefix="ceiling-estimate"
          title="Строки сметы — потолки"
          pricePanel={
            <CeilingZoneWorkAdd
              lines={editor.lines}
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
          <EstimateRoomQuickFill
            section="ceilings"
            zones={zones}
            lines={editor.lines}
            onFill={editor.fillRoomWorkQuantities}
            onCatalogueFill={editor.fillCatalogueQuantities}
            onReset={handleReset}
          />
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
