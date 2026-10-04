import { useMemo, useState } from 'react'

import {
  groupElectricEstimateLines,
  type ElectricPriceMappingItem,
  type EstimateLine,
  type EstimateZone,
} from '@/entities/estimate'

import type { ElectricScenarioDraftState } from '../model/estimate-calculator-persistence'
import { EstimateRoomQuickFill } from '../ui/EstimateRoomQuickFill'
import { EstimateGroupedTable } from '../ui/EstimateGroupedTable'
import { EstimateManualLine } from '../ui/EstimateManualLine'
import { EstimateSectionLines } from '../ui/EstimateSectionLines'
import { EstimateZonesAndMeasures } from '../ui/EstimateZonesAndMeasures'
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
          lines={editor.lines}
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
          idPrefix="electric-estimate"
          title="Строки сметы — электрика"
          pricePanel={
            <ElectricZoneWorkAdd
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
              titleId="electric-estimate-manual-title"
              embedded
              feedbackEpoch={feedbackEpoch}
              onAdd={editor.addManualLine}
            />
          }
        >
          <EstimateRoomQuickFill
            section="electrics"
            zones={zones}
            lines={editor.lines}
            onFill={editor.fillRoomWorkQuantities}
            onCatalogueFill={editor.fillCatalogueQuantities}
            onReset={handleReset}
          />
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
