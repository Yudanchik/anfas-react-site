import { useMemo } from 'react'

import { groupFloorEstimateLines, type EstimateLine } from '@/entities/estimate'
import type { FloorEstimateEditor } from '@/features/floor-estimate/model/use-floor-estimate-editor'
import { FloorEstimateHelpers } from '@/features/floor-estimate/ui/FloorEstimateHelpers'
import { FloorEstimateInputs } from '@/features/floor-estimate/ui/FloorEstimateInputs'
import { FloorEstimatePresets } from '@/features/floor-estimate/ui/FloorEstimatePresets'

import type { FloorPresetDraftState } from '../model/estimate-calculator-persistence'
import { EstimateGroupedTable } from '../ui/EstimateGroupedTable'
import { EstimateManualLine } from '../ui/EstimateManualLine'
import { FloorZoneWorkAdd } from './FloorZoneWorkAdd'
import styles from '../ui/EstimateCalculatorWorkspace.module.scss'

type FloorEstimatePanelProps = {
  editor: FloorEstimateEditor
  presetDraft: FloorPresetDraftState
  onPresetDraftChange: (patch: Partial<FloorPresetDraftState>) => void
  onResetAll: () => void
}

export function FloorEstimatePanel({
  editor,
  presetDraft,
  onPresetDraftChange,
  onResetAll,
}: FloorEstimatePanelProps) {
  const groups = useMemo(() => groupFloorEstimateLines(editor.lines), [editor.lines])

  return (
    <div className={styles.workspace}>
      <div className={styles.zone}>
        <FloorEstimateInputs input={editor.input} onChange={editor.patchInput} />
      </div>

      <div className={styles.zoneAlt}>
        <FloorEstimatePresets
          draft={presetDraft}
          onDraftChange={onPresetDraftChange}
          demolitionArea={editor.input.demolitionArea}
          screedArea={editor.input.screedArea}
          totalFloorArea={editor.input.totalFloorArea}
          wetZonesArea={editor.input.wetZonesArea}
          onApplyPreset={editor.applyPreset}
        />
        <FloorZoneWorkAdd onAdd={editor.addZonedLine} />
      </div>

      <div className={styles.zone}>
        <FloorEstimateHelpers
          totalFloorArea={editor.input.totalFloorArea}
          demolitionArea={editor.input.demolitionArea}
          screedArea={editor.input.screedArea}
          wetZonesArea={editor.input.wetZonesArea}
          onApplyTotalArea={editor.applyTotalArea}
          onApplyDemolitionArea={editor.applyDemolitionArea}
          onApplyScreedArea={editor.applyScreedArea}
          onApplyWetArea={editor.applyWetArea}
          onReset={onResetAll}
        />
        <EstimateManualLine titleId="floor-estimate-manual-title" onAdd={editor.addManualLine} />
      </div>

      <div className={styles.zoneAlt}>
        <EstimateGroupedTable
          idPrefix="floor-estimate"
          title="Строки сметы — полы"
          groups={groups}
          onToggle={editor.toggleLine}
          onPatchLine={patchLineAdapter(editor.patchLine)}
        />
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
