import { useMemo } from 'react'

import { groupFloorEstimateLines, type EstimateLine, type EstimateZone } from '@/entities/estimate'
import type { FloorEstimateEditor } from '@/features/floor-estimate/model/use-floor-estimate-editor'
import { FloorEstimateHelpers } from '@/features/floor-estimate/ui/FloorEstimateHelpers'
import { FloorEstimatePresets } from '@/features/floor-estimate/ui/FloorEstimatePresets'

import type { FloorPresetDraftState } from '../model/estimate-calculator-persistence'
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
  onResetAll: () => void
}

export function FloorEstimatePanel({
  editor,
  zones,
  onZonesChange,
  onDeleteZone,
  presetDraft,
  onPresetDraftChange,
  onResetAll,
}: FloorEstimatePanelProps) {
  const groups = useMemo(() => groupFloorEstimateLines(editor.lines), [editor.lines])

  return (
    <div className={styles.workspace}>
      <div className={styles.zone}>
        <EstimateZonesAndMeasures
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
          draft={presetDraft}
          onDraftChange={onPresetDraftChange}
          zones={zones}
          demolitionArea={editor.input.demolitionArea}
          screedArea={editor.input.screedArea}
          totalFloorArea={editor.input.totalFloorArea}
          wetZonesArea={editor.input.wetZonesArea}
          onApplyPreset={editor.applyPreset}
        />
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
      </div>

      <div className={styles.zoneAlt}>
        <EstimateSectionLines
          idPrefix="floor-estimate"
          title="Строки сметы — полы"
          pricePanel={
            <FloorZoneWorkAdd
              zones={zones}
              onZonesChange={onZonesChange}
              embedded
              onAdd={editor.addZonedLine}
            />
          }
          manualPanel={
            <EstimateManualLine
              titleId="floor-estimate-manual-title"
              embedded
              onAdd={editor.addManualLine}
            />
          }
        >
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
