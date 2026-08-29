import { useEffect, useMemo, useRef, useState } from 'react'

import {
  buildFloorEstimateLines,
  buildWallEstimateLines,
  calculateEstimateTotal,
  FLOOR_PRICE_MAPPING,
  FLOOR_SECTION_ID,
  FLOOR_SECTION_TITLE,
  getFloorEstimateGroupTitle,
  getSelectedEstimateSections,
  getWallEstimateGroupTitle,
  resolveFloorEstimateGroupId,
  resolveWallEstimateGroupId,
  WALL_PRICE_MAPPING,
  WALL_SECTION_ID,
  WALL_SECTION_TITLE,
} from '@/entities/estimate'
import { useFloorEstimateEditor } from '@/features/floor-estimate/model/use-floor-estimate-editor'

import {
  buildEstimateCalculatorSnapshot,
  clearEstimateCalculatorSnapshot,
  DEFAULT_FLOOR_PRESETS,
  DEFAULT_WALL_SCENARIOS,
  EMPTY_FLOOR_INPUT,
  EMPTY_WALL_INPUT,
  readEstimateCalculatorSnapshot,
  restoreFloorEstimateState,
  restoreFloorPresetDraft,
  restoreWallEstimateState,
  restoreWallScenarioDraft,
  writeEstimateCalculatorSnapshot,
  type FloorPresetDraftState,
  type WallScenarioDraftState,
} from '../model/estimate-calculator-persistence'
import { FloorEstimatePanel } from '../floors/FloorEstimatePanel'
import { useWallEstimateEditor } from '../walls/use-wall-estimate-editor'
import { WallEstimatePanel } from '../walls/WallEstimatePanel'
import { EstimateCombinedSummary } from './EstimateCombinedSummary'
import { EstimateIntro } from './EstimateIntro'
import { EstimateTabs, type EstimateTabId } from './EstimateTabs'
import styles from './EstimateCalculatorWorkspace.module.scss'

export function EstimateCalculatorWorkspace() {
  const [initial] = useState(() => {
    const snapshot = readEstimateCalculatorSnapshot()
    return {
      snapshot,
      floors: restoreFloorEstimateState(snapshot),
      walls: restoreWallEstimateState(snapshot),
      floorPresets: restoreFloorPresetDraft(snapshot),
      wallScenarios: restoreWallScenarioDraft(snapshot),
      activeTab: (snapshot?.activeTab ?? 'floors') as EstimateTabId,
    }
  })

  const [activeTab, setActiveTab] = useState<EstimateTabId>(initial.activeTab)
  const [floorPresetDraft, setFloorPresetDraft] = useState<FloorPresetDraftState>(
    initial.floorPresets,
  )
  const [wallScenarioDraft, setWallScenarioDraft] = useState<WallScenarioDraftState>(
    initial.wallScenarios,
  )

  const floors = useFloorEstimateEditor(initial.floors)
  const walls = useWallEstimateEditor(initial.walls)
  const skipFirstPersist = useRef(true)

  useEffect(() => {
    if (skipFirstPersist.current) {
      skipFirstPersist.current = false
      return
    }

    writeEstimateCalculatorSnapshot(
      buildEstimateCalculatorSnapshot({
        activeTab,
        floorsInput: floors.input,
        floorsLines: floors.lines,
        wallsInput: walls.input,
        wallsLines: walls.lines,
        floorPresets: floorPresetDraft,
        wallScenarios: wallScenarioDraft,
      }),
    )
  }, [
    activeTab,
    floors.input,
    floors.lines,
    walls.input,
    walls.lines,
    floorPresetDraft,
    wallScenarioDraft,
  ])

  function resetAllEstimate() {
    clearEstimateCalculatorSnapshot()
    setActiveTab('floors')
    setFloorPresetDraft({ ...DEFAULT_FLOOR_PRESETS })
    setWallScenarioDraft({ ...DEFAULT_WALL_SCENARIOS })
    floors.replaceEstimate({
      input: { ...EMPTY_FLOOR_INPUT },
      lines: buildFloorEstimateLines(EMPTY_FLOOR_INPUT),
    })
    walls.replaceEstimate({
      input: { ...EMPTY_WALL_INPUT },
      lines: buildWallEstimateLines(EMPTY_WALL_INPUT),
    })
  }

  function resetWallsSection() {
    walls.resetEstimate()
    setWallScenarioDraft({ ...DEFAULT_WALL_SCENARIOS })
  }

  const selectedSections = useMemo(
    () =>
      getSelectedEstimateSections([
        {
          sectionId: FLOOR_SECTION_ID,
          sectionTitle: 'Полы',
          lines: floors.lines,
          resolveGroupTitle: (line) =>
            getFloorEstimateGroupTitle(resolveFloorEstimateGroupId(line)),
        },
        {
          sectionId: WALL_SECTION_ID,
          sectionTitle: 'Стены',
          lines: walls.lines,
          resolveGroupTitle: (line) => getWallEstimateGroupTitle(resolveWallEstimateGroupId(line)),
        },
      ]),
    [floors.lines, walls.lines],
  )

  const grandTotalRub = useMemo(
    () =>
      calculateEstimateTotal([
        { id: FLOOR_SECTION_ID, title: FLOOR_SECTION_TITLE, lines: floors.lines },
        { id: WALL_SECTION_ID, title: WALL_SECTION_TITLE, lines: walls.lines },
      ]),
    [floors.lines, walls.lines],
  )

  return (
    <div className={styles.workspace}>
      <div className={styles.zone}>
        <EstimateIntro
          floorsSelectedCount={floors.selectedCount}
          wallsSelectedCount={walls.selectedCount}
          floorsTotalRub={floors.totalRub}
          wallsTotalRub={walls.totalRub}
          grandTotalRub={grandTotalRub}
          floorsMappingCount={FLOOR_PRICE_MAPPING.length}
          wallsMappingCount={WALL_PRICE_MAPPING.length}
        />
        <EstimateTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div
        id="estimate-panel-floors"
        role="tabpanel"
        aria-labelledby="estimate-tab-floors"
        hidden={activeTab !== 'floors'}
      >
        <FloorEstimatePanel
          editor={floors}
          presetDraft={floorPresetDraft}
          onPresetDraftChange={(patch) =>
            setFloorPresetDraft((prev) => ({ ...prev, ...patch }))
          }
          onResetAll={resetAllEstimate}
        />
      </div>

      <div
        id="estimate-panel-walls"
        role="tabpanel"
        aria-labelledby="estimate-tab-walls"
        hidden={activeTab !== 'walls'}
      >
        <WallEstimatePanel
          editor={walls}
          scenarioDraft={wallScenarioDraft}
          onScenarioDraftChange={(patch) =>
            setWallScenarioDraft((prev) => ({ ...prev, ...patch }))
          }
          onResetSection={resetWallsSection}
        />
      </div>

      <div className={styles.zone}>
        <EstimateCombinedSummary sections={selectedSections} grandTotalRub={grandTotalRub} />
      </div>
    </div>
  )
}
