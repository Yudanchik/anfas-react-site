import { useMemo } from 'react'

import { groupWallEstimateLines, type EstimateLine, type EstimateZone } from '@/entities/estimate'

import type { WallScenarioDraftState } from '../model/estimate-calculator-persistence'
import { EstimateGroupedTable } from '../ui/EstimateGroupedTable'
import { EstimateManualLine } from '../ui/EstimateManualLine'
import { EstimateSectionLines } from '../ui/EstimateSectionLines'
import { EstimateZonesAndMeasures } from '../ui/EstimateZonesAndMeasures'
import { WallEstimateHelpers } from './WallEstimateHelpers'
import { WallEstimateScenarios } from './WallEstimateScenarios'
import { WallZoneWorkAdd } from './WallZoneWorkAdd'
import type { WallEstimateEditor } from './use-wall-estimate-editor'
import styles from '../ui/EstimateCalculatorWorkspace.module.scss'

type WallEstimatePanelProps = {
  editor: WallEstimateEditor
  zones: readonly EstimateZone[]
  onZonesChange: (zones: EstimateZone[]) => void
  onDeleteZone: (zoneId: string) => void
  scenarioDraft: WallScenarioDraftState
  onScenarioDraftChange: (patch: Partial<WallScenarioDraftState>) => void
  onResetSection: () => void
}

export function WallEstimatePanel({
  editor,
  zones,
  onZonesChange,
  onDeleteZone,
  scenarioDraft,
  onScenarioDraftChange,
  onResetSection,
}: WallEstimatePanelProps) {
  const groups = useMemo(() => groupWallEstimateLines(editor.lines), [editor.lines])

  return (
    <div className={styles.workspace}>
      <div className={styles.zone}>
        <EstimateZonesAndMeasures
          section="walls"
          zones={zones}
          onZonesChange={onZonesChange}
          onDeleteZone={onDeleteZone}
          generalInput={editor.input}
          onGeneralChange={editor.patchInput}
        />
      </div>

      <div className={styles.zoneAlt}>
        <WallEstimateScenarios
          draft={scenarioDraft}
          onDraftChange={onScenarioDraftChange}
          zones={zones}
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
      </div>

      <div className={styles.zoneAlt}>
        <EstimateSectionLines
          idPrefix="wall-estimate"
          title="Строки сметы — стены"
          pricePanel={
            <WallZoneWorkAdd
              zones={zones}
              onZonesChange={onZonesChange}
              embedded
              onAdd={editor.addZonedLine}
            />
          }
          manualPanel={
            <EstimateManualLine
              titleId="wall-estimate-manual-title"
              embedded
              onAdd={editor.addManualLine}
            />
          }
        >
          <EstimateGroupedTable
            idPrefix="wall-estimate"
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
  patchLine: WallEstimateEditor['patchLine'],
): (
  lineId: string,
  patch: Partial<Pick<EstimateLine, 'quantity' | 'unitPrice' | 'coefficient' | 'comment'>>,
) => void {
  return patchLine
}
