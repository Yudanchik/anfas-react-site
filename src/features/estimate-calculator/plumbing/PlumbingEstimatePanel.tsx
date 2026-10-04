import { useMemo, useState } from 'react'

import {
  groupPlumbingEstimateLines,
  type EstimateLine,
  type EstimateZone,
  type PlumbingPriceMappingItem,
} from '@/entities/estimate'

import type { PlumbingScenarioDraftState } from '../model/estimate-calculator-persistence'
import { EstimateRoomQuickFill } from '../ui/EstimateRoomQuickFill'
import { EstimateGroupedTable } from '../ui/EstimateGroupedTable'
import { EstimateManualLine } from '../ui/EstimateManualLine'
import { EstimateSectionLines } from '../ui/EstimateSectionLines'
import { EstimateZonesAndMeasures } from '../ui/EstimateZonesAndMeasures'
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
          lines={editor.lines}
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
          idPrefix="plumbing-estimate"
          title="Строки сметы — сантехника"
          pricePanel={
            <PlumbingZoneWorkAdd
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
              titleId="plumbing-estimate-manual-title"
              embedded
              feedbackEpoch={feedbackEpoch}
              onAdd={editor.addManualLine}
            />
          }
        >
          <EstimateRoomQuickFill
            section="plumbing"
            zones={zones}
            lines={editor.lines}
            onFill={editor.fillRoomWorkQuantities}
            onCatalogueFill={editor.fillCatalogueQuantities}
            onReset={handleReset}
          />
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
