import { FloorEstimateHelpers } from './FloorEstimateHelpers'
import { FloorEstimateInputs } from './FloorEstimateInputs'
import { FloorEstimateIntro } from './FloorEstimateIntro'
import { FloorEstimateManualLine } from './FloorEstimateManualLine'
import { FloorEstimatePresets } from './FloorEstimatePresets'
import { FloorEstimateSummary } from './FloorEstimateSummary'
import { FloorEstimateTable } from './FloorEstimateTable'
import { useFloorEstimateEditor } from '../model/use-floor-estimate-editor'
import styles from './FloorEstimateWorkspace.module.scss'

export function FloorEstimateWorkspace() {
  const editor = useFloorEstimateEditor()

  return (
    <div className={styles.workspace}>
      <div className={styles.zone}>
        <FloorEstimateIntro
          availableWorksCount={editor.lines.length}
          recommendation={editor.recommendation}
          selectedCount={editor.selectedCount}
          totalRub={editor.totalRub}
        />
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
        <FloorEstimateManualLine onAdd={editor.addManualLine} />
      </div>

      <div className={styles.zoneAlt}>
        <FloorEstimateTable
          lines={editor.lines}
          onToggle={editor.toggleLine}
          onPatchLine={editor.patchLine}
        />
      </div>

      <div className={styles.zone}>
        <FloorEstimateSummary lines={editor.lines} totalRub={editor.totalRub} />
      </div>
    </div>
  )
}
