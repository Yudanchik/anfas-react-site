import { useMemo, useState } from 'react'

import {
  groupFloorEstimateLines,
  type EstimateLine,
  type EstimateZone,
  type FloorPriceMappingItem,
} from '@/entities/estimate'
import type { FloorEstimateEditor } from '@/features/floor-estimate/model/use-floor-estimate-editor'
import { FloorEstimatePresets } from '@/features/floor-estimate/ui/FloorEstimatePresets'

import type { FloorPresetDraftState } from '../model/estimate-calculator-persistence'
import { EstimateRoomQuickFill } from '../ui/EstimateRoomQuickFill'
import { EstimateGroupedTable } from '../ui/EstimateGroupedTable'
import { EstimateManualLine } from '../ui/EstimateManualLine'
import { EstimateSectionLines } from '../ui/EstimateSectionLines'
import { EstimateZonesAndMeasures } from '../ui/EstimateZonesAndMeasures'
import { FloorZoneWorkAdd } from './FloorZoneWorkAdd'
import styles from '../ui/EstimateCalculatorWorkspace.module.scss'

type FloorEstimatePanelProps = {
  editor: FloorEstimateEditor
  zones: readonly EstimateZone[]
  onZonesChange: (zones: EstimateZone[]) => void
  onDeleteZone: (zoneId: string) => void
  presetDraft: FloorPresetDraftState
  onPresetDraftChange: (patch: Partial<FloorPresetDraftState>) => void
  onResetSection: () => void
  globalFeedbackEpoch?: number
  mapping?: readonly FloorPriceMappingItem[]
}

export function FloorEstimatePanel({
  editor,
  zones,
  onZonesChange,
  onDeleteZone,
  presetDraft,
  onPresetDraftChange,
  onResetSection,
  globalFeedbackEpoch,
  mapping,
}: FloorEstimatePanelProps) {
  const groups = useMemo(() => groupFloorEstimateLines(editor.lines), [editor.lines])
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
          section="floors"
          zones={zones}
          onZonesChange={onZonesChange}
          onDeleteZone={onDeleteZone}
          generalInput={editor.input}
          onGeneralChange={editor.patchInput}
        />
      </div>

      <div className={styles.zoneAlt}>
        <FloorEstimatePresets
          lines={editor.lines}
          onZonesChange={onZonesChange}
          draft={presetDraft}
          onDraftChange={onPresetDraftChange}
          zones={zones}
          demolitionArea={editor.input.demolitionArea}
          screedArea={editor.input.screedArea}
          totalFloorArea={editor.input.totalFloorArea}
          wetZonesArea={editor.input.wetZonesArea}
          feedbackEpoch={feedbackEpoch}
          onApplyPreset={editor.applyPreset}
        />
      </div>

      <div className={styles.zoneAlt}>
        <EstimateSectionLines
          idPrefix="floor-estimate"
          title="Строки сметы — полы"
          pricePanel={
            <FloorZoneWorkAdd
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
              titleId="floor-estimate-manual-title"
              embedded
              feedbackEpoch={feedbackEpoch}
              onAdd={editor.addManualLine}
            />
          }
        >
          <EstimateRoomQuickFill
            section="floors"
            zones={zones}
            lines={editor.lines}
            onFill={editor.fillRoomWorkQuantities}
            onCatalogueFill={editor.fillCatalogueQuantities}
            onReset={handleReset}
          />
          <EstimateGroupedTable
            idPrefix="floor-estimate"
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
  patchLine: FloorEstimateEditor['patchLine'],
): (
  lineId: string,
  patch: Partial<Pick<EstimateLine, 'quantity' | 'unitPrice' | 'coefficient' | 'comment'>>,
) => void {
  return patchLine
}
