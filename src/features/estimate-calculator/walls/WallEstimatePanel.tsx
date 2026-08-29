import { useMemo } from 'react'

import { groupWallEstimateLines, type EstimateLine } from '@/entities/estimate'

import type { WallScenarioDraftState } from '../model/estimate-calculator-persistence'
import { EstimateGroupedTable } from '../ui/EstimateGroupedTable'
import { EstimateManualLine } from '../ui/EstimateManualLine'
import { WallEstimateHelpers } from './WallEstimateHelpers'
import { WallEstimateInputs } from './WallEstimateInputs'
import { WallEstimateScenarios } from './WallEstimateScenarios'
import type { WallEstimateEditor } from './use-wall-estimate-editor'
import styles from '../ui/EstimateCalculatorWorkspace.module.scss'

type WallEstimatePanelProps = {
  editor: WallEstimateEditor
  scenarioDraft: WallScenarioDraftState
  onScenarioDraftChange: (patch: Partial<WallScenarioDraftState>) => void
  onResetSection: () => void
}

export function WallEstimatePanel({
  editor,
  scenarioDraft,
  onScenarioDraftChange,
  onResetSection,
}: WallEstimatePanelProps) {
  const groups = useMemo(() => groupWallEstimateLines(editor.lines), [editor.lines])

  return (
    <div className={styles.workspace}>
      <div className={styles.zone}>
        <WallEstimateInputs input={editor.input} onChange={editor.patchInput} />
      </div>

      <div className={styles.zoneAlt}>
        <WallEstimateScenarios
          draft={scenarioDraft}
          onDraftChange={onScenarioDraftChange}
          onApplyScenario={editor.applyScenario}
        />
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
          onReset={onResetSection}
        />
        <EstimateManualLine titleId="wall-estimate-manual-title" onAdd={editor.addManualLine} />
      </div>

      <div className={styles.zoneAlt}>
        <EstimateGroupedTable
          idPrefix="wall-estimate"
          title="Строки сметы — стены"
          groups={groups}
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
