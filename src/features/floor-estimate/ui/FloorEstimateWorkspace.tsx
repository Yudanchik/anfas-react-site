import { FloorEstimateHelpers } from './FloorEstimateHelpers'
import { FloorEstimateInputs } from './FloorEstimateInputs'
import { FloorEstimateIntro } from './FloorEstimateIntro'
import { FloorEstimateManualLine } from './FloorEstimateManualLine'
import { FloorEstimateTable } from './FloorEstimateTable'
import { FloorEstimateTotals } from './FloorEstimateTotals'
import { useFloorEstimateEditor } from '../model/use-floor-estimate-editor'

export function FloorEstimateWorkspace() {
  const editor = useFloorEstimateEditor()

  return (
    <>
      <FloorEstimateIntro
        availableWorksCount={editor.lines.length}
        recommendation={editor.recommendation}
        selectedCount={editor.selectedCount}
        totalRub={editor.totalRub}
      />

      <FloorEstimateInputs input={editor.input} onChange={editor.patchInput} />

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

      <FloorEstimateManualLine onAdd={editor.addManualLine} />

      <FloorEstimateTable
        lines={editor.lines}
        onToggle={editor.toggleLine}
        onPatchLine={editor.patchLine}
      />

      <FloorEstimateTotals selectedCount={editor.selectedCount} totalRub={editor.totalRub} />
    </>
  )
}
