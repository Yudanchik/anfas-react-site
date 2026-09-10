import { useMemo, useState } from 'react'

import {
  groupTileEstimateLines,
  type EstimateLine,
  type EstimateZone,
  type TilePriceMappingItem,
} from '@/entities/estimate'

import type { TileScenarioDraftState } from '../model/estimate-calculator-persistence'
import { EstimateGroupedTable } from '../ui/EstimateGroupedTable'
import { EstimateManualLine } from '../ui/EstimateManualLine'
import { EstimateSectionLines } from '../ui/EstimateSectionLines'
import { EstimateZonesAndMeasures } from '../ui/EstimateZonesAndMeasures'
import { TileEstimateHelpers } from './TileEstimateHelpers'
import { TileEstimateScenarios } from './TileEstimateScenarios'
import { TileZoneWorkAdd } from './TileZoneWorkAdd'
import type { TileEstimateEditor } from './use-tile-estimate-editor'
import styles from '../ui/EstimateCalculatorWorkspace.module.scss'

type TileEstimatePanelProps = {
  editor: TileEstimateEditor
  zones: readonly EstimateZone[]
  onZonesChange: (zones: EstimateZone[]) => void
  onDeleteZone: (zoneId: string) => void
  scenarioDraft: TileScenarioDraftState
  onScenarioDraftChange: (patch: Partial<TileScenarioDraftState>) => void
  onResetSection: () => void
  globalFeedbackEpoch?: number
  mapping?: readonly TilePriceMappingItem[]
}

export function TileEstimatePanel({
  editor,
  zones,
  onZonesChange,
  onDeleteZone,
  scenarioDraft,
  onScenarioDraftChange,
  onResetSection,
  globalFeedbackEpoch,
  mapping,
}: TileEstimatePanelProps) {
  const groups = useMemo(() => groupTileEstimateLines(editor.lines), [editor.lines])
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
          section="tile"
          zones={zones}
          onZonesChange={onZonesChange}
          onDeleteZone={onDeleteZone}
          generalInput={editor.input}
          onGeneralChange={editor.patchInput}
        />
      </div>

      <div className={styles.zoneAlt}>
        <TileEstimateScenarios
          draft={scenarioDraft}
          onDraftChange={onScenarioDraftChange}
          zones={zones}
          generalInput={editor.input}
          feedbackEpoch={feedbackEpoch}
          onApplyScenario={editor.applyScenario}
        />
      </div>

      <div className={styles.zone}>
        <TileEstimateHelpers
          floorTileArea={editor.input.floorTileArea}
          wallTileArea={editor.input.wallTileArea}
          backsplashArea={editor.input.backsplashArea}
          cuttingLength={editor.input.cuttingLength}
          holesCount={editor.input.holesCount}
          onApplyCladArea={editor.applyCladArea}
          onApplyFloorArea={editor.applyFloorArea}
          onApplyWallArea={editor.applyWallArea}
          onApplyCuttingLength={editor.applyCuttingLength}
          onApplyHolesCount={editor.applyHolesCount}
          onReset={handleReset}
        />
      </div>

      <div className={styles.zoneAlt}>
        <EstimateSectionLines
          idPrefix="tile-estimate"
          title="Строки сметы — плитка"
          pricePanel={
            <TileZoneWorkAdd
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
              titleId="tile-estimate-manual-title"
              embedded
              feedbackEpoch={feedbackEpoch}
              onAdd={editor.addManualLine}
            />
          }
        >
          <EstimateGroupedTable
            idPrefix="tile-estimate"
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
  patchLine: TileEstimateEditor['patchLine'],
): (
  lineId: string,
  patch: Partial<Pick<EstimateLine, 'quantity' | 'unitPrice' | 'coefficient' | 'comment'>>,
) => void {
  return patchLine
}
