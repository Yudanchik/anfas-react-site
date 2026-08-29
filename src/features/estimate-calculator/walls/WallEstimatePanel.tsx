import { useMemo } from 'react'

import {
  getDefaultOpenWallGroupIds,
  groupWallEstimateLines,
  type EstimateLine,
} from '@/entities/estimate'

import { EstimateGroupedTable } from '../ui/EstimateGroupedTable'
import { EstimateManualLine } from '../ui/EstimateManualLine'
import { WallEstimateHelpers } from './WallEstimateHelpers'
import { WallEstimateInputs } from './WallEstimateInputs'
import { WallEstimateScenarios } from './WallEstimateScenarios'
import type { WallEstimateEditor } from './use-wall-estimate-editor'
import styles from '../ui/EstimateCalculatorWorkspace.module.scss'

type WallEstimatePanelProps = {
  editor: WallEstimateEditor
}

export function WallEstimatePanel({ editor }: WallEstimatePanelProps) {
  const groups = useMemo(() => groupWallEstimateLines(editor.lines), [editor.lines])
  const defaultOpenGroupIds = useMemo(() => getDefaultOpenWallGroupIds(groups), [groups])

  return (
    <div className={styles.workspace}>
      <div className={styles.zone}>
        <WallEstimateInputs input={editor.input} onChange={editor.patchInput} />
      </div>

      <div className={styles.zoneAlt}>
        <WallEstimateScenarios onApplyScenario={editor.applyScenario} />
      </div>

      <div className={styles.zone}>
        <WallEstimateHelpers
          totalWallArea={editor.input.totalWallArea}
          demolitionArea={editor.input.demolitionArea}
          plasterArea={editor.input.plasterArea}
          puttyArea={editor.input.puttyArea}
          finishArea={editor.input.finishArea}
          slopesLengthM={editor.input.slopesLengthM}
          cornersLengthM={editor.input.cornersLengthM}
          onApplyTotalArea={editor.applyTotalArea}
          onApplyDemolitionArea={editor.applyDemolitionArea}
          onApplyPlasterArea={editor.applyPlasterArea}
          onApplyPuttyArea={editor.applyPuttyArea}
          onApplyFinishArea={editor.applyFinishArea}
          onApplyLinearMeters={editor.applyLinearMeters}
          onReset={editor.resetEstimate}
        />
        <EstimateManualLine titleId="wall-estimate-manual-title" onAdd={editor.addManualLine} />
      </div>

      <div className={styles.zoneAlt}>
        <EstimateGroupedTable
          idPrefix="wall-estimate"
          title="Строки сметы — стены"
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
  patchLine: WallEstimateEditor['patchLine'],
): (
  lineId: string,
  patch: Partial<Pick<EstimateLine, 'quantity' | 'unitPrice' | 'coefficient' | 'comment'>>,
) => void {
  return patchLine
}
