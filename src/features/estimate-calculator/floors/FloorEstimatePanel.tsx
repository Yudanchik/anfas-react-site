import { useMemo } from 'react'

import {
  getDefaultOpenFloorGroupIds,
  groupFloorEstimateLines,
  type EstimateLine,
} from '@/entities/estimate'
import type { FloorEstimateEditor } from '@/features/floor-estimate'
import { FloorEstimateHelpers } from '@/features/floor-estimate'
import { FloorEstimateInputs } from '@/features/floor-estimate'
import { FloorEstimatePresets } from '@/features/floor-estimate'

import { EstimateGroupedTable } from '../ui/EstimateGroupedTable'
import { EstimateManualLine } from '../ui/EstimateManualLine'
import styles from '../ui/EstimateCalculatorWorkspace.module.scss'

type FloorEstimatePanelProps = {
  editor: FloorEstimateEditor
}

export function FloorEstimatePanel({ editor }: FloorEstimatePanelProps) {
  const groups = useMemo(() => groupFloorEstimateLines(editor.lines), [editor.lines])
  const defaultOpenGroupIds = useMemo(() => getDefaultOpenFloorGroupIds(groups), [groups])

  return (
    <div className={styles.workspace}>
      <div className={styles.zone}>
        <FloorEstimateInputs input={editor.input} onChange={editor.patchInput} />
      </div>

      <div className={styles.zoneAlt}>
        <FloorEstimatePresets
          demolitionArea={editor.input.demolitionArea}
          screedArea={editor.input.screedArea}
          totalFloorArea={editor.input.totalFloorArea}
          wetZonesArea={editor.input.wetZonesArea}
          onApplyPreset={editor.applyPreset}
        />
      </div>

      <div className={styles.zone}>
        <FloorEstimateHelpers
          recommendation={editor.recommendation}
          totalFloorArea={editor.input.totalFloorArea}
          demolitionArea={editor.input.demolitionArea}
          screedArea={editor.input.screedArea}
          wetZonesArea={editor.input.wetZonesArea}
          onApplyTotalArea={editor.applyTotalArea}
          onApplyDemolitionArea={editor.applyDemolitionArea}
          onApplyScreedArea={editor.applyScreedArea}
          onApplyWetArea={editor.applyWetArea}
          onReset={editor.resetEstimate}
        />
        <EstimateManualLine titleId="floor-estimate-manual-title" onAdd={editor.addManualLine} />
      </div>

      <div className={styles.zoneAlt}>
        <EstimateGroupedTable
          idPrefix="floor-estimate"
          title="Строки сметы — полы"
          groups={groups}
          defaultOpenGroupIds={defaultOpenGroupIds}
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
