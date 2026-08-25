import { FloorEstimateIntro } from './FloorEstimateIntro'
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

      <FloorEstimateTable
        lines={editor.lines}
        onToggle={editor.toggleLine}
        onPatchLine={editor.patchLine}
      />

      <FloorEstimateTotals selectedCount={editor.selectedCount} totalRub={editor.totalRub} />
    </>
  )
}
